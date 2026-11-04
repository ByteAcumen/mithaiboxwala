import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Wishlist } from '@/models';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowLeft, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/auth/login?returnUrl=/account/wishlist');
  }

  await connectDB();
  const wishlist = await Wishlist.findOne({ user: session.user._id })
    .populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' },
    })
    .lean();

  const products = (wishlist?.products as any[]) || [];

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D] mb-6">
          <ArrowLeft size={14} /> Back to Account
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#681C2D] mb-8">
          Saved Wishlist ({products.length})
        </h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#EDE4D6] rounded-2xl p-12 text-center max-w-md mx-auto text-stone-500 shadow-sm">
            <Heart size={48} className="text-[#B8955A] mx-auto mb-3" />
            <p className="font-display text-xl text-[#24211F] mb-1">Your Wishlist is Empty</p>
            <p className="text-xs text-stone-500 mb-6">
              Bookmark your favorite sweet boxes and packaging formats while browsing.
            </p>
            <Link
              href="/products"
              className="bg-[#681C2D] text-white px-5 py-2.5 rounded-lg text-xs font-semibold inline-block"
            >
              Explore Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
