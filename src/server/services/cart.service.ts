/**
 * Server-side Cart Service
 * All pricing calculations happen here — never trust client prices.
 */

import { connectDB } from '@/lib/db/connect';
import { Cart, Product, Coupon, Inventory } from '@/models';
import mongoose from 'mongoose';

export interface CartCalculation {
  items: {
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    slug: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    moq: number;
    stockAvailable: boolean;
  }[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  couponError?: string;
  taxLines: { name: string; rate: number; amount: number }[];
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  isValid: boolean;
  errors: string[];
}

/**
 * Calculate the effective price for a product+quantity combination.
 * Applies bulk pricing tiers server-side.
 */
export function calculateEffectivePrice(
  basePrice: number,
  quantity: number,
  bulkTiers: { minQty: number; maxQty?: number; pricePerUnit: number }[]
): number {
  if (!bulkTiers || bulkTiers.length === 0) return basePrice;

  // Find the applicable tier (highest applicable minQty)
  const applicableTiers = bulkTiers
    .filter((t) => quantity >= t.minQty && (t.maxQty === undefined || quantity <= t.maxQty))
    .sort((a, b) => b.minQty - a.minQty);

  return applicableTiers.length > 0 ? applicableTiers[0].pricePerUnit : basePrice;
}

/**
 * Full server-side cart calculation.
 * Recalculates all prices from database values.
 * Never trusts prices stored in cart items.
 */
export async function calculateCart(
  cartId: string,
  couponCode?: string
): Promise<CartCalculation> {
  await connectDB();

  const cart = await Cart.findById(cartId).lean();
  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      discountAmount: 0,
      taxLines: [],
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
      isValid: false,
      errors: ['Cart not found'],
    };
  }

  const errors: string[] = [];
  const calculatedItems: CartCalculation['items'] = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product)
      .select('name slug sku basePrice salePrice bulkPricingTiers moq images isActive')
      .lean();

    if (!product || !product.isActive) {
      errors.push(`Product "${item.productSnapshot?.name ?? item.product}" is no longer available`);
      continue;
    }

    // Validate MOQ
    if (item.quantity < product.moq) {
      errors.push(
        `Minimum order quantity for "${product.name}" is ${product.moq} units`
      );
      continue;
    }

    // Check stock (if tracking is enabled)
    const inventory = await Inventory.findOne({ product: item.product, variant: item.variant ?? null }).lean();
    let stockAvailable = true;

    if (inventory && inventory.trackInventory) {
      const available = inventory.quantityOnHand - inventory.quantityReserved;
      if (available < item.quantity && !inventory.allowBackorder) {
        stockAvailable = false;
        errors.push(`"${product.name}" has insufficient stock (available: ${Math.max(0, available)})`);
      }
    }

    // Server-authoritative price calculation
    const effectiveBasePrice = product.salePrice ?? product.basePrice;
    const unitPrice = calculateEffectivePrice(
      effectiveBasePrice,
      item.quantity,
      product.bulkPricingTiers ?? []
    );
    const totalPrice = unitPrice * item.quantity;

    calculatedItems.push({
      productId: item.product.toString(),
      variantId: item.variant?.toString(),
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      imageUrl: product.images?.[0]?.url,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      moq: product.moq,
      stockAvailable,
    });
  }

  const subtotal = calculatedItems.reduce((sum, i) => sum + i.totalPrice, 0);
  let discountAmount = 0;
  let appliedCouponCode: string | undefined;
  let couponError: string | undefined;

  // Apply coupon if provided
  const activeCoupon = couponCode ?? cart.couponCode;
  if (activeCoupon) {
    const couponResult = await validateAndCalculateCoupon(activeCoupon, subtotal);
    if (couponResult.valid) {
      discountAmount = couponResult.discount;
      appliedCouponCode = activeCoupon;
    } else {
      couponError = couponResult.error;
    }
  }

  // Tax calculation (configurable — using 0% as placeholder until business confirms tax rates)
  // The business should configure applicable GST rates via admin settings
  const taxLines: CartCalculation['taxLines'] = [];
  const taxTotal = 0;

  // Shipping (configurable — per policy, shipping is extra and calculated separately)
  // Will be determined during checkout based on destination and order quantity
  const shippingTotal = 0; // Displayed as "calculated at checkout"

  const grandTotal = Math.max(0, subtotal - discountAmount + taxTotal + shippingTotal);

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    couponCode: appliedCouponCode,
    couponError,
    taxLines,
    taxTotal,
    shippingTotal,
    grandTotal,
    isValid: errors.length === 0 && calculatedItems.length > 0,
    errors,
  };
}

