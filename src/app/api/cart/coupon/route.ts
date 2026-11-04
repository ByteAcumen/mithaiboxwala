import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Cart } from '@/models';
import { getCustomerSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { calculateCart } from '@/server/services/cart.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
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
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const calculated = await calculateCart(cart._id.toString(), code);
    if (calculated.couponError) {
      return NextResponse.json({ success: false, error: calculated.couponError }, { status: 400 });
    }

    cart.couponCode = code;
    await cart.save();

    return NextResponse.json({ success: true, data: calculated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
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
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    cart.couponCode = undefined;
    await cart.save();

    const calculated = await calculateCart(cart._id.toString());
    return NextResponse.json({ success: true, data: calculated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
