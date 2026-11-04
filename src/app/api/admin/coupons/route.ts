import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Coupon, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';
import { CreateCouponSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    await requireAdminAuth(['super_admin', 'marketing_manager']);
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: coupons });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth(['super_admin', 'marketing_manager']);
    const body = await request.json();
    const parsed = CreateCouponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    await connectDB();

    const existing = await Coupon.findOne({ code: parsed.data.code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await Coupon.create({
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    });

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'create_coupon',
      resourceType: 'Coupon',
      resourceId: coupon._id.toString(),
      changes: parsed.data,
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
