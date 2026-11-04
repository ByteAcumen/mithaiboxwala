/**
 * Order Service
 * Creates and manages orders with immutable snapshots.
 */

import { connectDB } from '@/lib/db/connect';
import { Order, Payment, Cart, Coupon } from '@/models';
import { calculateCart, reserveInventory, deductInventory, releaseInventoryReservation } from './cart.service';
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/payments/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/email';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

interface CheckoutData {
  cartId: string;
  userId?: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  couponCode?: string;
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  error?: string;
  validationErrors?: string[];
}

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = nanoid(6).toUpperCase();
  return `MB-${dateStr}-${random}`;
}

/**
 * Initiate checkout: validate cart, create order, create Razorpay order.
 * Returns Razorpay order ID for client to open payment modal.
 */
export async function initiateCheckout(data: CheckoutData): Promise<CheckoutResult> {
  await connectDB();

  // 1. Calculate cart server-side
  const calculation = await calculateCart(data.cartId, data.couponCode);

  if (!calculation.isValid || calculation.errors.length > 0) {
    return {
      success: false,
      error: 'Cart validation failed',
      validationErrors: calculation.errors,
    };
  }

  if (calculation.items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }

  // 2. Reserve inventory atomically
  const inventoryResult = await reserveInventory(
    calculation.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }))
  );

  if (!inventoryResult.success) {
    return {
      success: false,
      error: inventoryResult.failedItem ?? 'Inventory reservation failed',
    };
  }

  // 3. Create order document (pending_payment)
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    customerSnapshot: {
      name: data.contact.name,
      email: data.contact.email,
      phone: data.contact.phone,
    },
    shippingAddressSnapshot: data.shippingAddress,
    billingAddressSnapshot: data.billingAddress ?? data.shippingAddress,
    items: calculation.items.map((i) => ({
      product: new mongoose.Types.ObjectId(i.productId),
      ...(i.variantId ? { variant: new mongoose.Types.ObjectId(i.variantId) } : {}),
      snapshot: {
        name: i.name,
        sku: i.sku,
        imageUrl: i.imageUrl,
        moq: i.moq,
      },
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
    subtotal: calculation.subtotal,
    discountAmount: calculation.discountAmount,
    couponCode: calculation.couponCode,
    taxLines: calculation.taxLines,
    taxTotal: calculation.taxTotal,
    shippingLines: [],
    shippingTotal: calculation.shippingTotal,
    grandTotal: calculation.grandTotal,
    status: 'pending_payment',
    statusHistory: [{ status: 'pending_payment', timestamp: new Date() }],
    paymentStatus: 'pending',
    guestEmail: !data.userId ? data.contact.email : undefined,
  });

  // 4. Create Razorpay order server-side
  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amount: Math.round(calculation.grandTotal * 100), // Convert to paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber,
        customerEmail: data.contact.email,
      },
    });
  } catch (err) {
    // Roll back: release inventory reservation and cancel order
    await releaseInventoryReservation(
      calculation.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      }))
    );
    await Order.findByIdAndUpdate(order._id, {
      status: 'cancelled',
      $push: { statusHistory: { status: 'cancelled', timestamp: new Date(), note: 'Payment provider order creation failed' } },
    });
    return {
      success: false,
      error: 'Payment initialization failed. Please try again.',
    };
  }

  // 5. Store Razorpay order ID in our order
  await Order.findByIdAndUpdate(order._id, {
    razorpayOrderId: razorpayOrder.id,
  });

  // 6. Create pending payment record
  await Payment.create({
    order: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    status: 'pending',
  });

  return {
    success: true,
    orderId: order._id.toString(),
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  };
}

/**
 * Verify payment and confirm order.
 * MUST be called server-side — never trust client for payment confirmation.
 */
export async function confirmPayment(data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId?: string;
}): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  // 1. Find the order
  const order = await Order.findById(data.orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  // 2. Verify order ownership (prevent unauthorized confirmation)
  if (data.userId && order.user && order.user.toString() !== data.userId) {
    return { success: false, error: 'Access denied' };
  }

  // 3. Check order is in pending_payment status
  if (order.status !== 'pending_payment') {
    // Idempotency: if already confirmed, return success
    if (order.status === 'confirmed') {
      return { success: true };
    }
    return { success: false, error: `Order cannot be confirmed in status: ${order.status}` };
  }

  // 4. Verify Razorpay order ID matches
  if (order.razorpayOrderId !== data.razorpayOrderId) {
    return { success: false, error: 'Payment verification failed' };
  }

  // 5. CRITICAL: Verify payment signature server-side
  let signatureValid: boolean;
  try {
    signatureValid = verifyPaymentSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    );
  } catch {
    return { success: false, error: 'Payment verification error' };
  }

  if (!signatureValid) {
    // Update payment record as failed
    await Payment.findOneAndUpdate(
      { razorpayOrderId: data.razorpayOrderId },
      { status: 'failed', failureReason: 'Invalid signature' }
    );
    return { success: false, error: 'Payment verification failed. Invalid signature.' };
  }

  // 6. Update order and payment atomically
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Update payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId: data.razorpayOrderId },
        {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: 'captured',
          capturedAt: new Date(),
        },
        { session }
      );

      // Confirm order
      await Order.findByIdAndUpdate(
        data.orderId,
        {
          status: 'confirmed',
          paymentStatus: 'paid',
          $push: {
            statusHistory: {
              status: 'confirmed',
              timestamp: new Date(),
              note: `Payment captured: ${data.razorpayPaymentId}`,
            },
          },
        },
        { session }
      );

      // Deduct inventory (convert reserved → actual deduction)
      for (const item of order.items) {
        await deductInventory(
          [{ productId: item.product.toString(), quantity: item.quantity }],
          session
        );
      }

      // Increment coupon usage
      if (order.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: order.couponCode },
          { $inc: { usedCount: 1 } },
          { session }
        );
      }
    });

    // 7. Send confirmation email (outside transaction)
    try {
      const shippingAddr = order.shippingAddressSnapshot;
      const addressStr = [
        shippingAddr.addressLine1,
        shippingAddr.addressLine2,
        `${shippingAddr.city}, ${shippingAddr.state} - ${shippingAddr.pincode}`,
        shippingAddr.country,
      ]
        .filter(Boolean)
        .join(', ');

      await sendOrderConfirmationEmail(order.customerSnapshot.email, {
        orderNumber: order.orderNumber,
        customerName: order.customerSnapshot.name,
        grandTotal: order.grandTotal,
        items: order.items.map((i) => ({
          name: i.snapshot.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        shippingAddress: addressStr,
      });
    } catch (emailErr) {
      // Email failure is non-critical — order is confirmed regardless
      console.error('[Order Service] Failed to send confirmation email:', emailErr);
    }

    // 8. Clear cart
    await Cart.findOneAndUpdate(
      { user: order.user ?? null },
      { $set: { items: [], couponCode: null } }
    );

    return { success: true };
  } catch (err) {
    console.error('[Order Service] Payment confirmation failed:', err);
    return { success: false, error: 'Order confirmation failed. Please contact support.' };
  } finally {
    await session.endSession();
  }
}

/**
 * Order state machine — valid transitions.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: ['refund_pending'],
  cancelled: [],
  refund_pending: ['refunded', 'confirmed'],
  refunded: [],
};

export function isValidOrderStatusTransition(from: string, to: string): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}
