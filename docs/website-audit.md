# MithaiBoxes.com — Website Audit Report

**Audit Date:** November 2026  
**Auditor:** Antigravity Principal Engineer  
**Methodology:** Public web research, search-engine cached content, structured data inspection, policy analysis

---

## 1. Business Profile

| Attribute | Verified Information |
|---|---|
| **Brand Name** | MithaiBoxes (operated by Perfect Pack) |
| **Founded** | 1966 (as Pack Well Products), rebranded 1993 (Perfect Pack) |
| **Location** | Jogeshwari East, Mumbai, India |
| **Business Type** | Manufacturer, Supplier, Wholesaler |
| **Industry** | Indian Festive & Confectionery Packaging |
| **Office Hours** | Mon–Sat, 10:00 AM to 6:00 PM |

---

## 2. Technology Stack (Observed / Inferred)

| Component | Observation | Confidence |
|---|---|---|
| E-commerce Platform | Likely custom or Shopify-based (to be confirmed) | Assumption |
| Payment Gateway | **Razorpay** — explicitly documented in privacy policy | Verified |
| Frontend | Server-rendered HTML with JavaScript | Inferred |
| CDN | Unknown — not confirmed | Assumption |

> **Note:** Platform identity was not confirmed from public HTML source inspection. Do not assume Shopify or WooCommerce without direct code evidence.

---

## 3. Page Inventory

### Confirmed Public Pages

| Page | URL | Status | Notes |
|---|---|---|---|
| Homepage | `/` | Accessible | Category grid, hero section, featured products |
| About | `/about` | Accessible | Company history since 1966 |
| Login | `/login` | Accessible | Customer authentication portal |
| Contact | `/contact` | Accessible | Mumbai office details |
| Terms & Conditions | `/terms-and-conditions` | Accessible | Payment, IP, refund terms |
| Shipping & Return Policy | `/Shipping-and-Return-Policy` | Accessible | No-returns policy documented |
| Privacy Policy | `/privacy-policy` | Accessible | Razorpay, data usage |
| Price List 2026 | `/price-list` (inferred) | Assumed accessible | Annual wholesale price catalog |
| Orders | `/orders` | Requires auth | Customer order history |
| Cart | `/cart` | Accessible | Shopping cart |
| Checkout | `/checkout` | Requires cart | Multi-step checkout |
| Product Category Pages | `/categories/*` or `/products/*` | Accessible | Category-specific listings |
| Individual Product Pages | `/product/*` | Accessible | PDP with price, MOQ |

### Inferred but Unconfirmed
- `/search` — product search
- `/wishlist` — saved products
- `/account` — customer dashboard
- `/track-order` — order tracking

---

## 4. Product Categories (Confirmed)

1. **Mithai Boxes** — Core category; traditional Indian sweets packaging
2. **Dry Fruit Boxes** — Decorative festive dry-fruit containers
3. **Chocolate Boxes** — Rigid/folding confectionery packaging
4. **Cake Boxes** — Confectionery and cake packaging
5. **Hamper Boxes** — Multi-product festival gift packaging (Diwali, Raksha Bandhan)
6. **Folding Boxes** — Space-saving, high-volume retail packaging
7. **Basket & Gourmet Boxes** — Premium multi-item gourmet packaging
8. **Premium Gourmet Boxes** — Corporate/elite brand packaging
9. **Corporate Gifting** — B2B gifting packages (inferred from content)

---

## 5. Verified Business Rules

### Payment
- Payment gateway: **Razorpay** (PCI-DSS compliant, data encrypted)
- 100% advance payment required before dispatch
- Cash payments ONLY for self-pickup at Mumbai office
- Bank may decline transactions; company not liable

### Shipping
- Shipping and packing charges are **extra** (calculated separately)
- Mumbai deliveries: extra based on volume/quantity
- Out-of-Mumbai: packing + transport charges apply
- Standard dispatch: **2 business days**
- Friday orders dispatched the following Monday
- Transit damage not company responsibility

