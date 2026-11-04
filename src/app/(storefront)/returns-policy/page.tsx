import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Returns & Cancellation Policy — Mithai Box Wala`,
  description: `Official return, refund and cancellation policy of Ajay Packers – Mithai Box Wala.`,
};

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Store Policy</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Returns & Cancellation Policy</h1>
          <p className="text-xs text-stone-500">Ajay Packers — Mirzapur, Uttar Pradesh</p>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 text-xs">
            <ShieldAlert size={20} className="flex-shrink-0 mt-0.5 text-rose-700" />
            <div>
              <p className="font-bold">Strict No-Returns Policy Post Dispatch</p>
              <p className="mt-1">
                Because boxes, paperboards, and food-grade packaging are sensitive to handling, humidity, and transit compression, <strong>no returns or exchanges are accepted once an order has been dispatched from our premises</strong>.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">
              1. Color & Appearance Variations
            </h2>
            <p>
              Product photographs on <strong>mithaiboxes.com</strong> are produced under studio lighting. Due to monitor calibrations, screen color profiles, and paperboard batch dyeing, slight visual variations between digital images and physical items are normal and do not qualify for returns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">
              2. Order Cancellations
            </h2>
            <p>
              Orders may be cancelled only prior to packaging and dispatch. Once production, cutting, or carton dispatch has commenced, cancellations cannot be honored. Approved pre-dispatch cancellations are refunded via the original payment channel within 5–7 business days minus applicable transaction processing fees.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">
              3. Custom & Printed Packaging
            </h2>
            <p>
              Any custom-manufactured boxes carrying your shop’s logo, unique die-cuts, or bespoke dimensions are completely non-refundable once production plates are generated.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
