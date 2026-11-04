import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import { Order } from '@/models';
import { getAdminSession } from '@/lib/auth/session';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import { Search, Eye, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  const { status, search } = await searchParams;

  await connectDB();

  let query: any = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customerSnapshot.email': { $regex: search, $options: 'i' } },
      { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
    ];
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50).lean();

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Orders Management</h1>
          <p className="text-xs text-stone-500 mt-1">Review orders, update dispatch statuses, and print invoices</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            name="search"
            defaultValue={search || ''}
            placeholder="Search order number or customer..."
            className="w-full pl-9 pr-4 py-2 border border-[#EDE4D6] rounded-lg text-xs"
          />
        </form>

        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span>Filter:</span>
          {['all', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <Link
              key={st}
              href={st === 'all' ? '/admin/orders' : `/admin/orders?status=${st}`}
              className={`px-2.5 py-1 rounded-lg capitalize ${
                (!status && st === 'all') || status === st
                  ? 'bg-[#681C2D] text-white font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Order Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {orders.map((o: any) => (
                <tr key={o._id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#681C2D]">#{o.orderNumber}</td>
                  <td className="p-4 text-stone-500">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-stone-900">{o.customerSnapshot?.name || 'Customer'}</p>
                    <p className="text-[10px] text-stone-500">{o.customerSnapshot?.email}</p>
                  </td>
                  <td className="p-4 text-stone-600">
                    {o.shippingAddressSnapshot?.city}, {o.shippingAddressSnapshot?.state}
                  </td>
                  <td className="p-4 font-bold text-stone-900">₹{o.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-emerald-700">
                    {o.paymentStatus}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100'}`}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${o._id}`}
                      className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-3 py-1.5 rounded text-xs font-semibold inline-block"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
