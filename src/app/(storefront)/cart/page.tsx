'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.success) {
        setDiscount(data.data.discountAmount || 0);
        setAppliedCoupon(couponCode.toUpperCase());
        setCouponError('');
      } else {
        setCouponError(data.error || 'Failed to apply coupon');
      }
    } catch {
      setCouponError('Error applying coupon');
    }
  };

  const grandTotal = Math.max(0, subtotal - discount);

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F0] min-h-[60vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#EDE4D6] rounded-2xl p-10 text-center shadow-sm">
          <ShoppingBag size={56} className="text-[#B8955A] mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-[#24211F] mb-2">Your Shopping Cart is Empty</h1>
          <p className="text-sm text-stone-500 mb-6">
            Explore our curated collections of luxury sweet boxes, dry fruit boxes, and festive packaging.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#681C2D] hover:bg-[#8B2B3F] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-[#681C2D] mb-8">
          Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items list */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAF7F0] border-b border-[#EDE4D6] hidden sm:grid sm:grid-cols-12 text-xs font-semibold text-stone-600">
                <span className="col-span-6">Product</span>
                <span className="col-span-2 text-center">Quantity</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <div className="divide-y divide-[#EDE4D6]">
                {items.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-6 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-[#FAF7F0] border border-[#EDE4D6] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-xs text-stone-400">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          'Box'
                        )}
                      </div>
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-semibold text-sm text-[#24211F] hover:text-[#681C2D]">
                          {item.name}
                        </Link>
                        <p className="text-xs text-stone-500 mt-0.5">SKU: {item.sku}</p>
                        <p className="text-xs text-stone-500">MOQ: {item.moq} pcs</p>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 mt-2 sm:hidden"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex items-center sm:justify-center">
                      <div className="flex items-center border border-[#EDE4D6] rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(item.moq, item.quantity - 10), item.variantId)}
                          className="px-2.5 py-1 text-sm font-bold text-stone-600 hover:bg-[#FAF7F0]"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 10, item.variantId)}
                          className="px-2.5 py-1 text-sm font-bold text-stone-600 hover:bg-[#FAF7F0]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 text-right text-xs sm:text-sm text-stone-600">
                      ₹{item.unitPrice.toLocaleString('en-IN')}/pc
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-bold text-sm text-[#681C2D]">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-stone-400 hover:text-rose-600 hidden sm:block p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#FAF7F0] border-t border-[#EDE4D6] flex justify-between items-center text-xs">
                <button
                  onClick={clearCart}
                  className="text-stone-500 hover:text-rose-600 font-medium"
                >
                  Clear Entire Cart
                </button>
                <Link href="/products" className="text-[#681C2D] font-semibold hover:text-[#B8955A]">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-display text-lg font-bold text-[#24211F] pb-3 border-b border-[#EDE4D6]">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon ({appliedCoupon})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping & Packaging</span>
                  <span className="text-xs text-stone-500">Calculated at checkout</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 border border-[#EDE4D6] rounded text-xs uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-[#24211F] hover:bg-[#681C2D] text-white px-3 py-2 rounded text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-600 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <Tag size={12} /> Coupon {appliedCoupon} applied
                  </p>
                )}
              </form>

              <div className="pt-4 border-t border-[#EDE4D6] flex justify-between items-baseline">
                <span className="font-bold text-stone-800">Payable Total</span>
                <span className="font-display text-2xl font-bold text-[#681C2D]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-3.5 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <div className="pt-2 text-xs text-stone-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>100% Advance Payment via Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
