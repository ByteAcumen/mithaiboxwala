import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Cart } from '@/models';
import { getCustomerSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';
import { calculateCart } from '@/server/services/cart.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const quantity = parseInt(body.quantity, 10);

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

    if (quantity <= 0) {
      cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
    } else {
      const item = cart.items.find((item: any) => item._id.toString() === itemId);
      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();
    const calculated = await calculateCart(cart._id.toString());
    return NextResponse.json({ success: true, data: calculated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
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

    cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
    await cart.save();
    const calculated = await calculateCart(cart._id.toString());
    return NextResponse.json({ success: true, data: calculated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
