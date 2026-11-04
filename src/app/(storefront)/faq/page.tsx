import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Frequently Asked Questions — Mithai Box Wala`,
  description: `Common questions regarding minimum orders, custom foil printing, dispatch timelines, and wholesale sweet boxes.`,
};

const FAQS = [
  {
    q: 'What is the Minimum Order Quantity (MOQ)?',
    a: 'Each product has a designated MOQ (typically 50 to 100 units for standard catalog boxes). For custom foil printing and bespoke dimensions, our standard production batch starts at 500 units.',
  },
  {
    q: 'How fast are orders dispatched?',
    a: 'Standard orders are dispatched within 2 business days from our factory in Mirzapur, UP. Orders confirmed on Friday are processed on Monday.',
  },
  {
    q: 'How are shipping and transport charges billed?',
    a: 'Due to the large volume of packaging boxes, shipping charges are calculated separately according to gross volume and destination city, and billed transparently or handled via your commercial transport agency.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept 100% advance online payments via Razorpay (UPI, Credit/Debit Cards, Netbanking, Corporate Cards). Cash payments are accepted strictly for self-pickups at our Mirzapur facility.',
  },
  {
    q: 'Can I print my sweet house name and logo on the boxes?',
    a: 'Yes! We specialize in hot gold/copper foiling, spot UV, and custom plate embossing for sweet retailers across India. Submit an inquiry through our Wholesale Quotation page.',
  },
  {
    q: 'Can I return or exchange boxes if I ordered the wrong size?',
    a: 'Due to the delicate nature of food-grade paperboard packaging, we operate a strict no-returns policy once products are dispatched. Please verify cavity dimensions and box sizes before placing your order.',
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Help Center</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Frequently Asked Questions</h1>
          <p className="text-sm text-stone-600">Everything you need to know about ordering sweet boxes from Ajay Packers.</p>
        </div>

        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-10 shadow-sm divide-y divide-[#EDE4D6]">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-6 first:pt-0 last:pb-0 space-y-2">
              <h3 className="font-display text-lg font-bold text-[#24211F]">{faq.q}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#681C2D] text-white p-8 rounded-2xl text-center space-y-4">
          <h3 className="font-display text-xl font-bold text-[#FAF7F0]">Have a Specific Question?</h3>
          <p className="text-xs sm:text-sm text-[#EDE4D6] max-w-md mx-auto">
            Our representatives Ajay Kumar & Sanjay Kumar are available Monday through Saturday to assist you.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#B8955A] hover:bg-[#CBA96E] text-white px-6 py-2.5 rounded font-semibold text-xs"
            >
              Contact Us
            </Link>
            <Link
              href="/wholesale"
              className="border border-white/20 text-white hover:bg-white/10 px-6 py-2.5 rounded font-semibold text-xs"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
