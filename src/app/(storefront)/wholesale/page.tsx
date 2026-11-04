'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, PackageCheck, Factory, Sparkles, Building2 } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    productInterest: 'Mithai Boxes',
    estimatedQuantity: 500,
    customizationRequirements: '',
    destination: '',
    requiredDeliveryDate: '',
    message: '',
    website: '', // honeypot
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/wholesale-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit wholesale inquiry');
      }

      setSuccessMsg(
        `Thank you, ${formData.contactName}. Your wholesale enquiry has been registered with reference #${data.data?.referenceNumber}. Ajay Kumar & Sanjay Kumar will reach out shortly.`
      );
      setFormData({
        contactName: '',
        companyName: '',
        email: '',
        phone: '',
        productInterest: 'Mithai Boxes',
        estimatedQuantity: 500,
        customizationRequirements: '',
        destination: '',
        requiredDeliveryDate: '',
        message: '',
        website: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">
            Direct Manufacturing Supply
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#681C2D]">
            Wholesale & Bulk Packaging Quotation
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Manufactured by Ajay Packers in Mirzapur, UP. Supplying sweet houses, confectioners, and corporate gifting specialists with tier-based volume pricing.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl shadow-sm text-center">
            <Factory className="text-[#681C2D] mx-auto mb-2" size={28} />
            <h3 className="font-bold text-sm text-[#24211F]">Direct Factory Rates</h3>
            <p className="text-xs text-stone-500 mt-1">Tier-based discounts for orders from 500 to 50,000+ units.</p>
          </div>
          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl shadow-sm text-center">
            <Sparkles className="text-[#681C2D] mx-auto mb-2" size={28} />
            <h3 className="font-bold text-sm text-[#24211F]">Custom Branding</h3>
            <p className="text-xs text-stone-500 mt-1">Embossing, foil stamping, and tailored compartment dividers.</p>
          </div>
          <div className="bg-white border border-[#EDE4D6] p-6 rounded-2xl shadow-sm text-center">
            <PackageCheck className="text-[#681C2D] mx-auto mb-2" size={28} />
            <h3 className="font-bold text-sm text-[#24211F]">Pan-India Logistics</h3>
            <p className="text-xs text-stone-500 mt-1">Dispatched directly with transport coordination across all states.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-[#EDE4D6] rounded-2xl p-8 sm:p-12 shadow-sm">
          {successMsg && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle2 size={20} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Company / Sweet House Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Royal Sweets & Confectionery"
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Category</label>
                <select
                  value={formData.productInterest}
                  onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm bg-white"
                >
                  <option>Mithai Boxes</option>
                  <option>Dry Fruit Boxes</option>
                  <option>Chocolate Boxes</option>
                  <option>Cake Boxes</option>
                  <option>Gift Hampers</option>
                  <option>Wedding Packaging</option>
                  <option>Folding Rigid Boxes</option>
                  <option>Custom Gourmet Boxes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Quantity *</label>
                <input
                  type="number"
                  min={100}
                  step={50}
                  required
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseInt(e.target.value, 10) || 500 })}
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Destination City / State</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g. Varanasi, UP / Delhi"
                  className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Customization & Dimensions Requirements
              </label>
              <textarea
                rows={4}
                value={formData.customizationRequirements}
                onChange={(e) => setFormData({ ...formData, customizationRequirements: e.target.value })}
                placeholder="Specify dimensions (L x W x H), number of compartments, board thickness, or foil printing requirements..."
                className="w-full px-3 py-2.5 border border-[#EDE4D6] rounded text-sm"
              />
            </div>

            {/* Honeypot field */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-3.5 px-8 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              <span>{loading ? 'Submitting Inquiry...' : 'Submit Wholesale Quotation Request'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
