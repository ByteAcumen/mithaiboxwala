import React from 'react';
import Link from 'next/link';
import { Sparkles, Palette, Layers, Box, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Custom Packaging & Box Manufacturing — Mithai Box Wala`,
  description: `Custom branded mithai boxes, luxury sweet boxes, and bespoke packaging solutions engineered by Ajay Packers in Mirzapur.`,
};

export default function CustomPackagingPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
            Bespoke Manufacturing
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#681C2D]">
            Custom Sweet & Mithai Packaging
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Turn your sweet shop brand into a memorable gift. From custom die-cuts to hot foil branding, Ajay Packers brings 40 years of precision to custom packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl space-y-3">
            <Palette className="text-[#681C2D]" size={32} />
            <h3 className="font-display text-lg font-bold text-[#24211F]">Finishing Options</h3>
            <ul className="text-xs text-stone-600 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Gold, Copper & Silver Hot Foil</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Spot UV & Raised Varnish</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Embossed Shop Logos & Emblems</li>
            </ul>
          </div>

          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl space-y-3">
            <Layers className="text-[#681C2D]" size={32} />
            <h3 className="font-display text-lg font-bold text-[#24211F]">Tailored Cavities</h3>
            <ul className="text-xs text-stone-600 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> 4, 6, 9, 12, 16, 24 Cavity Partitions</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Dry Fruit Acrylic & Golden Trays</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Food-Safe Greaseproof Barrier Liners</li>
            </ul>
          </div>

          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl space-y-3">
            <Box className="text-[#681C2D]" size={32} />
            <h3 className="font-display text-lg font-bold text-[#24211F]">Structural Formats</h3>
            <ul className="text-xs text-stone-600 space-y-2">
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Top & Bottom Rigid Kappa Boxes</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Book-Opening Magnetic Flap Boxes</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#B8955A]" /> Space-Saving High-Speed Folding Boxes</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#681C2D] text-white rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="font-display text-3xl font-bold text-[#FAF7F0]">
            Ready to Build Your Brand’s Signature Box?
          </h2>
          <p className="text-xs sm:text-sm text-[#EDE4D6] max-w-xl mx-auto">
            Discuss your design sketches, required dimensions, and sample prototype with Ajay Kumar & Sanjay Kumar.
          </p>
          <Link
            href="/wholesale"
            className="inline-flex items-center gap-2 bg-[#B8955A] hover:bg-[#CBA96E] text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-colors"
          >
            Start Your Custom Order <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
