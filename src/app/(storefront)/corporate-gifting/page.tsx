import React from 'react';
import Link from 'next/link';
import { Gift, Briefcase, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Corporate Gifting Packaging — Mithai Box Wala`,
  description: `Executive corporate sweet hampers, branded dry fruit packaging, and festive corporate gifts by Ajay Packers.`,
};

export default function CorporateGiftingPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
            B2B Gifting
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#681C2D]">
            Corporate Packaging & Festive Hampers
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Impress your clients, partners, and employees with sophisticated corporate mithai and dry-fruit boxes featuring your company logo and custom messaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#EDE4D6] p-8 rounded-2xl shadow-sm space-y-4">
            <Briefcase className="text-[#681C2D]" size={36} />
            <h2 className="font-display text-2xl font-bold text-[#24211F]">Diwali & Festive Gifting</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every Diwali, companies trust Ajay Packers to produce thousands of festive sweet hampers, brass-finish dry-fruit boxes, and gourmet assortment packaging. We ensure timely dispatch ahead of peak festival weeks.
            </p>
          </div>

          <div className="bg-white border border-[#EDE4D6] p-8 rounded-2xl shadow-sm space-y-4">
            <Gift className="text-[#681C2D]" size={36} />
            <h2 className="font-display text-2xl font-bold text-[#24211F]">Executive Gift Hampers</h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Multi-tier luxury basket packaging, magnetic closure keepsake boxes, and velvet-lined compartments engineered for premium dry fruits, artisanal sweets, and corporate tokens.
            </p>
          </div>
        </div>

        <div className="bg-[#FAF7F0] border-2 border-[#B8955A] rounded-2xl p-8 text-center space-y-6">
          <h3 className="font-display text-2xl font-bold text-[#681C2D]">
            Request Corporate Catalog & Bulk Samples
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Contact us with your employee or client recipient counts for custom volume quotes and GST invoices.
          </p>
          <Link
            href="/wholesale"
            className="inline-flex items-center gap-2 bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-colors"
          >
            Request Corporate Quote <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
