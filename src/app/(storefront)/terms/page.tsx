import React from 'react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Terms & Conditions — Mithai Box Wala`,
  description: `Official terms of service, payment, and intellectual property terms for Ajay Packers – Mithai Box Wala.`,
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Legal Agreement</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Terms and Conditions</h1>
          <p className="text-xs text-stone-500">Ajay Packers — GSTIN: {BUSINESS.gstin}</p>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">1. General Scope</h2>
            <p>
              These Terms and Conditions govern the sale of sweet boxes, packaging materials, and custom containers on <strong>mithaiboxes.com</strong> operated by <strong>Ajay Packers</strong>, Mirzapur, Uttar Pradesh.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">2. Intellectual Property Rights</h2>
            <p>
              All die-cut patterns, structure templates, box designs, graphics, branding, and images appearing on this platform are proprietary to Ajay Packers. Reproduction, copying, or digital distribution without written consent is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">3. Pricing & Specification Changes</h2>
            <p>
              Because raw material costs (paperboard, foil, adhesives) fluctuate in manufacturing markets, the company reserves the right to alter specifications, minimum order quantities, and prices without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">4. Order Refusal Rights</h2>
            <p>
              The management of Ajay Packers reserves the right to cancel or refuse any order even after payment has been completed in cases of stock depletion, manufacturing constraints, or transport limitations, with a prompt full refund issued.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">5. Jurisdiction</h2>
            <p>
              Any disputes arising out of online or wholesale orders are subject exclusively to the jurisdiction of the competent courts in <strong>Mirzapur, Uttar Pradesh, India</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
