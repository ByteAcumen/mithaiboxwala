import React from 'react';
import { Mail, MapPin, Clock, Phone, Building2, Send, ShieldCheck } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const metadata = {
  title: `Contact Us — Mithai Box Wala | Ajay Packers`,
  description: `Contact Ajay Packers and Mithai Box Wala in Mirzapur, Uttar Pradesh for sweet box orders, wholesale packaging pricing, and custom box manufacturing inquiries.`,
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAF7F0] min-h-screen py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#B8955A] uppercase tracking-widest">Get In Touch</span>
          <h1 className="font-display text-4xl font-bold text-[#681C2D]">Contact Mithai Box Wala</h1>
          <p className="text-sm text-stone-600">
            Reach out to our factory representatives Ajay Kumar & Sanjay Kumar for catalog inquiries, bulk manufacturing, and dispatch details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Business Details Card */}
          <div className="lg:col-span-5 bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-[#24211F] pb-4 border-b border-[#EDE4D6]">
              Manufacturing Unit & Headquarters
            </h2>

            <div className="space-y-5 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <Building2 className="text-[#681C2D] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-sm text-[#24211F]">{BUSINESS.brand}</p>
                  <p className="text-stone-500">Legal Entity: {BUSINESS.manufacturer}</p>
                  <p className="text-stone-500">Representatives: Ajay Kumar & Sanjay Kumar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-[#681C2D] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-stone-900">Factory & Office Address</p>
                  <p>{BUSINESS.address.full}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-[#681C2D] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-stone-900">Official Business Email</p>
                  <a href={`mailto:${BUSINESS.email}`} className="text-[#681C2D] font-medium hover:underline">
                    {BUSINESS.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-[#681C2D] mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <p className="font-bold text-stone-900">Operating Hours</p>
                  <p>{BUSINESS.officeHours}</p>
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F0] border border-[#EDE4D6] rounded-xl text-[11px] text-stone-600 space-y-1">
                <p>• <strong>GSTIN:</strong> {BUSINESS.gstin}</p>
                <p>• <strong>Experience:</strong> 40 continuous years in sweet packaging</p>
                <p>• <strong>Advance Policy:</strong> 100% advance payment required prior to dispatch</p>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-7 bg-white border border-[#EDE4D6] rounded-2xl p-8 shadow-sm space-y-6">
            <h2 className="font-display text-xl font-bold text-[#24211F]">
              Send Us a Message
            </h2>

            <form action="/api/wholesale-enquiries" method="POST" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Company / Sweet House</label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Shop / Business Name"
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="10-digit phone number"
                    className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Message / Requirements</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about the box types, approximate quantities, or custom requirements you need."
                  className="w-full px-3 py-2 border border-[#EDE4D6] rounded text-xs"
                />
              </div>

              {/* Honeypot */}
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

              <button
                type="submit"
                className="bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-3 px-6 rounded font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Send size={14} /> Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
