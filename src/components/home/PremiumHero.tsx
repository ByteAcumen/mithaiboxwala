'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Building2, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { COPY } from '@/lib/constants';

const ease = [0.16, 1, 0.3, 1] as const;

export function PremiumHero() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0.01 : 0.72, delay, ease },
  });

  return (
    <section className="premium-hero">
      <div className="premium-hero__texture" aria-hidden="true" />
      <div className="site-container premium-hero__layout">
        <div className="premium-hero__copy">
          <motion.p className="premium-hero__eyebrow" {...reveal(0.05)}>
            <Sparkles size={14} aria-hidden="true" />
            Ajay Packers, Mirzapur <span aria-hidden="true">/</span> Est. 1984
          </motion.p>

          <motion.h1 {...reveal(0.12)}>{COPY.heroHeadline}</motion.h1>

          <motion.p className="premium-hero__lede" {...reveal(0.19)}>
            {COPY.heroSubtext}
          </motion.p>

          <motion.div className="premium-hero__actions" {...reveal(0.27)}>
            <Link href="/products" className="premium-action premium-action--primary">
              {COPY.heroPrimaryBtn}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/wholesale" className="premium-action premium-action--secondary">
              {COPY.heroSecondaryBtn}
            </Link>
          </motion.div>

          <motion.div className="premium-hero__trust" {...reveal(0.36)}>
            <span><ShieldCheck size={15} aria-hidden="true" /> Food-safe options</span>
            <span><Building2 size={15} aria-hidden="true" /> Direct manufacturer</span>
            <span><Truck size={15} aria-hidden="true" /> Pan-India dispatch</span>
          </motion.div>
        </div>

        <motion.div
          className="premium-hero__visual"
          initial={{ opacity: 0, x: reduceMotion ? 0 : 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.9, delay: 0.16, ease }}
        >
          <Image
            src="/images/editorial/gift-boxes-table.jpg"
            alt="Premium gift boxes arranged for a festive celebration"
            fill
            priority
            loading="eager"
            sizes="(max-width: 1023px) 100vw, 49vw"
            className="premium-hero__image"
          />
          <div className="premium-hero__image-wash" aria-hidden="true" />
          <div className="premium-hero__stamp">
            <span>Crafted for</span>
            <strong>Every celebration</strong>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
