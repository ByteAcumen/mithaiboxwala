import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { StoreSettings, AuditLog } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';
import { BUSINESS } from '@/lib/constants';

export async function GET() {
  try {
    await requireAdminAuth();
    await connectDB();

    let settings = await StoreSettings.find().lean();
    if (settings.length === 0) {
      // Seed default settings from confirmed business details
      const defaults = [
        { key: 'business_info', value: BUSINESS, label: 'Business Profile & Contact', group: 'general' },
        { key: 'shipping_rules', value: { dispatchDays: 2, minFreeShipping: 5000 }, label: 'Shipping Rules', group: 'shipping' },
        { key: 'tax_settings', value: { gstRate: 18, inclusive: true }, label: 'GST Tax Settings', group: 'tax' },
      ];
      await StoreSettings.insertMany(defaults);
      settings = await StoreSettings.find().lean();
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminAuth(['super_admin']);
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key is required' }, { status: 400 });
    }

    await connectDB();
    const setting = await StoreSettings.findOneAndUpdate(
      { key },
      { value, updatedBy: session.admin._id },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      adminId: session.admin._id,
      adminEmail: session.admin.email,
      action: 'update_setting',
      resourceType: 'StoreSettings',
      resourceId: key,
      changes: { value },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
