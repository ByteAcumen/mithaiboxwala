'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/features/cart/store';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Script from 'next/script';
import { BUSINESS } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: '',
    country: 'India',
  });

  const [billingSame, setBillingSame] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF7F0] min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#EDE4D6] text-center max-w-sm">
          <p className="font-display text-xl text-[#24211F] mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-[#681C2D] text-white px-5 py-2.5 rounded font-semibold text-sm"
          >
            Browse Packaging
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Initiate checkout server-side
      const res = await fetch('/api/checkout/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          shippingAddress: {
            ...shippingAddress,
            fullName: shippingAddress.fullName || contact.name,
            phone: shippingAddress.phone || contact.phone,
          },
          billingAddressSameAsShipping: billingSame,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Checkout initiation failed');
      }

      const { orderId, orderNumber, razorpayOrderId, amount, currency, razorpayKeyId } = data.data;

      // 2. Open Razorpay or fallback to mock dev payment
      if (typeof window !== 'undefined' && (window as any).Razorpay && razorpayKeyId) {
        const options = {
          key: razorpayKeyId,
          amount,
          currency: currency || 'INR',
          name: BUSINESS.brand,
          description: `Order #${orderNumber}`,
          order_id: razorpayOrderId,
          prefill: {
            name: contact.name,
            email: contact.email,
            contact: contact.phone,
          },
          theme: {
            color: '#681C2D',
          },
          handler: async function (response: any) {
            // 3. Verify server-side
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              router.push(`/checkout/success?orderNumber=${orderNumber}`);
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setError(resp.error?.description || 'Payment was declined by bank');
        });
        rzp.open();
      } else {
        // Mock verification in development when Razorpay script isn't live
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'dev_mock_signature',
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          router.push(`/checkout/success?orderNumber=${orderNumber}`);
        } else {
          // If server rejects mock signature, show instruction
          setError('Razorpay credentials required for live payments. Check .env.local configuration.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-[#681C2D] mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-display text-lg font-bold text-[#24211F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#681C2D] text-white text-xs flex items-center justify-center font-bold">1</span>
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                    placeholder="order@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-display text-lg font-bold text-[#24211F] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#681C2D] text-white text-xs flex items-center justify-center font-bold">2</span>
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Street Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                    placeholder="House/Shop number, Building, Street"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                    placeholder="Landmark, Area"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-sm"
                      placeholder="6 digits"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Consent Notice */}
            <div className="p-4 bg-[#FAF7F0] border border-[#EDE4D6] rounded-xl text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-[#681C2D]">Wholesale & Order Policies:</p>
              <p>• 100% advance payment required before dispatch.</p>
              <p>• Dispatch takes 2 business days; Friday orders dispatch Monday.</p>
              <p>• No returns are accepted once products leave Ajay Packers premises.</p>
            </div>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
              <h2 className="font-display text-lg font-bold text-[#24211F] pb-3 border-b border-[#EDE4D6]">
                Order Items ({items.length})
              </h2>

              <div className="max-h-60 overflow-y-auto divide-y divide-[#EDE4D6] pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-stone-800">{item.name}</p>
                      <p className="text-stone-500">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                    </div>
                    <span className="font-bold text-[#681C2D]">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EDE4D6] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-bold text-stone-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Packing & Transport</span>
                  <span className="text-stone-500">Included or billed extra per destination</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EDE4D6] flex justify-between items-baseline">
                <span className="font-bold text-stone-800">Payable Amount</span>
                <span className="font-display text-2xl font-bold text-[#681C2D]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-4 px-6 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                <span>{loading ? 'Securing Transaction...' : 'Pay with Razorpay (100% Advance)'}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  PCI-DSS Encrypted 256-bit Razorpay Gateway
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
