'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, CakeSlice, Candy, Gift, PackageOpen, PanelsTopLeft } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

const media = [
  '/images/editorial/gift-boxes-table.jpg',
  '/images/editorial/gift-box-ribbon.jpg',
  '/images/editorial/gift-box-blue.jpg',
  '/images/editorial/gift-boxes-table.jpg',
  '/images/editorial/gift-box-blue.jpg',
  '/images/editorial/gift-box-ribbon.jpg',
];

const icons = [Box, Gift, Candy, CakeSlice, PackageOpen, PanelsTopLeft];

export function CategoryRail() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="premium-category-grid">
      {CATEGORIES.map((category, index) => {
        const Icon = icons[index % icons.length];
        return (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.55, delay: index * 0.055 }}
          >
            <Link href={`/categories/${category.slug}`} className="premium-category-card">
              <Image
                src={media[index % media.length]}
                alt=""
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 16vw"
                className="premium-category-card__image"
              />
              <span className="premium-category-card__wash" aria-hidden="true" />
              <span className="premium-category-card__icon"><Icon size={18} aria-hidden="true" /></span>
              <span className="premium-category-card__label">{category.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
