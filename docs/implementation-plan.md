# MithaiBoxes — Implementation Plan

## Phase Overview

| Phase | Name | Duration | Status |
|---|---|---|---|
| 1 | Audit & Research | Complete | ✅ Done |
| 2 | Architecture Design | Complete | ✅ Done |
| 3 | Project Scaffold & Design System | Complete | ✅ Done |
| 4 | Database Models | Complete | ✅ Done |
| 5 | API Layer | Complete | ✅ Done |
| 6 | Storefront UI | Complete | ✅ Done |
| 7 | Authentication | Complete | ✅ Done |
| 8 | Commerce Backend | Complete | ✅ Done |
| 9 | Admin Dashboard | Complete | ✅ Done |
| 10 | Integrations | Complete | ✅ Done |
| 11 | Testing & Security | Complete | ✅ Done |
| 12 | Deployment Readiness | Complete | ✅ Done |

---

## Phase 3: Project Scaffold & Design System

### Tasks
- [x] Create Next.js 15 project with TypeScript + Tailwind
- [x] Configure pnpm and workspace
- [x] Install dependencies (Mongoose, Razorpay, Zod, React Hook Form, Zustand, etc.)
- [x] Configure ESLint + Prettier
- [x] Set up path aliases
- [x] Create design token system (CSS variables)
- [x] Build base UI components (Button, Input, Badge, Card, Modal, Toast)
- [x] Build layout components (Header, Footer, AnnouncementBar, MegaMenu)
- [x] Set up font configuration
- [x] Configure Tailwind design tokens

---

## Phase 4: Database Models

### Models to implement (in order)
1. `User` + `AdminUser`
2. `Session` + `OTPChallenge`
3. `Category` (with parent support for subcategories)
4. `Product` + `ProductVariant` + `ProductImage`
5. `Inventory` + `InventoryMovement`
6. `Cart` + `CartItem`
7. `Coupon` + `CouponUsage`
8. `Order` + `OrderItem`
9. `Payment` + `Refund`
10. `Shipment` + `Invoice`
11. `Wishlist`
12. `WholesaleEnquiry` + `Quotation`
13. `SiteContent` + `StoreSettings`
14. `AuditLog` + `WebhookEvent`
15. `NewsletterSubscription`

---

## Phase 5: API Layer

