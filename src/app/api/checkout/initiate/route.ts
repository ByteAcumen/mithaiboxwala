import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Cart } from '@/models';
import { getCustomerSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { initiateCheckout } from '@/server/services/order.service';
import { InitiateCheckoutSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = InitiateCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const session = await getCustomerSession();
    const cookieStore = await cookies();
    const guestId = cookieStore.get('mb_guest_id')?.value;

    let query: any = {};
    if (session) {
      query.user = session.user._id;
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const cart = await Cart.findOne(query);
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 });
    }

    const { contact, shippingAddress, billingAddress, couponCode } = parsed.data;

    const result = await initiateCheckout({
      cartId: cart._id.toString(),
      userId: session?.user._id?.toString(),
      contact,
      shippingAddress: shippingAddress as any,
      billingAddress: billingAddress as any,
      couponCode,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, validationErrors: result.validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        razorpayOrderId: result.razorpayOrderId,
        amount: result.amount,
        currency: result.currency,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
