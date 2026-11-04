import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Order, Address } from '@/models';
import { Package, MapPin, Heart, LogOut, ChevronRight, User as UserIcon } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/auth/login?returnUrl=/account');
  }

  await connectDB();
  const [orders, addresses] = await Promise.all([
    Order.find({ user: session.user._id }).sort({ createdAt: -1 }).limit(5).lean(),
    Address.find({ user: session.user._id }).lean(),
  ]);

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile */}
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#681C2D] text-[#FAF7F0] flex items-center justify-center font-display text-2xl font-bold">
              {session.user.name ? session.user.name[0].toUpperCase() : session.user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#24211F]">
                {session.user.name || 'Packaging Partner'}
              </h1>
              <p className="text-xs text-stone-500">{session.user.email}</p>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 py-2 px-3 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={14} /> Log Out
            </button>
          </form>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link
            href="/account/orders"
            className="bg-white border border-[#EDE4D6] rounded-xl p-5 hover:border-[#B8955A] hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#24211F]">Your Orders</p>
                <p className="text-xs text-stone-500">Track shipments & history</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </Link>

          <Link
            href="/account/addresses"
            className="bg-white border border-[#EDE4D6] rounded-xl p-5 hover:border-[#B8955A] hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#24211F]">Saved Addresses</p>
                <p className="text-xs text-stone-500">{addresses.length} saved destinations</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </Link>

          <Link
            href="/account/wishlist"
            className="bg-white border border-[#EDE4D6] rounded-xl p-5 hover:border-[#B8955A] hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF7F0] text-[#681C2D] flex items-center justify-center">
                <Heart size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#24211F]">Saved Wishlist</p>
                <p className="text-xs text-stone-500">Saved box designs</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-[#681C2D]">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-semibold text-[#681C2D] hover:text-[#B8955A]">
              View All Orders →
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-[#EDE4D6]">
              {orders.map((o: any) => (
                <div key={o._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#681C2D]">#{o.orderNumber}</span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-stone-700 font-medium mt-1">
                      {o.items.length} items • ₹{o.grandTotal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ORDER_STATUS_COLORS[o.status] || 'bg-stone-100 text-stone-700'}`}>
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                    <Link
                      href={`/account/orders/${o._id}`}
                      className="text-xs font-semibold text-[#681C2D] hover:text-[#B8955A] flex items-center gap-1"
                    >
                      Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500 text-sm">
              <p>You haven’t placed any orders yet.</p>
              <Link href="/products" className="text-xs font-semibold text-[#681C2D] hover:underline mt-2 inline-block">
                Start shopping our collections →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
