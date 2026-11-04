import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { StoreSettings } from '@/models';
import { BUSINESS } from '@/lib/constants';
import { Building2, ShieldCheck, Truck, Mail, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  await connectDB();

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#24211F]">Store Settings & Business Identity</h1>
        <p className="text-xs text-stone-500 mt-1">
          Owner-confirmed legal profile, GST credentials, and factory parameters for Ajay Packers
        </p>
      </div>

      {/* Business Details Card */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EDE4D6]">
          <Building2 className="text-[#681C2D]" size={22} />
          <div>
            <h2 className="font-display text-lg font-bold text-[#24211F]">
              Owner-Confirmed Business Profile
            </h2>
            <p className="text-xs text-stone-500">Legal entity registration and physical manufacturing location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-700">
          <div>
            <label className="block text-stone-500 font-semibold mb-1">Customer-Facing Brand</label>
            <p className="text-sm font-bold text-stone-900">{BUSINESS.brand}</p>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Manufacturing Business Name</label>
            <p className="text-sm font-bold text-stone-900">{BUSINESS.manufacturer}</p>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">GSTIN (Verified Record)</label>
            <p className="font-mono text-sm font-bold text-[#681C2D] bg-[#FAF7F0] p-2 rounded border border-[#EDE4D6] inline-block">
              {BUSINESS.gstin}
            </p>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Industry Experience</label>
            <p className="text-sm font-bold text-stone-900">{BUSINESS.experience} Years of Continuous Manufacturing</p>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Official Business Email</label>
            <p className="text-sm font-bold text-stone-900">{BUSINESS.email}</p>
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1">Authorized Representatives</label>
            <p className="text-sm font-bold text-stone-900">{BUSINESS.representatives.join(' & ')}</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-500 font-semibold mb-1">Manufacturing Address</label>
            <p className="text-sm font-medium text-stone-900">{BUSINESS.address.full}</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-500 font-semibold mb-1">Official Brand Tagline</label>
            <p className="text-sm italic text-stone-800">&ldquo;{BUSINESS.tagline}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* Operational Rules */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EDE4D6]">
          <Truck className="text-[#681C2D]" size={22} />
          <div>
            <h2 className="font-display text-lg font-bold text-[#24211F]">
              Operational Rules & Policies
            </h2>
            <p className="text-xs text-stone-500">Dispatch timelines and billing rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-700">
          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#EDE4D6]">
            <p className="font-bold text-[#681C2D] mb-1">100% Advance Payment Policy</p>
            <p className="text-stone-600">
              Orders are moved to production/dispatch solely upon verified payment capture via Razorpay.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#EDE4D6]">
            <p className="font-bold text-[#681C2D] mb-1">Dispatch Schedule</p>
            <p className="text-stone-600">
              Standard turnaround: 2 business days. Orders placed Friday dispatch on Monday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
