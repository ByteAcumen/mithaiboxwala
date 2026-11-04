import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import { Product, Category, Inventory } from '@/models';
import { getAdminSession } from '@/lib/auth/session';
import { Plus, Edit, Eye, Search, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  const { search, category } = await searchParams;

  await connectDB();

  let query: any = {};
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const [products, categories] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).populate('category', 'name').lean(),
    Category.find({ isActive: true }).select('name slug').lean(),
  ]);

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Product Catalog</h1>
          <p className="text-xs text-stone-500 mt-1">Manage all packaging products, pricing, and variants</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form method="GET" className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by box name or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-[#EDE4D6] rounded-lg text-xs"
          />
        </form>

        <div className="flex items-center gap-2 text-xs text-stone-600 w-full sm:w-auto justify-end">
          <span>Category:</span>
          <select
            defaultValue={category || ''}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = val ? `/admin/products?category=${val}` : '/admin/products';
            }}
            className="px-3 py-1.5 border border-[#EDE4D6] rounded-lg bg-white text-xs"
          >
            <option value="">All Categories</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">MOQ</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#FAF7F0] border border-[#EDE4D6] overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] text-stone-400">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          'Box'
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{p.name}</p>
                        <p className="text-[10px] text-stone-500">{p.unit || 'piece'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium text-stone-600">{p.sku}</td>
                  <td className="p-4 font-medium text-stone-700">{(p.category as any)?.name || '—'}</td>
                  <td className="p-4 font-bold text-[#681C2D]">₹{p.basePrice?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-medium">{p.moq} pcs</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/products/${p.slug}`}
                      target="_blank"
                      className="text-stone-400 hover:text-stone-700 p-1 inline-block"
                      title="View on storefront"
                    >
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    No products found. Click &quot;Add Product&quot; to create your first packaging box.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
