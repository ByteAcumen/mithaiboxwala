import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import {
  Order,
  Product,
  Inventory,
  User,
} from '@/models';

export async function GET(_req: NextRequest) {
  try {
    await requireAdminAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      revenueAgg,
      ordersByStatus,
      refundAgg,
      activeProductCount,
      lowStockCount,
      customerCount,
      newCustomersThisMonth,
      recentOrders,
      salesByDay,
      topProducts,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),

      // Revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),

      // Orders by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Refund total
      Order.aggregate([
        { $match: { paymentStatus: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),

      // Active product count
      Product.countDocuments({ isActive: true }),

      // Low stock count
      Inventory.countDocuments({
        $expr: {
          $lte: [
            { $subtract: ['$quantityOnHand', '$quantityReserved'] },
            '$lowStockThreshold',
          ],
        },
      }),

      // Customer count
      User.countDocuments({ isActive: true }),

      // New customers this month
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),

      // Recent 10 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber customerSnapshot grandTotal status paymentStatus createdAt')
        .lean(),

      // Sales by day last 30 days
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$grandTotal' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top 5 bestselling products
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.snapshot.name' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Build status map
    const statusMap: Record<string, number> = {};
    for (const s of ordersByStatus) {
      statusMap[s._id as string] = s.count as number;
    }

    return NextResponse.json({
      totalOrders,
      revenue: revenueAgg[0]?.total ?? 0,
      refundTotal: refundAgg[0]?.total ?? 0,
      ordersByStatus: statusMap,
      activeProducts: activeProductCount,
      lowStockProducts: lowStockCount,
      totalCustomers: customerCount,
      newCustomersThisMonth,
      recentOrders,
      salesByDay,
      topProducts,
    });
  } catch (err) {
    console.error('[Admin Dashboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
