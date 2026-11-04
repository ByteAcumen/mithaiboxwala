'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, Package, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/features/cart/store';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  /* Animate in/out */
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingThreshold = 5000;
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className="w-screen max-w-md flex flex-col shadow-2xl"
          style={{
            background: '#fff',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{
              background: 'linear-gradient(135deg,#3A0D18 0%,#681C2D 100%)',
              borderBottom: '1px solid rgba(184,149,90,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(184,149,90,0.2)' }}
              >
                <ShoppingBag size={18} className="text-[#B8955A]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-white leading-tight">
                  Your Cart
                </h2>
                <p className="text-[10px] text-[#B8955A]/80 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(237,228,214,0.7)', background: 'rgba(250,247,240,0.08)' }}
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Free shipping progress ── */}
          {subtotal > 0 && (
            <div className="px-6 py-3" style={{ background: '#FAF7F0', borderBottom: '1px solid #EDE4D6' }}>
              {remainingForFree === 0 ? (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px]">✓</span>
                  Free shipping unlocked!
                </p>
              ) : (
                <p className="text-[11px] font-medium" style={{ color: '#5C5855' }}>
                  Add <strong style={{ color: '#681C2D' }}>₹{remainingForFree.toLocaleString('en-IN')}</strong> more for free shipping
                </p>
              )}
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: '#EDE4D6' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${freeShippingProgress}%`,
                    background: freeShippingProgress === 100
                      ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                      : 'linear-gradient(90deg,#681C2D,#B8955A)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Item list ── */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)' }}
                >
                  <ShoppingBag size={36} className="text-[#B8955A]" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#24211F' }}>
                  Your cart is empty
                </h3>
                <p className="text-sm mb-8" style={{ color: '#8C8885' }}>
                  Discover our luxury mithai packaging collections, festive boxes, and wholesale ranges.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#681C2D,#8B2B3F)' }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId || 'default'}`}
                    className="flex gap-3 p-3 rounded-2xl group"
                    style={{ border: '1px solid #EDE4D6', background: '#FAF7F0' }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = '#DDD5C8'; }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = '#EDE4D6'; }}
                  >
                    {/* Image */}
                    <div
                      className="w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)' }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} className="text-[#B8955A]" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold line-clamp-1 mb-0.5" style={{ color: '#24211F' }}>
                        {item.name}
                      </h3>
                      <p className="text-[10px] font-mono" style={{ color: '#8C8885' }}>
                        {item.sku}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        {/* Qty controls */}
                        <div
                          className="flex items-center rounded-lg overflow-hidden"
                          style={{ border: '1px solid #DDD5C8' }}
                        >
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-[#EDE4D6]"
                            style={{ color: '#5C5855' }}
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-9 text-center text-xs font-bold" style={{ color: '#24211F' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-[#EDE4D6]"
                            style={{ color: '#5C5855' }}
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#681C2D' }}>
                            ₹{item.totalPrice.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px]" style={{ color: '#8C8885' }}>
                            ₹{item.unitPrice}/pc
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="self-start p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ color: '#8C8885' }}
                      onMouseEnter={(e: any) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseLeave={(e: any) => { e.currentTarget.style.color = '#8C8885'; e.currentTarget.style.background = 'transparent'; }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {items.length > 0 && (
            <div
              className="px-5 py-5 space-y-4"
              style={{ borderTop: '1px solid #EDE4D6', background: '#FAF7F0' }}
            >
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#5C5855' }}>Subtotal ({totalItems} items)</span>
                <span className="font-display text-xl font-bold" style={{ color: '#681C2D' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: '#8C8885' }}>
                Taxes & transport calculated at checkout. <strong>100% advance payment required.</strong>
              </p>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="text-center py-3 px-4 rounded-xl font-semibold text-sm border-2 transition-all duration-200"
                  style={{ borderColor: '#681C2D', color: '#681C2D' }}
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="group text-center py-3 px-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg,#681C2D,#8B2B3F)' }}
                >
                  Checkout
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