### Returns & Refunds
- **No returns accepted** once order is dispatched
- Colors may differ from images due to screen calibration
- Company reserves right to refuse orders even post-payment
- Prices/specs may change without notice

### Intellectual Property
- All box designs, patterns, and images are proprietary
- Cannot be used without written consent

---

## 6. UX & Design Observations

### Navigation (Confirmed)
- **Header:** Logo, Main Nav (Home, About, Categories, Price List, Contact, Login)
- **Footer:** Quick Links (Home, About, Products, T&C, Shipping Policy, Privacy Policy, Orders, Contact), operational hours, trust badges

### Identified Usability Issues (Public Research)
1. **No mega-menu** — category browsing requires extra clicks
2. **Limited filtering** — basic category navigation, unclear if price/size filters exist
3. **No wishlist confirmation** — unclear if wishlist feature is functional
4. **No search bar visible in header** — or limited search functionality
5. **Mobile experience** — responsive behavior not fully confirmed
6. **No product rating/review system visible**
7. **No real-time stock display**
8. **No bulk pricing tiers shown on product pages** (wholesale site)
9. **Price list as separate page** instead of integrated pricing
10. **No live chat or WhatsApp integration** visible

### Design Characteristics (Inferred)
- Traditional e-commerce layout
- Product grid with category images
- Product cards with pricing and MOQ
- Standard checkout flow

---

## 7. Competitor / Industry Analysis

### Improvement Opportunities vs Reference Site
| Area | Reference Site Limitation | Our Implementation |
|---|---|---|
| Navigation | Basic header nav | Premium mega-menu with category images |
| Search | Limited/none visible | Real-time search with suggestions |
| Filtering | Basic categories only | Multi-dimensional: size, color, material, price, MOQ |
| Product pages | Basic details | Full specifications, image gallery, zoom, bulk tiers |
| Cart | Standard | Persistent cart, bulk pricing calculation |
| Mobile UX | Unknown | Fully optimized mobile experience |
| Admin | Unknown | Complete professional dashboard |
| SEO | Basic | Full structured data, canonical URLs, sitemaps |
| Performance | Unknown | Next.js SSR/SSG, image optimization, CDN |
| Wholesale | Form or basic | Full CRM with quoting workflow |
| Reviews | None visible | Authorized review system |

---

## 8. Data Sources and Confidence Levels

| Finding | Source | Confidence |
|---|---|---|
| Business name (Perfect Pack) | mithaiboxes.com About page (cached) | High |
| Payment gateway (Razorpay) | Privacy Policy page (cited) | High |
| 100% advance payment rule | Shipping & Return Policy (cited) | High |
| No-returns policy | Shipping & Return Policy (cited) | High |
| 2 business days dispatch | Shipping & Return Policy (cited) | High |
| Product categories | Navigation/cached pages (cited) | High |
| Office location (Mumbai) | Contact/About pages (cited) | High |
| Office hours (Mon–Sat 10-6) | Footer/contact (cited) | High |
| Technology stack | Inferred — no direct code access | Low |
| Mobile behavior | Not directly confirmed | Assumption |
| Wishlist/search functionality | Not directly confirmed | Assumption |

---

## 9. Limitations of This Audit

1. **No direct HTML source inspection** — sandbox network constraints prevent live page fetching
2. **No JavaScript bundle analysis** — cannot confirm framework from code
3. **No image CDN analysis** — cannot confirm image hosting strategy
4. **No HTTP header inspection** — cannot confirm server type, cache headers, security headers
5. **No performance measurement** — Lighthouse scores not directly tested
6. **No accessibility audit** — WCAG compliance not measured
7. **Private pages not accessible** — Admin, cart contents, and auth-gated pages not inspectable

All assumptions are documented and marked. Implementation decisions are based on verified public information where available, and on industry best practices for wholesale packaging e-commerce otherwise.
