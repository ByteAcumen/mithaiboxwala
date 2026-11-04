'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#24211F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#681C2D] text-[#B8955A] rounded-xl flex items-center justify-center mx-auto mb-2 font-display text-xl font-bold">
            MB
          </div>
          <h1 className="font-display text-2xl font-bold text-[#24211F]">
            Mithai Box Wala Admin
          </h1>
          <p className="text-xs text-stone-500">
            Authorized management portal for Ajay Packers, Mirzapur
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mithaiboxes.com"
                className="w-full pl-9 pr-4 py-2.5 border border-[#EDE4D6] rounded-lg text-sm focus:outline-none focus:border-[#B8955A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 border border-[#EDE4D6] rounded-lg text-sm focus:outline-none focus:border-[#B8955A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#681C2D] hover:bg-[#8B2B3F] text-white py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#EDE4D6] text-center text-[11px] text-stone-400 flex items-center justify-center gap-1">
          <ShieldAlert size={14} className="text-amber-600" />
          <span>Restricted Access: All administrative actions are recorded in audit logs.</span>
        </div>
      </div>
    </div>
  );
}