### Endpoint groups
- `POST /api/auth/otp/send`
- `POST /api/auth/otp/verify`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET/POST/PUT/DELETE /api/addresses`
- `GET /api/products` (with filters, sort, pagination)
- `GET /api/products/[slug]`
- `GET /api/categories`
- `GET/POST/PUT/DELETE /api/cart`
- `GET/POST/DELETE /api/wishlist`
- `POST /api/coupons/validate`
- `POST /api/checkout/initiate`
- `POST /api/payments/verify`
- `POST /api/webhooks/razorpay`
- `GET /api/orders` (customer's orders)
- `GET /api/orders/[id]`
- `POST /api/wholesale-enquiries`
- `GET /api/search`
- All admin endpoints

---

## Phase 6: Storefront UI

### Page implementation order
1. Design system preview page
2. Homepage (hero, categories, featured products, collections)
3. Product listing page (with filters sidebar + mobile drawer)
4. Product detail page (gallery, specs, bulk pricing, add to cart)
5. Search results page
6. Cart page
7. Checkout multi-step
8. Order confirmation page
9. Auth pages (login, OTP verify)
10. Customer account pages (dashboard, orders, addresses, wishlist)
11. Informational pages (about, contact, FAQ, policies)
12. Wholesale enquiry page
13. Corporate gifting page
14. Custom packaging page
15. 404 and error pages

---

## Phase 7: Authentication

### Implementation checklist
- [x] Email OTP send with rate limiting
- [x] OTP hashing and storage
- [x] OTP verification with attempt limits
- [x] Session creation and cookie management
- [x] Session middleware for protected routes
- [x] Admin auth with password + session
- [x] CSRF protection
- [x] Route protection (customer + admin)
- [x] Login/logout UI flows
- [x] Session expiry handling

---

## Phase 8: Commerce Backend

### Checklist
- [x] Cart service (add, update, remove, validate)
- [x] Price calculation service (server-authoritative)
- [x] Coupon validation service
- [x] Inventory reservation service (atomic ops)
- [x] Checkout service (validate → create order)
- [x] Razorpay order creation (server-side)
- [x] Payment verification (signature validation)
- [x] Order creation with snapshots
- [x] Payment webhook handler (idempotent)
- [x] Order status state machine
- [x] Invoice generation (PDF/HTML)
- [x] Post-order email triggers

---

## Phase 9: Admin Dashboard

### Module checklist
- [x] Admin auth + RBAC middleware
- [x] Dashboard overview with real metrics
- [x] Product CRUD + image upload
- [x] Category management
- [x] Inventory management
- [x] Order management + status workflow
- [x] Customer management
- [x] Coupon management
- [x] Wholesale enquiry CRM
- [x] Content management (banners, pages, FAQs)
- [x] Reports + exports
- [x] Settings management
- [x] Audit log viewer

---

## Phase 10: Integrations

### Checklist
- [x] Email: Resend/Nodemailer with HTML templates
- [x] Razorpay: full test mode integration
- [x] Object storage: S3 or R2 with signed URLs / local assets
- [x] Error monitoring & fallback handling
- [x] Structured logging

---

## Phase 11: Testing

### Test coverage targets
- [x] Auth flows (OTP, admin login, sessions, RBAC)
- [x] Cart operations & bulk volume pricing
- [x] Checkout + payment verification (HMAC SHA-256)
- [x] Order state machine validation
- [x] Coupon validation
- [x] Inventory reservation
- [x] Admin CRUD operations
- [x] API input validation (PIN codes, phones, addresses)
- [x] Webhook idempotency & forged signature rejection
- [x] Security (cross-account access, unauthorized admin)

---

## Phase 12: Deployment Readiness

### Deliverables
- [x] `.env.example` with all variables documented
- [x] `README.md` with full setup instructions
- [x] Database seed scripts
- [x] Admin bootstrap script
- [x] Production build validation (48/48 routes compiled)
- [x] Deployment guide (Vercel / self-hosted)
- [x] Backup and restore procedures
- [x] Security review checklist
- [x] Known limitations document

---

## Dependency Installation Plan

```bash
# Production dependencies
pnpm add mongoose razorpay resend nodemailer
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand swr
pnpm add bcryptjs nanoid
pnpm add pino pino-pretty
pnpm add sharp multer
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add @sentry/nextjs
pnpm add framer-motion lucide-react
pnpm add class-variance-authority clsx tailwind-merge
pnpm add date-fns
pnpm add @react-pdf/renderer  # Invoice PDF generation

# Dev dependencies
pnpm add -D vitest @vitest/coverage-v8
pnpm add -D @testing-library/react @testing-library/user-event
pnpm add -D @playwright/test
pnpm add -D @types/bcryptjs @types/nodemailer @types/multer
pnpm add -D msw  # API mocking
```

---

## Environment Variables Required

### Application
- `NEXT_PUBLIC_APP_URL` — Public application URL
- `NODE_ENV` — `development | production | test`

### Database
- `MONGODB_URI` — MongoDB connection string (replica set required for transactions)

### Authentication
- `SESSION_SECRET` — 32+ character random secret for session signing
- `OTP_RATE_LIMIT_WINDOW_MS` — Rate limit window (default: 900000 = 15 min)
- `OTP_MAX_REQUESTS` — Max OTP requests per window (default: 3)

### Email
- `EMAIL_PROVIDER` — `resend | smtp`
- `RESEND_API_KEY` — Resend API key (if using Resend)
- `SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS` — SMTP config
- `EMAIL_FROM` — From address (e.g., orders@mithaiboxes.com)

### Payments
- `RAZORPAY_KEY_ID` — Razorpay test/live key ID
- `RAZORPAY_KEY_SECRET` — Razorpay test/live key secret (server only)
- `RAZORPAY_WEBHOOK_SECRET` — Webhook signature secret
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Public key for client-side checkout modal

### Storage
- `STORAGE_PROVIDER` — `s3 | r2 | local`
- `AWS_ACCESS_KEY_ID` — S3/R2 access key
- `AWS_SECRET_ACCESS_KEY` — S3/R2 secret key
- `AWS_REGION` — S3 region
- `AWS_S3_BUCKET` — S3 bucket name
- `CLOUDFLARE_R2_ENDPOINT` — R2 endpoint (if using R2)

### Monitoring
- `SENTRY_DSN` — Sentry project DSN
- `SENTRY_AUTH_TOKEN` — Sentry auth token for source maps

### Admin Bootstrap
- `ADMIN_BOOTSTRAP_EMAIL` — Initial admin email (used once)
- `ADMIN_BOOTSTRAP_PASSWORD` — Initial admin password (used once)
