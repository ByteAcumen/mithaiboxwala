import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Order, Product, User, Inventory, WholesaleEnquiry } from '@/models';
import {
  DollarSign, ShoppingCart, Package, Users, AlertTriangle,
  Clock, ArrowUpRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  await connectDB();

  // Fetch real database metrics
  const [
    totalOrders,
    paidOrders,
    productCount,
    customerCount,
    lowStockCount,
    recentOrders,
    newEnquiriesCount,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.find({ paymentStatus: 'paid' }).select('grandTotal').lean(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    Inventory.countDocuments({
      $expr: { $lte: [{ $subtract: ['$quantityOnHand', '$quantityReserved'] }, '$lowStockThreshold'] },
    }),
    Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    WholesaleEnquiry.countDocuments({ status: 'new' }),
  ]);

  const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">
            Dashboard Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time manufacturing, inventory, and order analytics for Ajay Packers
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            + Add New Box
          </Link>
          <Link
            href="/admin/reports/orders?format=csv"
            className="border border-[#EDE4D6] bg-white hover:bg-[#FAF7F0] text-stone-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            Export Orders (CSV)
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Collected Revenue</p>
            <p className="font-display text-2xl font-bold text-[#681C2D] mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-medium">100% advance verified</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Orders</p>
            <p className="font-display text-2xl font-bold text-[#24211F] mt-1">
              {totalOrders}
            </p>
            <Link href="/admin/orders" className="text-[10px] text-[#681C2D] hover:underline font-medium">
              View order pipeline →
            </Link>
          </div>
          <div className="w-12 h-12 bg-[#FAF7F0] text-[#681C2D] rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Products</p>
            <p className="font-display text-2xl font-bold text-[#24211F] mt-1">
              {productCount}
            </p>
            <Link href="/admin/products" className="text-[10px] text-[#681C2D] hover:underline font-medium">
              Manage catalog →
            </Link>
          </div>
          <div className="w-12 h-12 bg-[#FAF7F0] text-[#681C2D] rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Low Stock Alerts</p>
            <p className="font-display text-2xl font-bold text-amber-600 mt-1">
              {lowStockCount}
            </p>
            <Link href="/admin/inventory" className="text-[10px] text-amber-700 hover:underline font-medium">
              Reconcile stock →
            </Link>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders & Wholesale Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-[#24211F]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#681C2D] hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EDE4D6] text-stone-500">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE4D6]">
                {recentOrders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#681C2D]">#{o.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-semibold text-stone-800">{o.customerSnapshot?.name || 'Customer'}</p>
                      <p className="text-[10px] text-stone-400">{o.customerSnapshot?.email}</p>
                    </td>
                    <td className="py-3 font-bold text-stone-900">₹{o.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100'}`}>
                        {ORDER_STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="py-3 uppercase text-[10px] font-bold text-emerald-700">
                      {o.paymentStatus}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="text-xs font-semibold text-[#681C2D] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wholesale Enquiries Feed */}
        <div className="lg:col-span-4 bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-[#24211F]">Wholesale CRM</h2>
              {newEnquiriesCount > 0 && (
                <span className="bg-[#681C2D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {newEnquiriesCount} New
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Track bulk order requests, custom logo stamping requirements, and quote generation for large buyers.
            </p>
          </div>

          <Link
            href="/admin/enquiries"
            className="w-full bg-[#FAF7F0] hover:bg-[#EDE4D6] border border-[#EDE4D6] text-[#681C2D] py-3 rounded-lg text-xs font-bold text-center block transition-colors"
          >
            Open Wholesale Pipeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
