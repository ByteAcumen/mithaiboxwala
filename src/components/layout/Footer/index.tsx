'use client';

import Link from 'next/link';
import { BUSINESS } from '@/lib/constants';

const FOOTER_LINKS = {
  products: [
    { label: 'Mithai Boxes', href: '/categories/mithai-boxes' },
    { label: 'Dry Fruit Boxes', href: '/categories/dry-fruit-boxes' },
    { label: 'Chocolate Boxes', href: '/categories/chocolate-boxes' },
    { label: 'Wedding Boxes', href: '/categories/wedding-boxes' },
    { label: 'Gift Hampers', href: '/categories/gift-hampers' },
    { label: 'Cake Boxes', href: '/categories/cake-boxes' },
    { label: 'Corporate Gifting', href: '/corporate-gifting' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Wholesale', href: '/wholesale' },
    { label: 'Custom Packaging', href: '/custom-packaging' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'All Products', href: '/products' },
  ],
  policies: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms-and-conditions' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Return Policy', href: '/return-policy' },
  ],
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        fontSize: 13,
        color: 'rgba(237,228,214,0.65)',
        textDecoration: 'none',
        paddingTop: 5,
        paddingBottom: 5,
        transition: 'color 0.15s',
      }}
      className="footer-link"
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: '#1A1714', color: '#EDE4D6' }}>

      {/* Pre-footer CTA Strip */}
      <div style={{
        background: 'linear-gradient(135deg, #4A1420 0%, #681C2D 50%, #8B2B3F 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#B8955A 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '48px 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B8955A', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  ✦ B2B &amp; Wholesale
                </span>
              </div>
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: 600,
                color: '#fff',
                margin: '0 0 8px',
                lineHeight: 1.3,
              }}>
                Ready to elevate your packaging?
              </p>
              <p style={{ fontSize: 14, color: 'rgba(237,228,214,0.7)', margin: 0 }}>
                Contact us for wholesale pricing and custom box orders.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href="/wholesale"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#fff',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg,#B8955A,#CBA96E)',
                  boxShadow: '0 4px 16px rgba(184,149,90,.35)',
                  transition: 'transform .2s, box-shadow .2s',
                }}
              >
                Request Bulk Quote →
              </Link>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#EDE4D6',
                  textDecoration: 'none',
                  border: '2px solid rgba(237,228,214,0.25)',
                  transition: 'background .2s',
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '64px 24px 40px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
        }}>

          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'linear-gradient(135deg,#681C2D,#8B2B3F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                📦
              </div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#FAF7F0',
                  lineHeight: 1.2,
                }}>
                  {BUSINESS.brand}
                </div>
                <div style={{ fontSize: 9, color: '#B8955A', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                  by {BUSINESS.manufacturer} · Est. 1984
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(237,228,214,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
              {BUSINESS.tagline}
            </p>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📍', text: `${BUSINESS.address.city}, ${BUSINESS.address.state}` },
                { icon: '✉️', text: BUSINESS.email },
                { icon: '🏢', text: `GSTIN: ${BUSINESS.gstin}` },
                { icon: '🕐', text: 'Mon–Sat, 10 AM – 6 PM IST' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: 1, marginTop: 1 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(237,228,214,0.55)', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#B8955A',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              marginBottom: 16,
              margin: '0 0 16px',
            }}>
              Products
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FOOTER_LINKS.products.map(link => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#B8955A',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FOOTER_LINKS.company.map(link => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </div>
          </div>

          {/* Policies Column */}
          <div>
            <h4 style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#B8955A',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              margin: '0 0 16px',
            }}>
              Policies
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {FOOTER_LINKS.policies.map(link => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </div>

            {/* Newsletter */}
            <div style={{ marginTop: 28 }}>
              <h4 style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#B8955A',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}>
                Stay Updated
              </h4>
              <p style={{ fontSize: 12, color: 'rgba(237,228,214,0.55)', marginBottom: 12, lineHeight: 1.5 }}>
                Festive offers, new arrivals &amp; bulk deal alerts.
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid rgba(237,228,214,0.15)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#EDE4D6',
                    fontSize: 13,
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg,#681C2D,#8B2B3F)',
                    color: '#FAF7F0',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '.05em',
                    transition: 'opacity .15s',
                  }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid rgba(237,228,214,0.08)',
        padding: '20px 24px',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(237,228,214,0.4)', margin: 0 }}>
            © {year} {BUSINESS.brand} · {BUSINESS.manufacturer}, {BUSINESS.address.city} · All rights reserved.
          </p>
          <p style={{ fontSize: 11, color: 'rgba(237,228,214,0.3)', margin: 0 }}>
            Made with ❤️ in India · 40 years of packaging excellence · GSTIN: {BUSINESS.gstin}
          </p>
        </div>
      </div>
    </footer>
  );
}
