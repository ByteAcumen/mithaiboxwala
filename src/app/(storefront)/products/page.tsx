import React from 'react';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import { Product, Category } from '@/models';
import { ProductCard } from '@/components/product/ProductCard';
import { Filter, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort || 'newest';
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search;
  const limit = 16;
  const skip = (page - 1) * limit;

  await connectDB();

  let query: any = { isActive: true };

  let currentCategory = null;
  if (categorySlug) {
    currentCategory = await Category.findOne({ slug: categorySlug }).lean();
    if (currentCategory) {
      query.category = currentCategory._id;
    }
  }

  if (search) {
    query.$text = { $search: search };
  }

  let sortQuery: any = { createdAt: -1 };
  if (sort === 'price_asc') sortQuery = { basePrice: 1 };
  if (sort === 'price_desc') sortQuery = { basePrice: -1 };
  if (sort === 'popular') sortQuery = { totalSold: -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link href="/" className="hover:text-[#681C2D]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#24211F] font-medium">
            {currentCategory ? (currentCategory as any).name : 'All Packaging'}
          </span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#681C2D]">
            {currentCategory ? (currentCategory as any).name : 'Packaging Catalog'}
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {currentCategory?.description || 'Browse our complete range of premium mithai boxes, sweet packaging, dry fruit containers, and festive hampers.'}
          </p>
        </div>

        {/* Layout with Sidebar & Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#EDE4D6] rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-bold text-[#681C2D] uppercase tracking-wider mb-4 flex items-center gap-2">
                <SlidersHorizontal size={14} /> Categories
              </h2>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !categorySlug ? 'bg-[#681C2D] text-white font-semibold' : 'text-stone-700 hover:bg-[#FAF7F0]'
                  }`}
                >
                  All Categories
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      categorySlug === cat.slug
                        ? 'bg-[#681C2D] text-white font-semibold'
                        : 'text-stone-700 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Wholesale Banner */}
            <div className="bg-[#681C2D] text-white rounded-xl p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#B8955A]">Wholesale Inquiries</h3>
              <p className="text-xs text-[#EDE4D6] leading-relaxed">
                Looking for 500+ units or custom foil printing with your sweet shop branding?
              </p>
              <Link
                href="/wholesale"
                className="inline-block bg-[#B8955A] hover:bg-[#CBA96E] text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
              >
                Request Custom Quote →
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between bg-white border border-[#EDE4D6] rounded-xl p-4 mb-6 shadow-sm">
              <p className="text-xs text-stone-500">
                Showing <strong className="text-stone-800">{products.length}</strong> of{' '}
                <strong className="text-stone-800">{total}</strong> products
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">Sort by:</span>
                <Link
                  href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}sort=newest`}
                  className={`px-2.5 py-1 rounded ${sort === 'newest' ? 'bg-[#681C2D] text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  Newest
                </Link>
                <Link
                  href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}sort=price_asc`}
                  className={`px-2.5 py-1 rounded ${sort === 'price_asc' ? 'bg-[#681C2D] text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}sort=price_desc`}
                  className={`px-2.5 py-1 rounded ${sort === 'price_desc' ? 'bg-[#681C2D] text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={JSON.parse(JSON.stringify(product))} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#EDE4D6] rounded-xl p-12 text-center text-stone-500">
                <p className="font-display text-xl text-[#24211F] mb-2">No products found</p>
                <p className="text-sm mb-6">Try selecting another category or clear your search filters.</p>
                <Link
                  href="/products"
                  className="bg-[#681C2D] text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Reset Filters
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <Link
                      key={pNum}
                      href={`/products?${categorySlug ? `category=${categorySlug}&` : ''}page=${pNum}&sort=${sort}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                        page === pNum
                          ? 'bg-[#681C2D] text-white'
                          : 'bg-white border border-[#EDE4D6] text-stone-700 hover:bg-[#FAF7F0]'
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
