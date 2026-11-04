import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Order, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';
import { releaseInventoryReservation } from '@/server/services/cart.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(['super_admin', 'order_manager']);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (!['pending_payment', 'confirmed', 'processing'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot cancel order in ${order.status} status` },
        { status: 400 }
      );
    }

    // Release reserved stock
    await releaseInventoryReservation(
      order.items.map((i: any) => ({
        productId: i.product.toString(),
        variantId: i.variant?.toString(),
        quantity: i.quantity,
      }))
    );

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || `Cancelled by admin ${session.admin.name}`,
      updatedBy: session.admin.email,
    });

    await order.save();

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'cancel_order',
      resourceType: 'Order',
      resourceId: order._id.toString(),
      changes: { reason },
    });

    return NextResponse.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
