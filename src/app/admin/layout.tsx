import React from 'react';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Users, Tag, MessageSquare, Settings, LogOut, ShieldAlert
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If on login page, render children without sidebar
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#24211F] flex">
      {session && (
        <aside className="w-64 bg-[#24211F] text-[#FAF7F0] flex-shrink-0 flex flex-col justify-between hidden md:flex">
          <div>
            {/* Logo */}
            <div className="p-6 border-b border-stone-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#681C2D] text-[#B8955A] flex items-center justify-center font-bold text-sm">
                MB
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-[#FAF7F0] leading-none">
                  Admin Panel
                </h1>
                <p className="text-[10px] text-stone-400 mt-1">Ajay Packers — Mirzapur</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="p-4 space-y-1 text-xs font-medium">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <LayoutDashboard size={16} /> Overview
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Package size={16} /> Products Catalog
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <ShoppingCart size={16} /> Orders & Dispatch
              </Link>
              <Link
                href="/admin/inventory"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Warehouse size={16} /> Inventory Stock
              </Link>
              <Link
                href="/admin/enquiries"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <MessageSquare size={16} /> Wholesale CRM
              </Link>
              <Link
                href="/admin/customers"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Users size={16} /> Customers
              </Link>
              <Link
                href="/admin/coupons"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Tag size={16} /> Coupons & Discounts
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <Settings size={16} /> Store Settings
              </Link>
            </nav>
          </div>

          {/* User profile & Logout */}
          <div className="p-4 border-t border-stone-800">
            <div className="mb-3 px-3">
              <p className="text-xs font-bold text-white truncate">{session.admin.name}</p>
              <p className="text-[10px] text-[#B8955A] font-semibold uppercase">{session.admin.role.replace('_', ' ')}</p>
            </div>
            <form action="/api/admin/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-800 hover:bg-rose-900 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </form>
          </div>
        </aside>
      )}

      {/* Main admin content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