interface CouponValidationResult {
  valid: boolean;
  discount: number;
  error?: string;
}

export async function validateAndCalculateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): Promise<CouponValidationResult> {
  await connectDB();

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  }).lean();

  if (!coupon) {
    return { valid: false, discount: 0, error: 'Invalid coupon code' };
  }

  const now = new Date();

  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, discount: 0, error: 'Coupon is not yet active' };
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, discount: 0, error: 'Coupon has expired' };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
    };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
  }

  // Per-customer limit check would require CouponUsage collection lookup here
  // Implemented in the order creation service

  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }

  // Prevent negative totals
  discount = Math.min(discount, subtotal);

  return { valid: true, discount };
}

/**
 * Atomic inventory reservation for checkout.
 * Uses MongoDB atomic operations to prevent overselling.
 */
export async function reserveInventory(
  items: { productId: string; variantId?: string; quantity: number }[],
  session?: mongoose.ClientSession
): Promise<{ success: boolean; failedItem?: string }> {
  await connectDB();

  for (const item of items) {
    const query = {
      product: new mongoose.Types.ObjectId(item.productId),
      ...(item.variantId ? { variant: new mongoose.Types.ObjectId(item.variantId) } : { variant: null }),
      trackInventory: true,
    };

    // Atomic update: only succeeds if enough stock exists
    const result = await Inventory.findOneAndUpdate(
      {
        ...query,
        $expr: {
          $gte: [
            { $subtract: ['$quantityOnHand', '$quantityReserved'] },
            item.quantity,
          ],
        },
      },
      { $inc: { quantityReserved: item.quantity } },
      { session }
    );

    // If no document was found, either inventory doesn't track or stock is insufficient
    // Check which case it is
    const inv = await Inventory.findOne(query).session(session ?? null);
    if (inv && inv.trackInventory && !result) {
      const available = inv.quantityOnHand - inv.quantityReserved;
      return {
        success: false,
        failedItem: `Insufficient stock for product ${item.productId} (available: ${available})`,
      };
    }
  }

  return { success: true };
}

/**
 * Deduct reserved inventory after successful payment.
 */
export async function deductInventory(
  items: { productId: string; variantId?: string; quantity: number }[],
  session?: mongoose.ClientSession
): Promise<void> {
  await connectDB();

  for (const item of items) {
    await Inventory.findOneAndUpdate(
      {
        product: new mongoose.Types.ObjectId(item.productId),
        ...(item.variantId ? { variant: new mongoose.Types.ObjectId(item.variantId) } : { variant: null }),
        trackInventory: true,
      },
      {
        $inc: {
          quantityOnHand: -item.quantity,
          quantityReserved: -item.quantity,
        },
      },
      { session }
    );
  }
}

/**
 * Release reserved inventory if order is cancelled or payment fails.
 */
export async function releaseInventoryReservation(
  items: { productId: string; variantId?: string; quantity: number }[],
  session?: mongoose.ClientSession
): Promise<void> {
  await connectDB();

  for (const item of items) {
    await Inventory.findOneAndUpdate(
      {
        product: new mongoose.Types.ObjectId(item.productId),
        ...(item.variantId ? { variant: new mongoose.Types.ObjectId(item.variantId) } : { variant: null }),
        trackInventory: true,
      },
      { $inc: { quantityReserved: -item.quantity } },
      { session }
    );
  }
}
