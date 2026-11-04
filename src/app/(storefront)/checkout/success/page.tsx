import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone, Mail } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="bg-[#FAF7F0] min-h-[70vh] py-16 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-10 text-center shadow-lg mx-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
          Payment Confirmed
        </span>
        <h1 className="font-display text-3xl font-bold text-[#681C2D] mt-1 mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-sm text-stone-600 mb-6">
          Your order has been placed successfully and 100% advance payment has been verified.
        </p>

        {orderNumber && (
          <div className="p-4 bg-[#FAF7F0] border border-[#EDE4D6] rounded-xl mb-6">
            <span className="text-xs text-stone-500 block">Order Reference Number:</span>
            <span className="font-mono text-lg font-bold text-[#681C2D]">{orderNumber}</span>
          </div>
        )}

        <div className="text-xs text-stone-600 text-left bg-stone-50 p-4 rounded-xl space-y-2 mb-8">
          <p>• <strong>Manufacturing & Dispatch:</strong> Scheduled within 2 business days from Ajay Packers, Mirzapur.</p>
          <p>• <strong>Order Updates:</strong> A confirmation receipt and tracking notification will be delivered to your registered email.</p>
          <p>• <strong>Support:</strong> Email {BUSINESS.email} with your order number for queries.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-3 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Package size={14} /> View Order Status
          </Link>
          <Link
            href="/products"
            className="flex-1 border border-[#681C2D] text-[#681C2D] hover:bg-[#FAF7F0] py-3 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
