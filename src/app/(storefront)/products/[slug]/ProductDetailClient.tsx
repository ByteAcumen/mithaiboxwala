'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Zap, Heart, Check, Share2, HelpCircle,
  ShieldCheck, AlertCircle, Sparkles, MessageCircle
} from 'lucide-react';
import { useCartStore } from '@/features/cart/store';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: any;
  inventory: any;
}

export function ProductDetailClient({ product, inventory }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(product.moq || 1);
  const [activeTab, setActiveTab] = useState<'specs' | 'pricing' | 'shipping'>('specs');
  const [copied, setCopied] = useState(false);

  // Calculate tier price if applicable
  const getUnitPrice = (qty: number) => {
    let effective = product.salePrice ?? product.basePrice;
    if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
      const applicable = [...product.bulkPricingTiers]
        .sort((a, b) => b.minQty - a.minQty)
        .find((tier) => qty >= tier.minQty);
      if (applicable) {
        effective = applicable.pricePerUnit;
      }
    }
    return effective;
  };

  const currentUnitPrice = getUnitPrice(quantity);
  const currentTotal = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      imageUrl: product.images?.[selectedImage]?.url || product.images?.[0]?.url,
      quantity,
      unitPrice: currentUnitPrice,
      totalPrice: currentTotal,
      moq: product.moq || 1,
    });
    if ((window as any).__showToast) {
      (window as any).__showToast(`Added ${quantity} units to your cart`, 'success');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: '', altText: product.name }];

  return (
    <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden p-6 lg:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-[#FAF7F0] border border-[#EDE4D6] rounded-xl overflow-hidden flex items-center justify-center">
            {images[selectedImage]?.url ? (
              <img
                src={images[selectedImage].url}
                alt={images[selectedImage].altText || product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="text-center p-8 text-stone-400">
                <span className="font-display text-2xl text-stone-300 block mb-1">Mithai Box Wala</span>
                <span className="text-sm">Manufactured by Ajay Packers</span>
              </div>
            )}

            {product.isCustomizable && (
              <div className="absolute top-4 left-4 bg-[#B8955A] text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
                Custom Logo Printing Available
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-[#681C2D] shadow-md' : 'border-[#EDE4D6] opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#B8955A] uppercase tracking-wider">
                {product.category?.name || 'Sweet Packaging'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-1.5 text-stone-400 hover:text-[#681C2D] rounded-full transition-colors flex items-center gap-1 text-xs"
                >
                  <Share2 size={15} />
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-[#24211F] leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span>SKU: <strong className="text-stone-700">{product.sku}</strong></span>
              <span>•</span>
              <span>MOQ: <strong className="text-stone-700">{product.moq} {product.unit || 'pcs'}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check size={14} /> Ready for Dispatch
              </span>
            </div>

            {/* Pricing Box */}
            <div className="p-4 bg-[#FAF7F0] border border-[#EDE4D6] rounded-xl flex items-baseline justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-[#681C2D]">
                    ₹{currentUnitPrice.toLocaleString('en-IN')}
                  </span>
                  {product.salePrice && product.salePrice < product.basePrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{product.basePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-stone-500">/ {product.unit || 'piece'}</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  100% advance payment required before dispatch.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-500 block">Total for {quantity} pcs</span>
                <span className="text-lg font-bold text-[#24211F]">
                  ₹{currentTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24211F] block">
                Quantity (Minimum Order: {product.moq})
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#EDE4D6] rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(product.moq || 1, q - 10))}
                    className="px-3.5 py-2 text-stone-600 hover:bg-[#FAF7F0] font-bold transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={product.moq || 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuantity(isNaN(val) ? product.moq : Math.max(product.moq, val));
                    }}
                    className="w-20 text-center text-sm font-bold border-x border-[#EDE4D6] py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 10)}
                    className="px-3.5 py-2 text-stone-600 hover:bg-[#FAF7F0] font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
                  <span className="text-xs text-[#B8955A] font-medium flex items-center gap-1">
                    <Sparkles size={14} /> Volume pricing applied
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 border-2 border-[#681C2D] text-[#681C2D] hover:bg-[#681C2D] hover:text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
              >
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 bg-[#681C2D] hover:bg-[#8B2B3F] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>

            <div className="pt-2">
              <Link
                href="/wholesale"
                className="w-full py-2.5 px-4 bg-[#FAF7F0] hover:bg-[#EDE4D6] border border-[#B8955A]/40 rounded-lg text-xs font-semibold text-[#681C2D] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={15} />
                <span>Request Custom Bulk Quotation (500+ Units)</span>
              </Link>
            </div>
          </div>

          {/* Specifications and Tabs */}
          <div className="mt-8 pt-6 border-t border-[#EDE4D6]">
            <div className="flex border-b border-[#EDE4D6] mb-4 gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 transition-colors border-b-2 ${
                  activeTab === 'specs' ? 'border-[#681C2D] text-[#681C2D]' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Box Specifications
              </button>
              {product.bulkPricingTiers?.length > 0 && (
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`pb-2 transition-colors border-b-2 ${
                    activeTab === 'pricing' ? 'border-[#681C2D] text-[#681C2D]' : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Wholesale Tiers
                </button>
              )}
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 transition-colors border-b-2 ${
                  activeTab === 'shipping' ? 'border-[#681C2D] text-[#681C2D]' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Dispatch & Transport
              </button>
            </div>

            {activeTab === 'specs' && (
              <div className="text-xs space-y-2 text-stone-700">
                {product.dimensions && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Dimensions:</span>
                    <span className="font-semibold">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit || 'cm'}
                    </span>
                  </div>
                )}
                {product.compartments && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Cavities / Compartments:</span>
                    <span className="font-semibold">{product.compartments} Compartments</span>
                  </div>
                )}
                {product.materials?.length > 0 && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Material:</span>
                    <span className="font-semibold">{product.materials.join(', ')}</span>
                  </div>
                )}
                {product.colors?.length > 0 && (
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span className="text-stone-500">Available Colors:</span>
                    <span className="font-semibold">{product.colors.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Manufacturer:</span>
                  <span className="font-semibold">Ajay Packers, Mirzapur UP</span>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && product.bulkPricingTiers && (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-stone-600">
                      <th className="p-2 border border-[#EDE4D6]">Quantity Range</th>
                      <th className="p-2 border border-[#EDE4D6]">Price per Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.bulkPricingTiers.map((tier: any, i: number) => (
                      <tr key={i} className="border-b border-[#EDE4D6]">
                        <td className="p-2">
                          {tier.minQty} {tier.maxQty ? `– ${tier.maxQty}` : '+'} units
                        </td>
                        <td className="p-2 font-bold text-[#681C2D]">
                          ₹{tier.pricePerUnit.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="text-xs text-stone-600 space-y-2">
                <p><strong>Standard Dispatch:</strong> 2 business days from order confirmation.</p>
                <p><strong>Weekend Policy:</strong> Orders received on Friday dispatch the following Monday.</p>
                <p><strong>Shipping Charges:</strong> Calculated and applicable extra based on carton volume and destination.</p>
                <p><strong>Return Policy:</strong> Strict no-return policy once dispatched from factory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
