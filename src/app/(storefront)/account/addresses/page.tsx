import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Address } from '@/models';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/auth/login?returnUrl=/account/addresses');
  }

  await connectDB();
  const addresses = await Address.find({ user: session.user._id }).lean();

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D] mb-6">
          <ArrowLeft size={14} /> Back to Account
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-bold text-[#681C2D]">
            Saved Addresses ({addresses.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr: any) => (
            <div key={addr._id} className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm relative">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-[#681C2D] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Default
                </span>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="text-[#B8955A] mt-1 flex-shrink-0" size={18} />
                <div className="text-xs text-stone-600 space-y-1">
                  <p className="text-sm font-bold text-stone-900">{addr.fullName}</p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>{addr.city}, {addr.state} – {addr.pincode}</p>
                  <p className="pt-2 font-medium">Contact: {addr.phone}</p>
                </div>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="sm:col-span-2 bg-white border border-[#EDE4D6] rounded-2xl p-10 text-center text-stone-500">
              <MapPin size={36} className="text-[#B8955A] mx-auto mb-3" />
              <p className="text-sm">No saved addresses yet.</p>
              <p className="text-xs text-stone-400 mt-1">
                Addresses are automatically saved during checkout for seamless future orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
