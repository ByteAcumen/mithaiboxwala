import React from 'react';
import { Truck, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BUSINESS, SHIPPING_POLICY } from '@/lib/constants';

export const metadata = {
  title: `Shipping & Delivery Policy — Mithai Box Wala`,
  description: `Official shipping policy of Ajay Packers – Mithai Box Wala. Verified dispatch timelines, freight charges, and handling terms.`,
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Store Policy</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Shipping & Delivery Policy</h1>
          <p className="text-xs text-stone-500">Ajay Packers — Mirzapur, Uttar Pradesh</p>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <Clock className="text-[#681C2D]" size={20} /> 1. Dispatch Timelines
            </h2>
            <p>
              Standard orders placed on <strong>mithaiboxes.com</strong> require approximately <strong>2 business days</strong> to dispatch from our manufacturing unit in Mirzapur, Uttar Pradesh.
            </p>
            <p>
              Orders confirmed on a <strong>Friday</strong> are processed and dispatched on the following <strong>Monday</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <Truck className="text-[#681C2D]" size={20} /> 2. Freight & Packing Charges
            </h2>
            <p>
              Packaging cartons are voluminous items. Therefore, packing and shipping charges are <strong>extra and applicable separately</strong> depending on your delivery destination, carton volume, and gross weight.
            </p>
            <p>
              For deliveries within and outside Uttar Pradesh, transport and courier rates are billed transparently or arranged via your preferred commercial transport agency.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <ShieldCheck className="text-[#681C2D]" size={20} /> 3. 100% Advance Payment Requirement
            </h2>
            <p>
              In accordance with wholesale manufacturing standards, <strong>100% advance payment</strong> is strictly mandatory before goods leave our factory premises. Cash payments are accepted solely for in-person pickups at our Mirzapur facility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={20} /> 4. Transit Damage & Delays
            </h2>
            <p>
              While all goods are packaged in heavy-duty corrugated master cartons, Mithai Box Wala and Ajay Packers cannot assume liability for transit delays or damages caused by independent third-party transport companies or couriers once the goods leave our premises.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
