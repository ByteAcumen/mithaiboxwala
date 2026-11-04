import React from 'react';
import Link from 'next/link';
import {
  Package, Award, ShieldCheck, Truck, Sparkles, ArrowRight,
  Factory, CheckCircle2, Mail, Gem, Layers, Crown, Gift, Building2,
} from 'lucide-react';
import { BUSINESS, COPY, CATEGORIES, FESTIVALS } from '@/lib/constants';
import { ProductCard } from '@/components/product/ProductCard';
import { connectDB } from '@/lib/db/connect';
import { Product } from '@/models';

async function getFeaturedProducts() {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

const TRUST_ITEMS = [
  { icon: Factory, text: 'Ajay Packers, Mirzapur' },
  { icon: ShieldCheck, text: 'GSTIN Registered' },
  { icon: Truck, text: 'Pan-India Dispatch' },
  { icon: Award, text: '40 Years Heritage' },
  { icon: Package, text: 'Food-Grade Safe' },
  { icon: Sparkles, text: 'Premium Materials' },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="home-page flex flex-col min-h-screen overflow-x-hidden">

      {/* ════════════════════════════════════
          1. HERO
         ════════════════════════════════════ */}
      <section
        className="home-hero relative text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3A0D18 0%, #681C2D 45%, #8B2B3F 100%)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Top-right radial glow */}
        <div
          className="absolute right-0 top-0 w-[60%] h-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 30%, #B8955A 0%, transparent 60%)' }}
        />
        {/* Bottom-left glow */}
        <div
          className="absolute left-0 bottom-0 w-[40%] h-[60%] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 20% 80%, #FAF7F0 0%, transparent 60%)' }}
        />
        {/* Corner ornament */}
        <div className="absolute top-8 right-8 opacity-20 pointer-events-none hidden lg:block">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="55" stroke="#B8955A" strokeWidth="1" />
            <circle cx="60" cy="60" r="40" stroke="#B8955A" strokeWidth="0.5" />
            <line x1="60" y1="5" x2="60" y2="115" stroke="#B8955A" strokeWidth="0.5" />
            <line x1="5" y1="60" x2="115" y2="60" stroke="#B8955A" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="site-container home-hero__inner relative z-10 w-full">
          <div className="home-hero__grid grid grid-cols-1 lg:grid-cols-12 items-center">

            {/* Left copy */}
            <div className="home-hero__copy lg:col-span-7 space-y-8">
              <div className="animate-fade-up">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-widest"
                  style={{ background: 'rgba(250,247,240,0.08)', borderColor: 'rgba(184,149,90,0.35)', color: '#CBA96E' }}
                >
                  <Sparkles size={12} className="text-[#B8955A]" />
                  <span>40 Years of Packaging Excellence</span>
                  <span className="w-1 h-1 rounded-full bg-[#B8955A]" />
                  <span>Est. 1984</span>
                </div>
              </div>

              <div className="animate-fade-up delay-100">
                <h1
                  className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
                  style={{ color: '#FAF7F0' }}
                >
                  {COPY.heroHeadline}
                </h1>
                <div
                  className="mt-5 h-0.5 w-24 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#B8955A,rgba(184,149,90,0))' }}
                />
              </div>

              <p
                className="text-lg sm:text-xl leading-relaxed max-w-xl animate-fade-up delay-200"
                style={{ color: 'rgba(237,228,214,0.85)' }}
              >
                {COPY.heroSubtext}
              </p>

              <div className="home-actions flex flex-wrap gap-4 pt-2 animate-fade-up delay-300">
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm shadow-xl hover:shadow-2xl hover:opacity-90 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#B8955A,#9A7A45)', color: '#fff' }}
                >
                  <span>{COPY.heroPrimaryBtn}</span>
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border-2 hover:bg-white/10 transition-all duration-200"
                  style={{ borderColor: 'rgba(250,247,240,0.25)', color: '#FAF7F0' }}
                >
                  {COPY.heroSecondaryBtn}
                </Link>
              </div>

              {/* Trust strip */}
              <div
                className="home-trust pt-8 border-t grid grid-cols-3 gap-x-6 gap-y-4 text-xs animate-fade-up delay-400"
                style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(237,228,214,0.75)' }}
              >
                {[
                  { Icon: Factory, text: 'Ajay Packers, Mirzapur' },
                  { Icon: ShieldCheck, text: 'GSTIN Registered' },
                  { Icon: Truck, text: 'Pan-India Delivery' },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="text-[#B8955A] flex-shrink-0" size={15} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right card */}
            <div className="lg:col-span-5 animate-slide-right delay-200">
              <div
                className="relative rounded-3xl p-8 shadow-2xl animate-float"
                style={{ background: '#FAF7F0', border: '2px solid rgba(184,149,90,0.35)' }}
              >
                <div
                  className="absolute -top-3 left-8 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg"
                  style={{ background: 'linear-gradient(90deg,#681C2D,#8B2B3F)', color: '#FAF7F0' }}
                >
                  Est. 1984
                </div>
                <div className="absolute top-5 right-5 opacity-15">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="22" stroke="#B8955A" strokeWidth="1" />
                    <path d="M24 2 L24 46 M2 24 L46 24" stroke="#B8955A" strokeWidth="0.5" />
                  </svg>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-[#B8955A] uppercase tracking-widest mb-2">
                      Ajay Packers Exclusive Collection
                    </p>
                    <h3 className="font-display text-2xl font-bold" style={{ color: '#681C2D' }}>
                      Festive & Luxury<br />Sweet Packaging
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#5C5855' }}>
                    Trusted by halwais, sweet houses, gourmet confectioners,
                    and corporate gifting specialists across India.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Rigid, folding & premium gourmet box structures',
                      'Custom gold foil, embossing & brand logo printing',
                      'Direct factory wholesale rates, bulk tier pricing',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-xs font-medium" style={{ color: '#3D3835' }}>
                        <CheckCircle2 size={14} className="text-[#681C2D] flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="pt-5 border-t flex items-center justify-between text-xs"
                    style={{ borderColor: '#EDE4D6' }}
                  >
                    <div>
                      <p className="font-bold" style={{ color: '#681C2D' }}>Ajay Kumar & Sanjay Kumar</p>
                      <p style={{ color: '#8C8885' }}>Business Representatives</p>
                    </div>
                    <Link
                      href="/about"
                      className="flex items-center gap-1 text-[11px] font-bold transition-colors hover:text-[#B8955A]"
                      style={{ color: '#681C2D' }}
                    >
                      Our Story <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 48 }}>
            <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#FAF7F0" />
          </svg>
        </div>
      </section>


      {/* ════════════════════════════════════
          2. TRUST MARQUEE STRIP
         ════════════════════════════════════ */}
      <section style={{ background: '#FAF7F0', borderBottom: '1px solid #EDE4D6' }}>
        <div className="overflow-hidden py-5">
          <div className="marquee-track">
            {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map(({ icon: Icon, text }, i) => (
              <div key={i} className="inline-flex items-center gap-3 mx-8 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)', border: '1px solid #DDD5C8' }}
                >
                  <Icon size={14} className="text-[#681C2D]" />
                </div>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: '#3D3835' }}>
                  {text}
                </span>
                <span className="text-[#B8955A]/50 text-lg">◆</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          3. SHOP BY CATEGORY
         ════════════════════════════════════ */}
      <section className="section-py" style={{ background: '#FAF7F0' }}>
        <div className="site-container">
          <div className="section-heading text-center max-w-2xl mx-auto animate-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(184,149,90,0.12)', color: '#9A7A45' }}
            >
              <Layers size={11} />
              <span>Collections</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#681C2D' }}>
              Shop by Packaging Category
            </h2>
            <p className="text-sm sm:text-base mt-3" style={{ color: '#5C5855' }}>
              From traditional festive mithai boxes to contemporary luxury hampers — engineered for elegance and protection.
            </p>
          </div>

          <div className="category-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="category-card group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl text-center animate-fade-up bg-white border border-[#EDE4D6] hover:border-[#B8955A] hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#FAF7F0] to-[#EDE4D6]">
                  {cat.emoji}
                </div>
                <span className="text-xs sm:text-sm font-semibold leading-tight transition-colors duration-200 group-hover:text-[#681C2D]" style={{ color: '#3D3835' }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          4. FEATURED PRODUCTS
         ════════════════════════════════════ */}
      <section className="section-py" style={{ background: '#fff', borderTop: '1px solid #EDE4D6' }}>
        <div className="site-container">
          <div className="section-header flex flex-col md:flex-row md:items-end justify-between">
            <div className="animate-fade-up">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
                style={{ background: 'rgba(104,28,45,0.08)', color: '#681C2D' }}
              >
                <Gem size={11} />
                <span>Handcrafted Excellence</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#681C2D' }}>
                Featured Packaging Designs
              </h2>
            </div>
            <Link
              href="/products"
              className="mt-5 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#B8955A] animate-fade-up"
              style={{ color: '#681C2D' }}
            >
              Browse Complete Catalog <ArrowRight size={15} />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p: any, i: number) => (
                <ProductCard key={p._id} product={p} animationDelay={i * 80} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-14 text-center max-w-lg mx-auto animate-scale-in"
              style={{ background: '#FAF7F0', border: '1px dashed #DDD5C8' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)' }}
              >
                <Package size={32} className="text-[#B8955A]" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#24211F' }}>Catalog Loading</h3>
              <p className="text-sm mb-6" style={{ color: '#5C5855' }}>
                Our 2026 packaging catalog is being loaded from Ajay Packers database.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#681C2D,#8B2B3F)' }}
              >
                View Catalog <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* ════════════════════════════════════
          5. FESTIVAL & OCCASION COLLECTIONS
         ════════════════════════════════════ */}
      <section
        className="section-py relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#FAF7F0 0%,#EDE4D6 100%)', borderTop: '1px solid #EDE4D6' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#681C2D 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="site-container relative z-10">
          <div className="section-heading text-center max-w-2xl mx-auto animate-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
              style={{ background: 'rgba(184,149,90,0.15)', color: '#9A7A45' }}
            >
              <Crown size={11} />
              <span>Celebrations</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#681C2D' }}>
              Festive & Wedding Packaging
            </h2>
            <p className="text-sm mt-3" style={{ color: '#5C5855' }}>
              Specialized packaging lines engineered for India's grandest celebrations and gifting moments.
            </p>
          </div>

          <div className="feature-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FESTIVALS.slice(0, 4).map((f, i) => (
              <div
                key={f.slug}
                className="festival-card group relative bg-white rounded-2xl p-7 flex flex-col justify-between overflow-hidden border border-[#EDE4D6] hover:border-[#B8955A] hover:shadow-xl transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Top accent line revealed on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg,#681C2D,#B8955A)' }}
                />

                <div
                  className="absolute right-4 top-4 text-[80px] leading-none opacity-5 pointer-events-none"
                  aria-hidden="true"
                >
                  {(f as any).emoji ?? '🎁'}
                </div>

                <div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300"
                    style={{ background: 'linear-gradient(135deg,#681C2D,#8B2B3F)', color: '#B8955A' }}
                  >
                    <Gift size={20} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#24211F' }}>
                    {f.name}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#5C5855' }}>
                    Curated festive rigid boxes, dry-fruit tins & sweet packaging with custom foiling.
                  </p>
                </div>

                <Link
                  href={`/collections/${f.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:text-[#B8955A]"
                  style={{ color: '#681C2D' }}
                >
                  Explore Collection <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          6. HERITAGE / ABOUT AJAY PACKERS
         ════════════════════════════════════ */}
      <section className="section-py" style={{ background: '#fff', borderTop: '1px solid #EDE4D6' }}>
        <div className="site-container">
          <div className="home-heritage grid grid-cols-1 lg:grid-cols-2 items-center">

            <div className="space-y-7 animate-slide-left">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
                  style={{ background: 'rgba(184,149,90,0.12)', color: '#9A7A45' }}
                >
                  <Award size={11} />
                  <span>Manufacturing Legacy</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight" style={{ color: '#681C2D' }}>
                  Ajay Packers —<br />40 Years of Craftsmanship
                </h2>
              </div>

              <p className="leading-relaxed" style={{ color: '#3D3835' }}>
                Welcome to <strong>Mithai Box Wala</strong>, backed by <strong>Ajay Packers</strong> with
                approximately 40 years of continuous service to the Indian confectionery and sweet-box manufacturing sector.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#5C5855' }}>
                Operating from our facility in <strong>Mirzapur, Uttar Pradesh</strong>, we specialize in
                high-precision die-cut folding boxes, rigid gift boxes, partitioned dry-fruit boxes, and
                customized branding for sweet retailers and corporate clients across India.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t" style={{ borderColor: '#EDE4D6' }}>
                {[
                  { value: '40+', label: 'Years Active' },
                  { value: '500+', label: 'Products' },
                  { value: '100%', label: 'Advance Trust' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-3xl font-bold" style={{ color: '#681C2D' }}>{value}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: '#8C8885' }}>{label}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#B8955A]"
                style={{ color: '#681C2D' }}
              >
                Read Our Manufacturing Story <ArrowRight size={15} />
              </Link>
            </div>

            <div
              className="rounded-3xl p-8 space-y-5 animate-slide-right"
              style={{ background: 'linear-gradient(160deg,#FAF7F0 0%,#EDE4D6 100%)', border: '1px solid #DDD5C8' }}
            >
              <h3 className="font-display text-xl font-bold" style={{ color: '#24211F' }}>
                Why Businesses Partner With Us
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Factory,
                    title: 'Direct Manufacturing Rates',
                    desc: 'No intermediaries. Direct wholesale supply from our factory in Mirzapur.',
                  },
                  {
                    icon: Award,
                    title: 'Food-Grade & Safe Materials',
                    desc: 'Virgin boards and safe barrier coatings crafted specifically for food contact.',
                  },
                  {
                    icon: Building2,
                    title: 'Customized Branding & Logos',
                    desc: 'Hot foil stamping, UV spot finishes, embossed emblems, and tailored dimensions.',
                  },
                  {
                    icon: Truck,
                    title: 'Pan-India Dispatch',
                    desc: '2-business-day dispatch. Friday orders dispatched Monday. Reliable logistics.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex gap-4 p-4 rounded-xl bg-white/60 hover:bg-white transition-all duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#681C2D,#8B2B3F)', color: '#B8955A' }}
                    >
                      <Icon size={17} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: '#24211F' }}>{title}</h4>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#5C5855' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════
          7. WHOLESALE CTA BANNER
         ════════════════════════════════════ */}
      <section
        className="home-cta relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#3A0D18 0%,#681C2D 50%,#8B2B3F 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #B8955A 0%, transparent 70%)' }}
        />

        <div className="site-container relative z-10 text-center space-y-8">
          <div className="animate-fade-up">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border"
              style={{ background: 'rgba(184,149,90,0.2)', color: '#CBA96E', borderColor: 'rgba(184,149,90,0.3)' }}
            >
              <Building2 size={11} />
              <span>B2B & Wholesale Orders</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl mx-auto" style={{ color: '#FAF7F0' }}>
              Need Bulk Packaging for Your Sweet Brand or Festive Season?
            </h2>
          </div>

          <p className="text-base max-w-xl mx-auto animate-fade-up delay-100" style={{ color: 'rgba(237,228,214,0.8)' }}>
            Custom tier-based pricing for quantities exceeding 500 units. Talk directly to
            {' '}<strong className="text-[#CBA96E]">Ajay Kumar & Sanjay Kumar</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-up delay-200">
            <Link
              href="/wholesale"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm shadow-xl hover:opacity-90 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#B8955A,#CBA96E)', color: '#fff' }}
            >
              Submit Wholesale Enquiry
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border-2 hover:bg-white/10 transition-all duration-200"
              style={{ background: 'rgba(250,247,240,0.08)', color: '#FAF7F0', borderColor: 'rgba(250,247,240,0.2)' }}
            >
              <Mail size={15} /> Email Us
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-12 pt-4 animate-fade-up delay-300">
            {[
              { value: '500+', label: 'Min Bulk Order' },
              { value: '2 Days', label: 'Dispatch Time' },
              { value: 'Pan-India', label: 'Delivery' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold" style={{ color: '#CBA96E' }}>{value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(237,228,214,0.65)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
