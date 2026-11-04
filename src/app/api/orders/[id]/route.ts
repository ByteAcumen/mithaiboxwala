import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Order, Shipment } from '@/models';
import { requireCustomerAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireCustomerAuth();
    await connectDB();

    const order = await Order.findOne({
      _id: id,
      user: session.user._id,
    }).lean();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const shipment = await Shipment.findOne({ order: order._id }).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        shipment,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
