import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { WholesaleEnquiry, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth(['super_admin', 'order_manager', 'customer_support']);
    const { id } = await params;
    await connectDB();

    const enquiry = await WholesaleEnquiry.findById(id)
      .populate('assignedTo', 'name email')
      .populate('categoryInterest', 'name')
      .lean();

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
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
    const session = await requireAdminAuth(['super_admin', 'order_manager', 'customer_support']);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const enquiry = await WholesaleEnquiry.findByIdAndUpdate(id, body, { new: true });
    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'update_enquiry',
      resourceType: 'WholesaleEnquiry',
      resourceId: enquiry._id.toString(),
      changes: body,
    });

    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
