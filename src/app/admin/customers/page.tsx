import React from 'react';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/connect';
import { User, Order } from '@/models';
import { getAdminSession } from '@/lib/auth/session';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  await connectDB();

  const customers = await User.find().sort({ createdAt: -1 }).limit(50).lean();

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Customer Directory</h1>
        <p className="text-xs text-stone-500 mt-1">Review registered customers, email verifications, and order accounts</p>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Email Verified</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {customers.map((c: any) => (
                <tr key={c._id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 font-bold text-stone-900">{c.name || 'Packaging Customer'}</td>
                  <td className="p-4 text-stone-600 font-medium">{c.email}</td>
                  <td className="p-4 text-stone-600">{c.phone || '—'}</td>
                  <td className="p-4 text-stone-500">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {c.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    No customers registered yet.
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
