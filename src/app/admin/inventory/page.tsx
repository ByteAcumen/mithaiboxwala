'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Warehouse, AlertTriangle, ArrowLeft, RefreshCw, Plus, Minus } from 'lucide-react';

export default function AdminInventoryPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adjustVal, setAdjustVal] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (data.success && data.data) {
        setInventories(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async (id: string, delta: number) => {
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustment: delta,
          reason: adjustReason || (delta > 0 ? 'Stock addition' : 'Stock reduction'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdatingId(null);
        setAdjustReason('');
        fetchInventory();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#24211F]">Inventory Management</h1>
          <p className="text-xs text-stone-500 mt-1">Real-time stock on hand, reserved stock, and reconciliation</p>
        </div>
        <button
          onClick={fetchInventory}
          className="bg-white border border-[#EDE4D6] text-stone-700 hover:bg-[#FAF7F0] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Stock
        </button>
      </div>

      <div className="bg-white border border-[#EDE4D6] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#EDE4D6] text-stone-600 font-semibold">
                <th className="p-4">Box Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">On Hand</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Available</th>
                <th className="p-4">Threshold</th>
                <th className="p-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D6]">
              {inventories.map((inv: any) => {
                const available = inv.quantityOnHand - inv.quantityReserved;
                const isLow = available <= inv.lowStockThreshold;

                return (
                  <tr key={inv._id} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="p-4 font-semibold text-stone-900">
                      {inv.product?.name || 'Unknown Product'}
                    </td>
                    <td className="p-4 font-mono text-stone-600">{inv.product?.sku || '—'}</td>
                    <td className="p-4 font-bold text-stone-900">{inv.quantityOnHand} pcs</td>
                    <td className="p-4 text-stone-500">{inv.quantityReserved} pcs</td>
                    <td className="p-4">
                      <span className={`font-bold ${isLow ? 'text-amber-600 flex items-center gap-1' : 'text-emerald-700'}`}>
                        {available} pcs {isLow && <AlertTriangle size={12} />}
                      </span>
                    </td>
                    <td className="p-4 text-stone-500">{inv.lowStockThreshold} pcs</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleAdjust(inv._id, 100)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-semibold"
                        title="Add 100 units"
                      >
                        +100
                      </button>
                      <button
                        onClick={() => handleAdjust(inv._id, -50)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded text-xs font-semibold"
                        title="Deduct 50 units"
                      >
                        -50
                      </button>
                    </td>
                  </tr>
                );
              })}
              {inventories.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    No tracked inventory records yet. Create products with stock tracking enabled.
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
