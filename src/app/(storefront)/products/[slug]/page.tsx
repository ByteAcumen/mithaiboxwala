import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/connect';
import { Product, Inventory } from '@/models';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, ShieldCheck, Truck, Clock, PackageCheck } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true }).lean();
  if (!product) return {};

  return {
    title: product.seoTitle || `${product.name} — ${BUSINESS.brand}`,
    description: product.seoDescription || product.shortDescription || `${product.name} manufactured by Ajay Packers.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .lean();

  if (!product) {
    notFound();
  }

  const inventory = await Inventory.findOne({ product: product._id }).lean();

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-[#681C2D]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-[#681C2D]">Packaging</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link href={`/categories/${(product.category as any).slug}`} className="hover:text-[#681C2D]">
                {(product.category as any).name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-[#24211F] font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section (Client Component) */}
        <ProductDetailClient
          product={JSON.parse(JSON.stringify(product))}
          inventory={JSON.parse(JSON.stringify(inventory || {}))}
        />

        {/* Trust Badges Bar */}
        <div className="my-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-[#EDE4D6] rounded-2xl shadow-sm text-xs text-[#24211F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <PackageCheck size={20} />
            </div>
            <div>
              <p className="font-bold">40 Years Manufacturing</p>
              <p className="text-stone-500">Ajay Packers, Mirzapur</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="font-bold">100% Advance Payment</p>
              <p className="text-stone-500">Secured via Razorpay</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold">2 Business Days Dispatch</p>
              <p className="text-stone-500">Quick factory turnaround</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="font-bold">Pan-India Transport</p>
              <p className="text-stone-500">Reliable logistics partners</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-[#681C2D]">
                Related Packaging Designs
              </h2>
              <Link href="/products" className="text-xs font-semibold text-[#681C2D] hover:text-[#B8955A]">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
