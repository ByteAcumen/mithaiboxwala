'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Package, Sparkles, ArrowRight,
} from 'lucide-react';
import { BUSINESS, CATEGORIES } from '@/lib/constants';
import { useCartStore } from '@/features/cart/store';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Products', href: '/products', hasDropdown: true },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Corporate Gifting', href: '/corporate-gifting' },
  { label: 'Custom Packaging', href: '/custom-packaging' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobile, setMobile] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<{ name: string; slug: string; basePrice: number }[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const { itemCount } = useCartStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<NodeJS.Timeout>();
  const megaTimer = useRef<NodeJS.Timeout>();

  // Scroll tracking for glassmorphic effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobile(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  // Search debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const d = await r.json();
        if (d.success) setResults(d.data?.suggestions ?? []);
      } catch {
        /* noop */
      }
    }, 250);
    return () => clearTimeout(debounce.current);
  }, [searchQuery]);

  const openMega = useCallback(() => {
    clearTimeout(megaTimer.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: scrolled ? 'rgba(255,255,255,0.96)' : '#ffffff',
          backdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(184,149,90,0.25)' : '1px solid rgba(221,213,200,0.6)',
          boxShadow: scrolled ? '0 4px 24px rgba(36,33,31,0.06)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="container-pad">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 72,
              gap: 12,
            }}
          >
            {/* ── LOGO ── */}
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexShrink: 0,
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
              }}
              aria-label="Mithai Box Wala — Home"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #4A1420 0%, #681C2D 60%, #8B2B3F 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(104,28,45,0.28)',
                  border: '1px solid rgba(184,149,90,0.4)',
                }}
              >
                <Package size={22} color="#B8955A" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 20,
                    color: '#681C2D',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {BUSINESS.brand}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: '#9A7A45',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  by Ajay Packers · Est. 1984
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAVIGATION ── */}
            <nav
              className="show-desktop"
              style={{
                alignItems: 'center',
                gap: 4,
              }}
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.href}
                    style={{ position: 'relative' }}
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <button
                      onClick={() => setMegaOpen(!megaOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: 'none',
                        background: megaOpen ? 'rgba(104,28,45,0.06)' : 'transparent',
                        color: isActive('/products') || isActive('/categories') ? '#681C2D' : '#3D3835',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        style={{
                          transform: megaOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          color: '#B8955A',
                        }}
                      />
                      {(isActive('/products') || isActive('/categories')) && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 2,
                            left: 14,
                            right: 14,
                            height: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(90deg,#681C2D,#B8955A)',
                          }}
                        />
                      )}
                    </button>

                    {/* Mega Menu Dropdown */}
                    <div
                      onMouseEnter={openMega}
                      onMouseLeave={closeMega}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: `translateX(-50%) ${
                          megaOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)'
                        }`,
                        opacity: megaOpen ? 1 : 0,
                        pointerEvents: megaOpen ? 'auto' : 'none',
                        transition: 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        marginTop: 10,
                        width: 660,
                        background: '#ffffff',
                        borderRadius: 18,
                        border: '1px solid #EDE4D6',
                        boxShadow: '0 20px 60px rgba(36,33,31,0.14), 0 4px 16px rgba(184,149,90,0.1)',
                        overflow: 'hidden',
                        zIndex: 100,
                      }}
                    >
                      {/* Header strip */}
                      <div
                        style={{
                          padding: '14px 22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'linear-gradient(90deg,#FAF7F0,#EDE4D6)',
                          borderBottom: '1px solid #EDE4D6',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={14} color="#B8955A" />
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: '#9A7A45',
                              letterSpacing: '.12em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Crafted Packaging Collections
                          </span>
                        </div>
                        <Link
                          href="/products"
                          onClick={() => setMegaOpen(false)}
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#681C2D',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          View All (40+) <ArrowRight size={13} />
                        </Link>
                      </div>

                      {/* Categories grid */}
                      <div
                        style={{
                          padding: '16px 20px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 8,
                        }}
                      >
                        {CATEGORIES.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            onClick={() => setMegaOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 12,
                              textDecoration: 'none',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = '#FAF7F0';
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(3px)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                              (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                            }}
                          >
                            <span
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                flexShrink: 0,
                                background: 'linear-gradient(135deg,#FAF7F0,#EDE4D6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                border: '1px solid rgba(184,149,90,0.2)',
                              }}
                            >
                              {cat.emoji}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#3D3835',
                                lineHeight: 1.3,
                              }}
                            >
                              {cat.name}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {/* Footer quick links */}
                      <div
                        style={{
                          padding: '12px 24px',
                          borderTop: '1px solid #EDE4D6',
                          background: '#FAF7F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {[
                          ['Wholesale Supply', '/wholesale'],
                          ['Custom Logo Print', '/custom-packaging'],
                          ['Festive Hampers', '/categories/gift-hampers'],
                        ].map(([label, href]) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMegaOpen(false)}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#681C2D',
                              textDecoration: 'none',
                            }}
                          >
                            {label} →
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: isActive(link.href) ? '#681C2D' : '#3D3835',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(link.href)) {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#681C2D';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(104,28,45,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(link.href)) {
                        (e.currentTarget as HTMLAnchorElement).style.color = '#3D3835';
                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      }
                    }}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          left: 14,
                          right: 14,
                          height: 2,
                          borderRadius: 2,
                          background: 'linear-gradient(90deg,#681C2D,#B8955A)',
                        }}
                      />
                    )}
                  </Link>
                )
              )}
            </nav>

            {/* ── ACTION ICONS & AUTH BUTTONS ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* Search Toggle */}
              <div style={{ position: 'relative' }} ref={searchRef}>
                <button
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    if (!searchOpen) setTimeout(() => document.getElementById('header-search-input')?.focus(), 100);
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: 'none',
                    background: searchOpen ? '#FAF7F0' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3D3835',
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Search products"
                >
                  <Search size={19} />
                </button>

                {/* Search Popover */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 10,
                    width: 340,
                    background: '#ffffff',
                    borderRadius: 16,
                    border: '1px solid #EDE4D6',
                    boxShadow: '0 20px 50px rgba(36,33,31,0.16)',
                    padding: 12,
                    zIndex: 100,
                    opacity: searchOpen ? 1 : 0,
                    transform: searchOpen ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-6px)',
                    pointerEvents: searchOpen ? 'auto' : 'none',
                    transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#B8955A',
                      }}
                    />
                    <input
                      id="header-search-input"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search mithai, dry fruit, chocolate boxes…"
                      style={{
                        width: '100%',
                        paddingLeft: 38,
                        paddingRight: 12,
                        paddingTop: 10,
                        paddingBottom: 10,
                        fontSize: 13,
                        borderRadius: 10,
                        border: '1.5px solid #DDD5C8',
                        background: '#FAF7F0',
                        color: '#24211F',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {results.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#B8955A',
                          textTransform: 'uppercase',
                          letterSpacing: '.08em',
                          padding: '4px 8px',
                        }}
                      >
                        Suggestions
                      </div>
                      {results.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/products/${r.slug}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 10px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#FAF7F0';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: 'linear-gradient(135deg,#EDE4D6,#FAF7F0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Package size={14} color="#B8955A" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#24211F' }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: '#B8955A', fontWeight: 600 }}>
                              from ₹{r.basePrice?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Wishlist (Desktop) */}
              <Link
                href="/account/wishlist"
                className="show-desktop"
                aria-label="Wishlist"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3D3835',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Heart size={19} />
              </Link>

              {/* Account / Login */}
              <Link
                href="/auth/login"
                aria-label="Sign In or Account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 10,
                  color: '#3D3835',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(221,213,200,0.6)',
                  background: '#FAF7F0',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = '#B8955A';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#681C2D';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(221,213,200,0.6)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#3D3835';
                }}
              >
                <User size={17} color="#681C2D" />
                <span className="show-desktop">Sign In</span>
              </Link>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                aria-label={`Cart (${itemCount} items)`}
                style={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3D3835',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span
                    className="pulse-gold"
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 999,
                      background: 'linear-gradient(135deg,#681C2D,#8B2B3F)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingLeft: 4,
                      paddingRight: 4,
                      boxShadow: '0 2px 6px rgba(104,28,45,0.4)',
                    }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobile(!mobile)}
                className="hide-desktop"
                aria-label={mobile ? 'Close menu' : 'Open menu'}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3D3835',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {mobile ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE SLIDE-IN DRAWER ── */}
      {mobile && (
        <>
          <div
            onClick={() => setMobile(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              background: 'rgba(36,33,31,0.5)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.3s ease both',
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85%',
              maxWidth: 360,
              zIndex: 95,
              background: '#ffffff',
              boxShadow: '-8px 0 32px rgba(36,33,31,0.2)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRightSpring 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #4A1420 0%, #681C2D 100%)',
                color: '#FAF7F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(184,149,90,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={18} color="#B8955A" />
                </div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 700 }}>
                    {BUSINESS.brand}
                  </div>
                  <div style={{ fontSize: 9.5, color: '#CBA96E', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    40 Years of Craft
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobile(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div style={{ padding: '16px 20px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobile(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: isActive(link.href) ? '#681C2D' : '#3D3835',
                      background: isActive(link.href) ? '#FAF7F0' : 'transparent',
                    }}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} color="#B8955A" />
                  </Link>
                ))}
              </div>

              {/* Categories list in mobile */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #EDE4D6' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#B8955A',
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  Popular Categories
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {CATEGORIES.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setMobile(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 10px',
                        background: '#FAF7F0',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontSize: 12.5,
                        fontWeight: 500,
                        color: '#24211F',
                      }}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Footer CTA */}
            <div style={{ padding: 20, borderTop: '1px solid #EDE4D6', background: '#FAF7F0' }}>
              <Link
                href="/auth/login"
                onClick={() => setMobile(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: 10 }}
              >
                Sign In / Register
              </Link>
              <Link
                href="/wholesale"
                onClick={() => setMobile(false)}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Request Bulk Quote
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
