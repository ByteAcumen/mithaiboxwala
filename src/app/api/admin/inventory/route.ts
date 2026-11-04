import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Inventory, Product } from '@/models';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(['super_admin', 'inventory_manager', 'catalog_manager']);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    let query: any = {};
    if (lowStockOnly) {
      query.$expr = {
        $lte: [{ $subtract: ['$quantityOnHand', '$quantityReserved'] }, '$lowStockThreshold'],
      };
    }

    const inventories = await Inventory.find(query)
      .populate({
        path: 'product',
        select: 'name sku basePrice images category',
        populate: { path: 'category', select: 'name' },
      })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: inventories });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
