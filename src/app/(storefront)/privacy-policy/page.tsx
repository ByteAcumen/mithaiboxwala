import React from 'react';
import { ShieldCheck, Lock, Eye } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Privacy Policy — Mithai Box Wala`,
  description: `Privacy policy and data protection disclosures for Ajay Packers – Mithai Box Wala.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Data Protection</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Privacy Policy</h1>
          <p className="text-xs text-stone-500">Ajay Packers — Mirzapur, Uttar Pradesh</p>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm space-y-8 text-stone-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <Lock className="text-[#681C2D]" size={20} /> 1. Razorpay Payment Security & Card Data
            </h2>
            <p>
              When you pay online on <strong>mithaiboxes.com</strong>, your payment is processed by our certified payment partner, <strong>Razorpay</strong>. Neither Mithai Box Wala nor Ajay Packers ever sees, collects, or stores your credit/debit card numbers or netbanking passwords on our servers.
            </p>
            <p>
              All payment transactions are encrypted according to the highest industry Payment Card Industry Data Security Standard (PCI-DSS Level 1) requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <Eye className="text-[#681C2D]" size={20} /> 2. Information We Collect
            </h2>
            <p>
              We collect customer names, delivery addresses, GSTINs (for business invoices), phone numbers, and email addresses strictly for order fulfillment, dispatch communication, and tax compliance under the Goods and Services Tax Act.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F] flex items-center gap-2">
              <ShieldCheck className="text-[#681C2D]" size={20} /> 3. Data Confidentiality
            </h2>
            <p>
              We will never sell, rent, or trade your contact or business information to third-party marketing companies. Data is shared exclusively with accredited courier/freight companies to enable transport of your packaging consignments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#24211F]">4. Contact & Inquiries</h2>
            <p>
              For privacy inquiries, account data deletion, or GST invoice copies, write to us directly at <a href={`mailto:${BUSINESS.email}`} className="text-[#681C2D] font-semibold underline">{BUSINESS.email}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
