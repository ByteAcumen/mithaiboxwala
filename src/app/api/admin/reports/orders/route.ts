import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Order } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(['super_admin', 'order_manager']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    if (format === 'csv') {
      const headers = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Status', 'Payment Status', 'Subtotal', 'Discount', 'Grand Total'];
      const rows = orders.map((o: any) => [
        o.orderNumber,
        new Date(o.createdAt).toISOString().split('T')[0],
        `"${o.customerSnapshot?.name || ''}"`,
        o.customerSnapshot?.email || '',
        o.status,
        o.paymentStatus,
        o.subtotal,
        o.discountAmount,
        o.grandTotal,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: orders });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
