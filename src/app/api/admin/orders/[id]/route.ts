import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Order, Shipment, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';
import { isValidOrderStatusTransition } from '@/server/services/order.service';
import { sendDispatchNotificationEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(['super_admin', 'order_manager', 'customer_support']);
    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id).lean();
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
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(['super_admin', 'order_manager']);
    const { id } = await params;
    const body = await request.json();
    const { status, note, courier, trackingNumber, trackingUrl } = body;

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status && status !== order.status) {
      if (!isValidOrderStatusTransition(order.status, status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status transition from ${order.status} to ${status}` },
          { status: 400 }
        );
      }

      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated by ${session.admin.name}`,
        updatedBy: session.admin.email,
      });

      if (status === 'shipped' && courier && trackingNumber) {
        await Shipment.findOneAndUpdate(
          { order: order._id },
          {
            courier,
            trackingNumber,
            trackingUrl,
            status: 'picked_up',
            dispatchedAt: new Date(),
          },
          { upsert: true }
        );

        try {
          await sendDispatchNotificationEmail(order.customerSnapshot.email, {
            customerName: order.customerSnapshot.name,
            orderNumber: order.orderNumber,
            courier,
            trackingNumber,
            trackingUrl,
          });
        } catch (emailErr) {
          console.error('[Dispatch Email Error]:', emailErr);
        }
      }
    }

    if (note && (!status || status === order.status)) {
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        note,
        updatedBy: session.admin.email,
      });
    }

    await order.save();

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'update_order_status',
      resourceType: 'Order',
      resourceId: order._id.toString(),
      changes: { newStatus: status, note },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
