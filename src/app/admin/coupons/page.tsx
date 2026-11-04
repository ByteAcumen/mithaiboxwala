import React from 'react';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/connect';
import { Coupon } from '@/models';
import { getAdminSession } from '@/lib/auth/session';
import { Tag, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  await connectDB();

  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Coupons & Promotional Rules</h1>
          <p className="text-xs text-stone-500 mt-1">Configure percentage and flat discount codes for customer checkout</p>
        </div>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4">Times Used</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {coupons.map((c: any) => (
                <tr key={c._id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#681C2D]">{c.code}</td>
                  <td className="p-4 capitalize">{c.type}</td>
                  <td className="p-4 font-bold text-stone-900">
                    {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="p-4 text-stone-600">
                    {c.minOrderAmount ? `₹${c.minOrderAmount}` : 'None'}
                  </td>
                  <td className="p-4 font-semibold text-stone-700">{c.usedCount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No active discount coupons configured.
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
