'use client';

import { useState, useEffect, useRef } from 'react';

const MESSAGES = [
  '🎁 Free shipping on orders above ₹15,000',
  '📦 Bulk orders welcome — Request a Quote',
  '🏭 Direct factory pricing from Ajay Packers, Mirzapur',
  '🎊 Festive & wedding packaging — customize your design',
  '✅ GSTIN registered & pan-India dispatch available',
  '🚀 Free shipping on orders above ₹15,000',
  '📦 Bulk orders welcome — Request a Quote',
  '🏭 Direct factory pricing from Ajay Packers, Mirzapur',
  '🎊 Festive & wedding packaging — customize your design',
  '✅ GSTIN registered & pan-India dispatch available',
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!visible) return null;

  return (
    <div
      role="banner"
      style={{
        background: 'linear-gradient(90deg, #4A1420 0%, #681C2D 50%, #8B2B3F 100%)',
        position: 'relative',
        overflow: 'hidden',
        height: 40,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Gold bottom border */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: 'rgba(184,149,90,0.4)',
      }} />

      {/* Left badge */}
      <div style={{
        flexShrink: 0,
        paddingLeft: 16,
        paddingRight: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
        borderRight: '1px solid rgba(184,149,90,0.3)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#B8955A', letterSpacing: '.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          ✦ Offers
        </span>
      </div>

      {/* Marquee area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Fade masks */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(to right, #681C2D, transparent)',
        }} />
        <div style={{
          position: 'absolute', right: 32, top: 0, bottom: 0, width: 48, zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(to left, #8B2B3F, transparent)',
        }} />

        <div
          ref={trackRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            animation: paused ? 'none' : 'marquee 35s linear infinite',
            willChange: 'transform',
          }}
        >
          {MESSAGES.map((msg, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                fontSize: 12,
                fontWeight: 500,
                color: '#FAF7F0',
                paddingLeft: 32,
                paddingRight: 32,
              }}
            >
              {msg}
              <span style={{ marginLeft: 24, color: 'rgba(184,149,90,0.5)', fontSize: 10 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          marginRight: 4,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(250,247,240,0.6)',
          fontSize: 16,
          lineHeight: 1,
          transition: 'color .15s, background .15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#FAF7F0';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(250,247,240,0.6)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        ✕
      </button>
    </div>
  );
}
