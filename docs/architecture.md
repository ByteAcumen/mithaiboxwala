# MithaiBoxes — System Architecture

---

## 1. Architecture Overview

The platform uses a **modular monolith** architecture built on Next.js 15 App Router, combining the customer-facing storefront and admin dashboard in a single codebase. This eliminates unnecessary distributed-systems complexity while maintaining clear domain boundaries via the module/feature structure.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌─────────────────┐   ┌─────────────────────────────────┐  │
│  │  Customer Store │   │     Admin Dashboard (/admin)    │  │
│  │  (Next.js RSC)  │   │        (Next.js RSC)            │  │
│  └────────┬────────┘   └───────────────┬─────────────────┘  │
└───────────┼────────────────────────────┼────────────────────┘
            │                            │
┌───────────▼────────────────────────────▼────────────────────┐
│                    API Layer (Next.js Route Handlers)        │
│  /api/auth/*  /api/products/*  /api/cart/*  /api/orders/*   │
│  /api/payments/*  /api/webhooks/*  /api/admin/*             │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Business Logic Layer                       │
│  AuthService │ CatalogService │ CartService │ OrderService   │
│  PaymentService │ InventoryService │ EmailService            │
│  WholesaleService │ ReportService │ ContentService          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Data Access Layer                          │
│  MongoDB (Mongoose) Repositories                            │
│  UserRepo │ ProductRepo │ OrderRepo │ CartRepo │ CouponRepo  │
│  InventoryRepo │ EnquiryRepo │ ContentRepo                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  External Integrations                       │
│  Razorpay │ Email Provider │ Object Storage │ Monitoring     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x (App Router) | SSR/SSG/RSC storefront + admin |
| React | 19.x | UI component library |
| TypeScript | 5.x (strict) | Type safety throughout |
| Tailwind CSS | 4.x | Utility-first styling |
| Lucide React | Latest | Icon system |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation (client + server) |
| Zustand | 5.x | Client-side cart & UI state |
| SWR | 2.x | Client-side data fetching + revalidation |
| Framer Motion | 11.x | Restrained UI animations |
| next/image | Built-in | Image optimization |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime |
| Next.js Route Handlers | 15.x | REST API endpoints |
| Mongoose | 8.x | ODM for MongoDB |
| MongoDB | 7.x | Primary database |
| bcryptjs | Latest | Password hashing |
| jose / iron-session | Latest | Secure session management |
| nodemailer / Resend SDK | Latest | Transactional email |
| Razorpay SDK | Latest | Payment processing |
| AWS S3 / Cloudflare R2 SDK | Latest | Object storage |
| multer / formidable | Latest | File upload handling |
| sharp | Latest | Image processing |
| nanoid | Latest | Unique ID generation |
| pino | Latest | Structured logging |
| @sentry/nextjs | Latest | Error monitoring |

### Development Tools
| Tool | Purpose |
|---|---|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |
| Vitest | Unit + integration tests |
| Playwright | End-to-end tests |
| Testing Library | React component tests |
| Husky + lint-staged | Pre-commit checks |

---

## 3. Directory Structure

```
mithaiboxes/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (storefront)/             # Customer-facing route group
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product listing
│   │   │   │   └── [slug]/page.tsx   # Product detail
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/              # Protected customer routes
│   │   │   │   ├── orders/
│   │   │   │   ├── addresses/
│   │   │   │   ├── wishlist/
│   │   │   │   └── settings/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── logout/
│   │   │   ├── wholesale/
│   │   │   ├── corporate-gifting/
│   │   │   ├── custom-packaging/
│   │   │   ├── faq/
│   │   │   ├── shipping-policy/
│   │   │   ├── returns-policy/
│   │   │   ├── privacy-policy/
│   │   │   ├── terms/
│   │   │   ├── sitemap/
│   │   │   └── [...slug]/page.tsx    # Dynamic CMS pages
│   │   ├── admin/                    # Admin route group (protected)
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── login/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   ├── customers/
│   │   │   ├── coupons/
│   │   │   ├── enquiries/
│   │   │   ├── content/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── users/
│   │   └── api/                      # API Route Handlers
│   │       ├── auth/
│   │       ├── users/
│   │       ├── addresses/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── cart/
│   │       ├── wishlist/
│   │       ├── coupons/
│   │       ├── checkout/
│   │       ├── orders/
│   │       ├── payments/
│   │       ├── webhooks/
│   │       ├── wholesale-enquiries/
│   │       ├── search/
│   │       ├── upload/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                       # Base design system components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   ├── Badge/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   ├── Pagination/
│   │   │   └── Skeleton/
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── AnnouncementBar/
│   │   │   ├── MegaMenu/
│   │   │   └── MobileNav/
│   │   ├── product/
│   │   │   ├── ProductCard/
│   │   │   ├── ProductGrid/
│   │   │   ├── ProductGallery/
│   │   │   ├── ProductFilters/
│   │   │   ├── ProductVariants/
│   │   │   └── BulkPricingTable/
│   │   ├── cart/
│   │   │   ├── CartDrawer/
│   │   │   ├── CartItem/
│   │   │   └── CartSummary/
│   │   ├── checkout/
│   │   │   ├── CheckoutSteps/
│   │   │   ├── AddressForm/
│   │   │   ├── PaymentSection/
│   │   │   └── OrderSummary/
│   │   ├── admin/
│   │   │   ├── AdminLayout/
│   │   │   ├── DataTable/
│   │   │   ├── Charts/
│   │   │   └── ImageUploader/
│   │   └── shared/
│   │       ├── SearchBar/
│   │       ├── Breadcrumbs/
│   │       └── EmptyState/
│   ├── features/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── inventory/
│   │   ├── wholesale/
│   │   ├── search/
│   │   └── admin/
│   ├── lib/
│   │   ├── db/                       # Database connection
│   │   ├── auth/                     # Session management
│   │   ├── email/                    # Email provider
│   │   ├── payments/                 # Razorpay client
│   │   ├── storage/                  # Object storage client
│   │   ├── validation/               # Shared Zod schemas
│   │   ├── logging/                  # Pino logger
│   │   └── rate-limit/               # Rate limiting utility
│   ├── server/
│   │   ├── services/                 # Business logic services
│   │   ├── repositories/             # Data access objects
│   │   ├── middleware/               # Auth, RBAC middleware
│   │   └── jobs/                     # Background tasks
│   ├── models/                       # Mongoose schemas
│   └── types/                        # Global TypeScript types
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── scripts/                          # DB seed, admin bootstrap
├── public/                           # Static assets
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Authentication Architecture

### Customer Authentication (Email OTP)
```
1. POST /api/auth/otp/send
   → Validate email format
   → Find or create customer account
   → Generate cryptographically secure 6-digit OTP
   → Hash OTP with bcrypt (cost 10) → store in DB
   → Rate limit: 3 requests per 15 minutes per email
   → Send OTP via email provider
   → Return: { sent: true } (no enumeration)

2. POST /api/auth/otp/verify
   → Validate email + OTP format
   → Fetch OTP challenge (expires 10 min)
   → Verify OTP hash (bcrypt compare)
   → Increment attempt counter (max 5)
   → On success: create secure session, invalidate OTP
   → Set HttpOnly Secure SameSite=Lax cookie

3. POST /api/auth/logout
   → Invalidate session in DB
   → Clear cookie
```

### Admin Authentication
```
- Separate admin session table
- Email + password (bcrypt hash)
- Session stored in DB with expiry
- Role checked on every admin API request
- Bootstrap via CLI script only
- Rate limiting: 5 attempts per 15 min per IP
```

### Session Management
```
- Sessions stored in MongoDB (Sessions collection)
- Cookie: HttpOnly, Secure, SameSite=Lax
- Customer session TTL: 30 days (sliding)
- Admin session TTL: 8 hours (fixed)
- Session revocation on logout
- Session invalidation on password change
```

---

## 5. Payment Architecture

### Razorpay Integration Flow
```
1. Client: POST /api/checkout/initiate
   → Server validates cart + stock + pricing
   → Creates Order document (pending_payment)
   → Calls Razorpay createOrder server-side
   → Returns razorpay_order_id to client

2. Client: Opens Razorpay Checkout modal
   → Customer completes payment
   → Razorpay returns payment_id, signature to client

3. Client: POST /api/payments/verify
   → Server verifies HMAC signature using webhook secret
   → On valid: update Order to confirmed
   → Deduct inventory (atomic)
   → Send confirmation email
   → Return success to client

4. Webhook: POST /api/webhooks/razorpay
   → Verify webhook signature
   → Check WebhookEvent for idempotency
   → Process payment.captured, payment.failed events
   → Reconcile order status
```

---

## 6. Database Architecture

### MongoDB Collections
```
users, admin_users, sessions, otp_challenges,
products, product_variants, categories, product_images,
inventory, inventory_movements,
carts, cart_items,
orders, order_items, payments, refunds, shipments, invoices,
coupons, coupon_usages,
wishlists, reviews,
wholesale_enquiries, quotations,
notifications, newsletter_subscriptions,
site_content, announcements,
audit_logs, webhook_events,
store_settings
```

### Deployment Configuration
- MongoDB requires Replica Set for transactions
- Recommended: MongoDB Atlas M10+ or self-hosted replica set
- All collections require compound indexes on common query patterns
- TTL indexes on: sessions, otp_challenges, webhook_events

---

## 7. Security Architecture

| Layer | Controls |
|---|---|
| Transport | HTTPS enforced; HSTS headers |
| Input | Zod validation on all API inputs |
| Output | No stack traces; sanitized error messages |
| Auth | OTP hashed; sessions in DB; HttpOnly cookies |
| CSRF | SameSite cookies + Origin header validation |
| RBAC | Checked server-side on every protected endpoint |
| Rate Limiting | Per-IP and per-email limits on auth endpoints |
| File Upload | Type + size validation; virus scan recommended |
| Payments | Server-side signature verification; no client trust |
| NoSQL Injection | Mongoose schema validation; sanitized inputs |
| XSS | React auto-escaping; CSP headers |
| SSRF | No dynamic URL fetching from user input |
| Secrets | Environment variables only; never in source |
| Audit | All admin actions logged to audit_logs |

---

## 8. Performance Architecture

| Optimization | Strategy |
|---|---|
| Product pages | ISR with revalidation on catalog changes |
| Category pages | SSR with caching headers |
| Images | next/image with WebP + AVIF; responsive srcsets |
| Fonts | Local font hosting or next/font |
| JavaScript | Route-level code splitting (App Router automatic) |
| Database | Compound indexes; projection queries; lean() |
| API responses | Consistent pagination; cursor-based for large sets |
| Cart | Zustand client-state + DB sync on mutations |
| Search | DB text indexes + optional search provider |
| CDN | Static assets and images via CDN edge |
