import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import { WholesaleEnquiry } from '@/models';
import { getAdminSession } from '@/lib/auth/session';
import { MessageSquare, Phone, Mail, Building2, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  await connectDB();

  const enquiries = await WholesaleEnquiry.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Wholesale Enquiries CRM</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review incoming bulk-order requirements, custom foil printing requests, and track quotations
        </p>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Company</th>
                <th className="p-4">Category</th>
                <th className="p-4">Est. Qty</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {enquiries.map((e: any) => (
                <tr key={e._id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#681C2D]">
                    {e.referenceNumber}
                  </td>
                  <td className="p-4 text-stone-500">
                    {new Date(e.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-stone-900">{e.contactName}</p>
                    <p className="text-[10px] text-stone-400">{e.phone} • {e.email}</p>
                  </td>
                  <td className="p-4 text-stone-700 font-medium">{e.companyName || '—'}</td>
                  <td className="p-4 font-semibold text-[#681C2D]">{e.productInterest || 'Mithai Boxes'}</td>
                  <td className="p-4 font-bold text-stone-900">{e.estimatedQuantity || 500} pcs</td>
                  <td className="p-4 text-stone-600">{e.destination || '—'}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 uppercase">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {enquiries.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-400">
                    No wholesale enquiries received yet.
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
