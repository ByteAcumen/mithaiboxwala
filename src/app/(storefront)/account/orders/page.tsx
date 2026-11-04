import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Order } from '@/models';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function CustomerOrdersPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/auth/login?returnUrl=/account/orders');
  }

  await connectDB();
  const orders = await Order.find({ user: session.user._id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D] mb-6">
          <ArrowLeft size={14} /> Back to Account
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#681C2D] mb-8">
          Your Orders ({orders.length})
        </h1>

        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((o: any) => (
              <div key={o._id} className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#EDE4D6] gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#681C2D]">#{o.orderNumber}</span>
                    <p className="text-xs text-stone-500">
                      Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-700'}`}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                    <span className="font-bold text-sm text-[#24211F]">
                      ₹{o.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="py-4 space-y-2">
                  {o.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-stone-700">
                      <span>{item.snapshot.name} (×{item.quantity})</span>
                      <span className="font-semibold">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#EDE4D6] flex justify-between items-center text-xs">
                  <span className="text-stone-500">
                    Payment: <strong className="text-emerald-700 uppercase">{o.paymentStatus}</strong>
                  </span>
                  <Link
                    href={`/account/orders/${o._id}`}
                    className="font-semibold text-[#681C2D] hover:text-[#B8955A] flex items-center gap-1"
                  >
                    View Order Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#EDE4D6] text-stone-500">
              <p className="mb-4">No orders placed yet.</p>
              <Link href="/products" className="bg-[#681C2D] text-white px-5 py-2.5 rounded text-xs font-semibold">
                Explore Packaging
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
