import React from 'react';
import Link from 'next/link';
import { Factory, Award, ShieldCheck, CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { BUSINESS, COPY } from '@/lib/constants';

export const metadata = {
  title: `About Us — 40 Years of Packaging Craftsmanship`,
  description: `Learn about Ajay Packers and Mithai Box Wala, an established packaging manufacturer based in Mirzapur, Uttar Pradesh with 40 years of experience.`,
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Intro Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
            Company Heritage
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#681C2D]">
            Ajay Packers — Mithai Box Wala
          </h1>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
            {COPY.brandMessage}
          </p>
        </div>

        {/* Narrative Section */}
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#24211F]">
            The Perfection of Your Sweets, Paired with Our Ultimate Packaging
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Welcome to <strong>Mithai Box Wala</strong>, a dedicated luxury sweet-box brand backed by <strong>Ajay Packers</strong> with approximately 40 years of continuous service to India’s confectioners, sweet makers, and gifting houses.
          </p>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            In Indian traditions, sweets are more than food—they are blessings, celebrations, and tokens of affection. Packaging plays an indispensable role in preserving that presentation, protecting the delicacies from moisture and pressure, and turning a simple gift into a royal experience.
          </p>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            From our primary production unit in <strong>Mirzapur, Uttar Pradesh</strong>, we engineer attractive, rigid, and quality-conscious packaging solutions for sweet manufacturers, retail mithai shops, corporate clients, and wedding planners throughout India.
          </p>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#EDE4D6]">
            <div>
              <h3 className="font-display text-lg font-bold text-[#681C2D] mb-2">Our Mission</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{COPY.mission}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#681C2D] mb-2">Our Vision</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{COPY.vision}</p>
            </div>
          </div>
        </div>

        {/* Manufacturing Highlights */}
        <div className="space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Infrastructure</span>
            <h2 className="font-display text-3xl font-bold text-[#681C2D] mt-1">
              Manufacturing Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#EDE4D6] p-6 rounded-xl space-y-3">
              <Factory className="text-[#681C2D]" size={28} />
              <h3 className="font-semibold text-sm text-[#24211F]">Advanced Production Unit</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Modern automatic die-cutting, gluing, and laminating equipment stationed at our Mirzapur factory.
              </p>
            </div>

            <div className="bg-white border border-[#EDE4D6] p-6 rounded-xl space-y-3">
              <ShieldCheck className="text-[#681C2D]" size={28} />
              <h3 className="font-semibold text-sm text-[#24211F]">Food-Grade & Eco-Friendly Options</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Virgin paperboards and food-contact barrier liners tested for grease resistance and food safety.
              </p>
            </div>

            <div className="bg-white border border-[#EDE4D6] p-6 rounded-xl space-y-3">
              <Award className="text-[#681C2D]" size={28} />
              <h3 className="font-semibold text-sm text-[#24211F]">Custom Foil & Logo Stamping</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hot foil gold/copper stamping, spot UV, and embossed custom branding tailored to your brand identity.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership & Legal Entity */}
        <div className="bg-[#681C2D] text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
              Business Leadership
            </span>
            <h3 className="font-display text-2xl font-bold text-[#FAF7F0]">
              Ajay Kumar & Sanjay Kumar
            </h3>
            <p className="text-xs text-[#EDE4D6] max-w-md">
              40 years of combined family stewardship in packaging. Registered GSTIN: {BUSINESS.gstin}.
              Located in Mirzapur, Uttar Pradesh – 231001.
            </p>
          </div>

          <Link
            href="/wholesale"
            className="bg-[#B8955A] hover:bg-[#CBA96E] text-white px-6 py-3 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors"
          >
            Connect With Our Team →
          </Link>
        </div>
      </div>
    </div>
  );
}
