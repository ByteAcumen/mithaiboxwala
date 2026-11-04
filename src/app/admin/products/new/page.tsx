'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    category: '',
    description: '',
    shortDescription: '',
    basePrice: 50,
    salePrice: 0,
    moq: 50,
    unit: 'piece',
    compartments: 4,
    materials: 'Virgin Paperboard',
    colors: 'Gold, Red, Burgundy',
    isActive: true,
    isFeatured: true,
    isCustomizable: true,
    imageUrl: '',
    dimensions: { length: 20, width: 15, height: 5, unit: 'cm' },
    bulkPricingTiers: [{ minQty: 100, pricePerUnit: 45 }],
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setForm((prev) => ({ ...prev, category: data.data[0]._id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const sku = 'MB-' + name.slice(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    setForm((prev) => ({ ...prev, name, slug, sku }));
  };

  const handleAddTier = () => {
    setForm((prev) => ({
      ...prev,
      bulkPricingTiers: [...prev.bulkPricingTiers, { minQty: 500, pricePerUnit: 40 }],
    }));
  };

  const handleRemoveTier = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      bulkPricingTiers: prev.bulkPricingTiers.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        salePrice: Number(form.salePrice) || undefined,
        moq: Number(form.moq),
        compartments: Number(form.compartments),
        materials: form.materials.split(',').map((s) => s.trim()),
        colors: form.colors.split(',').map((s) => s.trim()),
        images: form.imageUrl ? [{ url: form.imageUrl, altText: form.name, sortOrder: 0 }] : [],
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D]">
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Add Packaging Product</h1>
          <p className="text-xs text-stone-500 mt-1">Create a new sweet box, dry fruit container, or luxury hamper</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm">
        {/* Core details */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Gold 12-Cavity Mithai Box"
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://... or /uploads/..."
              className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
            />
          </div>
        </div>

        {/* Pricing and Quantities */}
        <div className="pt-6 border-t border-[#EDE4D6] space-y-4">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Pricing & Minimum Order</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Base Price (INR) *</label>
              <input
                type="number"
                min={0}
                required
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Sale Price (Optional)</label>
              <input
                type="number"
                min={0}
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Minimum Order Qty (MOQ) *</label>
              <input
                type="number"
                min={1}
                required
                value={form.moq}
                onChange={(e) => setForm({ ...form, moq: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>
          </div>

          {/* Bulk Tiers */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-stone-700">Bulk Pricing Tiers</label>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-xs text-[#681C2D] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Tier
              </button>
            </div>
            {form.bulkPricingTiers.map((tier, idx) => (
              <div key={idx} className="flex items-center gap-4 text-xs">
                <span>Min Qty:</span>
                <input
                  type="number"
                  value={tier.minQty}
                  onChange={(e) => {
                    const updated = [...form.bulkPricingTiers];
                    updated[idx].minQty = parseInt(e.target.value, 10) || 0;
                    setForm({ ...form, bulkPricingTiers: updated });
                  }}
                  className="w-24 px-2 py-1 border border-[#EDE4D6] rounded"
                />
                <span>Price per Unit:</span>
                <input
                  type="number"
                  value={tier.pricePerUnit}
                  onChange={(e) => {
                    const updated = [...form.bulkPricingTiers];
                    updated[idx].pricePerUnit = parseFloat(e.target.value) || 0;
                    setForm({ ...form, bulkPricingTiers: updated });
                  }}
                  className="w-24 px-2 py-1 border border-[#EDE4D6] rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTier(idx)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="pt-6 border-t border-[#EDE4D6] space-y-4">
          <h2 className="font-display text-lg font-bold text-[#24211F]">Technical Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Length (cm)</label>
              <input
                type="number"
                value={form.dimensions.length}
                onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, length: parseFloat(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Width (cm)</label>
              <input
                type="number"
                value={form.dimensions.width}
                onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, width: parseFloat(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={form.dimensions.height}
                onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, height: parseFloat(e.target.value) || 0 } })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Cavities / Compartments</label>
              <input
                type="number"
                value={form.compartments}
                onChange={(e) => setForm({ ...form, compartments: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-[#EDE4D6] flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-[#EDE4D6] text-stone-600 rounded text-xs font-semibold hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-6 py-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            <span>{loading ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
