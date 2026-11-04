import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User, Order, Address } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(['super_admin', 'customer_support', 'order_manager']);
    const { id } = await params;
    await connectDB();

    const customer = await User.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const [orders, addresses] = await Promise.all([
      Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(10).lean(),
      Address.find({ user: customer._id }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customer,
        orders,
        addresses,
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
