import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Coupon, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(['super_admin', 'marketing_manager']);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'update_coupon',
      resourceType: 'Coupon',
      resourceId: coupon._id.toString(),
      changes: body,
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminAuth(['super_admin', 'marketing_manager']);
    const { id } = await params;

    await connectDB();
    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'deactivate_coupon',
      resourceType: 'Coupon',
      resourceId: coupon._id.toString(),
    });

    return NextResponse.json({ success: true, message: 'Coupon deactivated successfully' });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
