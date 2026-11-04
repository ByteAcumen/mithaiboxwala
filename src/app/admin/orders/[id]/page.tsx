'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Truck, CheckCircle2, AlertCircle, MapPin,
  Clock, DollarSign, Package, ShieldCheck
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
        setNewStatus(data.data.status);
        if (data.data.shipment) {
          setCourier(data.data.shipment.courier || '');
          setTrackingNumber(data.data.shipment.trackingNumber || '');
          setTrackingUrl(data.data.shipment.trackingUrl || '');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note,
          courier,
          trackingNumber,
          trackingUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setSuccess('Order status and shipment details updated successfully.');
      setNote('');
      fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order and release reserved stock?')) return;
    setUpdating(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by Administrator' }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel order');
      }
      setSuccess('Order cancelled and reserved stock restored.');
      fetchOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-xs text-stone-500">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-rose-600 text-sm">Order not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-8">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#681C2D]">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-wider">Order Management</span>
          <h1 className="font-mono text-2xl font-bold text-[#681C2D]">#{order.orderNumber}</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_COLORS[order.status] || 'bg-stone-100'}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
          {['confirmed', 'processing'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={updating}
              className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items & Financials */}
        <div className="lg:col-span-7 space-y-6">
          {/* Items */}
          <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-[#24211F]">Ordered Packaging Items</h2>
            <div className="divide-y divide-[#EDE4D6]">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-stone-900">{item.snapshot.name}</p>
                    <p className="text-stone-500">SKU: {item.snapshot.sku} • Qty: {item.quantity} pcs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#681C2D]">₹{item.totalPrice.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-stone-400">₹{item.unitPrice}/pc</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#EDE4D6] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal:</span>
                <span className="font-semibold text-stone-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#681C2D] pt-2 border-t border-[#EDE4D6]">
                <span>Grand Total:</span>
                <span>₹{order.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address */}
          <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-3 text-xs">
            <h2 className="font-display text-lg font-bold text-[#24211F]">Customer Information</h2>
            <p><strong>Name:</strong> {order.customerSnapshot?.name}</p>
            <p><strong>Email:</strong> {order.customerSnapshot?.email}</p>
            <p><strong>Phone:</strong> {order.customerSnapshot?.phone}</p>
            <div className="pt-3 border-t border-[#EDE4D6]">
              <p className="font-bold text-stone-800 mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-[#681C2D]" /> Shipping Destination
              </p>
              <p>{order.shippingAddressSnapshot?.addressLine1}</p>
              {order.shippingAddressSnapshot?.addressLine2 && <p>{order.shippingAddressSnapshot?.addressLine2}</p>}
              <p>{order.shippingAddressSnapshot?.city}, {order.shippingAddressSnapshot?.state} – {order.shippingAddressSnapshot?.pincode}</p>
            </div>
          </div>
        </div>

        {/* Right: State Transition & Courier Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleUpdateStatus} className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-display text-lg font-bold text-[#24211F]">Update Order Workflow</h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Status Transition</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs bg-white"
              >
                <option value="pending_payment">Awaiting Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {newStatus === 'shipped' && (
              <div className="space-y-3 p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs">
                <p className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Truck size={15} /> Dispatch Consignment Details
                </p>
                <div>
                  <label className="block text-stone-700 mb-1 font-semibold">Courier / Transporter Name *</label>
                  <input
                    type="text"
                    required
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. V-Trans, SafeExpress, BlueDart"
                    className="w-full px-3 py-1.5 border border-sky-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1 font-semibold">Tracking LR / AWB Number *</label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TRK-98765432"
                    className="w-full px-3 py-1.5 border border-sky-300 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1 font-semibold">Tracking Portal URL</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 border border-sky-300 rounded bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Internal Note / Comment</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log internal updates, transport LR receipts, or customer instructions..."
                className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-2.5 rounded font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating Order...' : 'Save Changes'}
            </button>
          </form>

          {/* Status Timeline */}
          <div className="bg-white border border-[#EDE4D6] rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-display text-base font-bold text-[#24211F]">Audit History</h3>
            <div className="space-y-3 text-xs text-stone-600">
              {order.statusHistory?.map((h: any, i: number) => (
                <div key={i} className="pb-2 border-b border-stone-100 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase text-[#681C2D]">{h.status}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(h.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {h.note && <p className="text-stone-500 mt-0.5">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
