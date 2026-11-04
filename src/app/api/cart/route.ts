import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db/connect';
import { getCustomerSession } from '@/lib/auth/session';
import { Cart, Product, Inventory } from '@/models';
import { AddToCartSchema } from '@/lib/validation/schemas';
import { calculateCart, calculateEffectivePrice } from '@/server/services/cart.service';
import mongoose from 'mongoose';

const GUEST_CART_COOKIE = 'mb_guest_id';
const CART_TTL_DAYS = 30;

async function getOrCreateCart(userId?: string, guestId?: string) {
  const filter = userId ? { user: new mongoose.Types.ObjectId(userId) } : { guestId };
  const expiresAt = new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000);

  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({ ...filter, items: [], expiresAt });
  } else {
    // Refresh TTL on activity
    cart.expiresAt = expiresAt;
    await cart.save();
  }
  return cart;
}

// ============================================================
// GET /api/cart — Get cart contents
// ============================================================
export async function GET(_request: NextRequest) {
  const requestId = nanoid(10);

  try {
    await connectDB();

    const session = await getCustomerSession();
    const cookieStore = await cookies();

    let userId: string | undefined;
    let guestId: string | undefined;

    if (session) {
      userId = session.user._id.toString();
    } else {
      guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
      if (!guestId) {
        // No cart yet — return empty
        return NextResponse.json(
          {
            success: true,
            data: {
              items: [],
              subtotal: 0,
              discountAmount: 0,
              couponCode: null,
              taxTotal: 0,
              shippingTotal: 0,
              grandTotal: 0,
              isValid: false,
              errors: [],
            },
          },
          { status: 200 }
        );
      }
    }

    const cart = await getOrCreateCart(userId, guestId);
    const calculation = await calculateCart(cart._id.toString());

    return NextResponse.json(
      {
        success: true,
        data: {
          cartId: cart._id.toString(),
          ...calculation,
          couponCode: calculation.couponCode ?? cart.couponCode ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/cart] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/cart — Add item to cart
// ============================================================
export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'invalid_body', message: 'Invalid JSON body.', requestId },
        { status: 400 }
      );
    }

    const parsed = AddToCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_failed',
          details: parsed.error.flatten().fieldErrors,
          requestId,
        },
        { status: 422 }
      );
    }

    const { productId, variantId, quantity } = parsed.data;

    if (!mongoose.isValidObjectId(productId)) {
      return NextResponse.json(
        { success: false, error: 'invalid_product', message: 'Invalid product ID.', requestId },
        { status: 400 }
      );
    }

    await connectDB();

    // Server-side product lookup — never trust client prices
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    })
      .select('name slug sku basePrice salePrice bulkPricingTiers moq images isActive')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Product not found or is unavailable.', requestId },
        { status: 404 }
      );
    }

    // Validate MOQ
    if (quantity < product.moq) {
      return NextResponse.json(
        {
          success: false,
          error: 'below_moq',
          message: `Minimum order quantity for "${product.name}" is ${product.moq} units.`,
          requestId,
        },
        { status: 400 }
      );
    }

    // Validate stock (if tracked)
    const inventory = await Inventory.findOne({
      product: product._id,
      variant: variantId ? new mongoose.Types.ObjectId(variantId) : null,
    }).lean();

    if (inventory?.trackInventory) {
      const available = inventory.quantityOnHand - inventory.quantityReserved;
      if (available < quantity && !inventory.allowBackorder) {
        return NextResponse.json(
          {
            success: false,
            error: 'out_of_stock',
            message: `Insufficient stock for "${product.name}". Available: ${Math.max(0, available)}.`,
            requestId,
          },
          { status: 409 }
        );
      }
    }

    // Calculate authoritative server-side unit price
    const effectiveBasePrice = product.salePrice ?? product.basePrice;
    const unitPrice = calculateEffectivePrice(effectiveBasePrice, quantity, product.bulkPricingTiers ?? []);

    const session = await getCustomerSession();
    const cookieStore = await cookies();

    let userId: string | undefined;
    let guestId: string | undefined;
    let newGuestId: string | undefined;

    if (session) {
      userId = session.user._id.toString();
    } else {
      guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
      if (!guestId) {
        newGuestId = nanoid(32);
        guestId = newGuestId;
      }
    }

    const cart = await getOrCreateCart(userId, guestId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (variantId ? item.variant?.toString() === variantId : !item.variant)
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity and recalculate price
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      const newUnitPrice = calculateEffectivePrice(effectiveBasePrice, newQty, product.bulkPricingTiers ?? []);
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].unitPrice = newUnitPrice;
    } else {
      // Add new item
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        variant: variantId ? new mongoose.Types.ObjectId(variantId) : undefined,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          slug: product.slug,
          imageUrl: product.images?.[0]?.url,
          moq: product.moq,
        },
        quantity,
        unitPrice,
        addedAt: new Date(),
      });
    }

    await cart.save();

    const calculation = await calculateCart(cart._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        data: {
          cartId: cart._id.toString(),
          ...calculation,
          couponCode: calculation.couponCode ?? cart.couponCode ?? null,
        },
      },
      { status: 200 }
    );

    // Set guest cookie if newly created
    if (newGuestId) {
      response.cookies.set(GUEST_CART_COOKIE, newGuestId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: CART_TTL_DAYS * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('[POST /api/cart] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
