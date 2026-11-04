'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  User,
  Phone,
  Building2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedReturnUrl = searchParams.get('returnUrl');
  const returnUrl = requestedReturnUrl?.startsWith('/') && !requestedReturnUrl.startsWith('//')
    ? requestedReturnUrl
    : '/account';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  // Tabs: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  // Steps: 'form' | 'otp' | 'success'
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  // OTP State: 6 individual boxes
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setStep('otp');
      setResendCooldown(60);
      setMessage(`A 6-digit secure code was sent to ${email}`);

      // Auto focus first OTP input after state transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP individual digit change & auto-advance
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // Pasted multi-digit code
      const pasted = cleaned.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();

      if (pasted.length === 6) {
        triggerVerify(pasted.join(''));
      }
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (cleaned && index === 5 && newDigits.every((d) => d !== '')) {
      triggerVerify(newDigits.join(''));
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const triggerVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: code,
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Invalid or expired code. Please try again.');
      }

      setStep('success');

      // Buttery smooth redirect after celebratory checkmark
      setTimeout(() => {
        router.replace(returnUrl);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-shell"
      style={{
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        position: 'relative',
        background: 'linear-gradient(165deg, #FAF7F0 0%, #EDE4D6 60%, #FAF7F0 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Subtle luxury watermark / dot pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#681C2D 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          opacity: 0.12,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, #B8955A 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <div
        className="auth-card animate-scale-in"
        style={{
          maxWidth: 460,
          width: '100%',
          position: 'relative',
          zIndex: 10,
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid #DDD5C8',
          boxShadow: '0 24px 70px rgba(36,33,31,0.12), 0 4px 16px rgba(184,149,90,0.08)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ── CARD HEADER BANNER ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3A0D18 0%, #681C2D 60%, #8B2B3F 100%)',
            padding: '36px 32px 28px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative',
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              margin: '0 auto 14px',
              background: 'rgba(184,149,90,0.25)',
              border: '1px solid rgba(184,149,90,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            <Package size={26} color="#B8955A" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontWeight: 700,
              color: '#CBA96E',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            <Sparkles size={12} color="#B8955A" />
            <span>Mithai Box Wala · Ajay Packers</span>
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#FAF7F0',
              margin: '0 0 6px',
              lineHeight: 1.2,
            }}
          >
            {step === 'otp'
              ? 'Security Verification'
              : step === 'success'
              ? 'Verified Successfully!'
              : mode === 'login'
              ? 'Welcome Back'
              : 'Create Wholesale & Retail Account'}
          </h1>

          <p style={{ fontSize: 13, color: 'rgba(237,228,214,0.8)', margin: 0, lineHeight: 1.4 }}>
            {step === 'otp'
              ? `Enter the 6-digit code sent to ${email}`
              : step === 'success'
              ? 'Taking you to your dashboard…'
              : mode === 'login'
              ? 'Access orders, wishlist & factory pricing'
              : 'Direct manufacturer pricing with 40 years of trust'}
          </p>
        </div>

        {/* ── STEP 1: FORM (LOGIN / SIGNUP TABS) ── */}
        {step === 'form' && (
          <div>
            {/* Sliding Tab Switcher */}
            <div
              style={{
                display: 'flex',
                background: '#FAF7F0',
                borderBottom: '1px solid #EDE4D6',
                padding: '6px',
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: mode === 'login' ? '#ffffff' : 'transparent',
                  color: mode === 'login' ? '#681C2D' : '#6B6663',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(36,33,31,0.06)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: mode === 'signup' ? '#ffffff' : 'transparent',
                  color: mode === 'signup' ? '#681C2D' : '#6B6663',
                  boxShadow: mode === 'signup' ? '0 2px 8px rgba(36,33,31,0.06)' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSendOtp} style={{ padding: '28px 32px 32px' }}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    fontSize: 12.5,
                    marginBottom: 20,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Extra Fields for Sign Up */}
              {mode === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                  {/* Full Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#3D3835',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        marginBottom: 6,
                      }}
                    >
                      Full Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User
                        size={16}
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#B8955A',
                        }}
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 12,
                          border: '1.5px solid #DDD5C8',
                          background: '#FAF7F0',
                          fontSize: 13.5,
                          color: '#24211F',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#3D3835',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        marginBottom: 6,
                      }}
                    >
                      Phone / WhatsApp Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone
                        size={16}
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#B8955A',
                        }}
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 12,
                          border: '1.5px solid #DDD5C8',
                          background: '#FAF7F0',
                          fontSize: 13.5,
                          color: '#24211F',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Sweet Shop / Business Name (Optional) */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#3D3835',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        marginBottom: 6,
                      }}
                    >
                      Business / Shop Name <span style={{ color: '#8C8885', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2
                        size={16}
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#B8955A',
                        }}
                      />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Royal Sweets & Bakers"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          borderRadius: 12,
                          border: '1.5px solid #DDD5C8',
                          background: '#FAF7F0',
                          fontSize: 13.5,
                          color: '#24211F',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div style={{ marginBottom: 22 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#3D3835',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    marginBottom: 6,
                  }}
                >
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#B8955A',
                    }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: 12,
                      border: '1.5px solid #DDD5C8',
                      background: '#FAF7F0',
                      fontSize: 14,
                      color: '#24211F',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  fontSize: 14.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>{loading ? 'Sending Secure Code…' : mode === 'login' ? 'Continue with OTP' : 'Create My Account'}</span>
                <ArrowRight size={16} />
              </button>

              <div
                style={{
                  marginTop: 18,
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#8C8885',
                }}
              >
                🔒 Instant passwordless sign in. No memorizing passwords needed.
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 2: 6-DIGIT OTP VERIFICATION ── */}
        {step === 'otp' && (
          <div style={{ padding: '32px' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: 12.5,
                  marginBottom: 20,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  fontSize: 12.5,
                  marginBottom: 20,
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{message}</span>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 12,
                  color: '#6B6663',
                  marginBottom: 16,
                  fontWeight: 500,
                }}
              >
                Enter the 6-digit verification code:
              </div>

              {/* 6 Individual Digit Boxes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: 48,
                      height: 56,
                      fontSize: 22,
                      fontWeight: 700,
                      textAlign: 'center',
                      borderRadius: 12,
                      border: digit ? '2px solid #681C2D' : '1.5px solid #DDD5C8',
                      background: digit ? '#ffffff' : '#FAF7F0',
                      color: '#681C2D',
                      outline: 'none',
                      boxShadow: digit ? '0 4px 12px rgba(104,28,45,0.1)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                ))}
              </div>

              {/* Resend Timer or Button */}
              <div style={{ fontSize: 12.5, color: '#8C8885' }}>
                {resendCooldown > 0 ? (
                  <span>Resend code in <strong style={{ color: '#681C2D' }}>{resendCooldown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#B8955A',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 12.5,
                    }}
                  >
                    Resend Code Now
                  </button>
                )}
              </div>
            </div>

            {/* Verify CTA */}
            <button
              type="button"
              onClick={() => triggerVerify()}
              disabled={loading || otpDigits.some((d) => d === '')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 12,
                fontSize: 14.5,
                opacity: loading || otpDigits.some((d) => d === '') ? 0.6 : 1,
              }}
            >
              {loading ? 'Verifying Code…' : 'Verify & Continue'}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError('');
                setOtpDigits(['', '', '', '', '', '']);
              }}
              style={{
                width: '100%',
                marginTop: 14,
                padding: '8px',
                background: 'none',
                border: 'none',
                color: '#6B6663',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ← Change email address ({email})
            </button>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ANIMATION ── */}
        {step === 'success' && (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div
              className="animate-checkmark"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #166534 0%, #22C55E 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 26,
                fontWeight: 700,
                color: '#24211F',
                marginBottom: 8,
              }}
            >
              Authentication Successful
            </h2>
            <p style={{ fontSize: 14, color: '#6B6663', margin: 0 }}>
              Redirecting you to {returnUrl}…
            </p>
          </div>
        )}

        {/* ── FOOTER TRUST STRIP ── */}
        <div
          style={{
            padding: '14px 24px',
            background: '#FAF7F0',
            borderTop: '1px solid #EDE4D6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 11,
            color: '#8C8885',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ShieldCheck size={14} color="#166534" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Lock size={12} color="#B8955A" />
            <span>HttpOnly Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
