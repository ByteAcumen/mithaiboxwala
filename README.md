# Mithai Box Wala — E-Commerce & Wholesale Packaging Platform

> **"The Perfection of Your Sweets, Paired with Our Ultimate Packaging."**  
> *"Every Sweet Deserves a Beautiful Beginning."*

A full-stack, production-grade e-commerce storefront, wholesale quotation platform, and operational administrator dashboard built for **Mithai Box Wala** (manufactured by **Ajay Packers** with 40 years of packaging heritage).

---

## 🏛️ Business & Legal Identity

* **Customer-Facing Brand:** Mithai Box Wala
* **Manufacturing Business:** Ajay Packers
* **Experience:** 40+ Years (Since 1984)
* **GSTIN:** `09AMJPK3071C3Z6`
* **Official Email:** `mithaiboxwala@gmail.com`
* **Address:** Mirzapur, Uttar Pradesh – 231001, India
* **Representatives:** Ajay Kumar & Sanjay Kumar
* **Official Reference:** [https://www.mithaiboxes.com/](https://www.mithaiboxes.com/)

---

## 📦 Key Platform Highlights

1. **Editorial Luxury Storefront:**
   - Palette inspired by traditional Indian royal celebrations: Burgundy (`#681C2D`), Ivory (`#FAF7F0`), Antique Gold (`#B8955A`), Charcoal (`#24211F`), and Warm Beige (`#EDE4D6`).
   - Complete responsive mega menu, real-time search, category landing pages, rich product detail pages with multi-angle image gallery, MOQ indicators, and live bulk tier volume discounts.
2. **Customer Experience & OTP Authentication:**
   - Passwordless, crypto-secure 6-digit email OTP login with bcrypt hashing, attempt throttling, and auto-expiry.
   - Comprehensive customer account portal (`/account`): recent orders, real-time courier tracking (LR/tracking number lookup), saved addresses manager, and wishlist.
3. **Cart & Server-Authoritative Checkout:**
   - Slide-over cart drawer and dedicated cart page.
   - Dynamic bulk-quantity tiered price recalculations (all computations strictly performed and verified on the server).
   - Coupon engine supporting fixed and percentage discounts with minimum order thresholds.
   - 100% advance payment requirement via Razorpay with cryptographic HMAC SHA-256 signature verification.
4. **Wholesale & Corporate Gifting CRM:**
   - Dedicated wholesale lead generation pipeline (`/wholesale`, `/corporate-gifting`, `/custom-packaging`).
   - Admin CRM dashboard with status tracking (`new` -> `contacted` -> `sample_sent` -> `quoted` -> `won` -> `lost`), internal follow-up notes, and quotation value logging.
5. **Full Admin Control Panel (`/admin`):**
   - KPI metrics overview: Total Revenue, Gross Order Count, Active Catalog Items, Low-Stock Alerts, and Live Sales Feed.
   - Order fulfillment workflow with state machine validations (`pending` -> `confirmed` -> `processing` -> `dispatched` -> `delivered` / `cancelled`), dispatch courier and tracking number assignment.
   - Inventory movements journal and real-time stock adjustment modal.
   - Product catalog editor with variant, MOQ, and bulk pricing tier configuration.
   - Category management with SEO metadata and image badges.
   - Verified business profile settings with policy management.
6. **Security & Data Integrity:**
   - HttpOnly, SameSite session cookies for both customer and admin sessions.
   - Server-side atomic stock reservations.
   - Strict input validation via Zod schemas (Indian 6-digit PIN codes, 10-digit mobile numbers, shipping addresses).

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16.4.3](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
* **Language:** TypeScript 5.9
* **Styling:** Tailwind CSS 4
* **Database & ORM:** MongoDB with [Mongoose 8+](https://mongoosejs.com/)
* **State Management:** Zustand (Cart & UI drawers)
* **Payments:** Razorpay API & Webhook verification (with fallback simulation)
* **Icons:** Lucide React
* **Unit Testing:** [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 20+ installed
* `pnpm` installed (`npm i -g pnpm`)
* MongoDB instance (local `mongodb://localhost:27017/mithaiboxes` or MongoDB Atlas URI)

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

Key environment variables:
```env
MONGODB_URI=mongodb://localhost:27017/mithaiboxes
SESSION_SECRET=your_32_char_cryptographically_secure_session_secret
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourRazorpaySecret
ADMIN_INITIAL_EMAIL=admin@mithaiboxes.com
ADMIN_INITIAL_PASSWORD=MithaiAdmin@2026!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Seed Database & Bootstrap Admin
Populate 11 packaging categories, sample luxury catalog boxes with volume discount tiers, and initial discount coupons:
```bash
pnpm run seed
```

Create or verify the initial Super Administrator account:
```bash
pnpm run bootstrap:admin
```
* Default Admin Email: `admin@mithaiboxes.com`
* Default Admin Password: `MithaiAdmin@2026!`

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Admin Panel.

---

## 🧪 Testing Suite

Run all unit and security verification tests using Vitest:
```bash
pnpm test
```
Includes:
* Unit tests for cart bulk discount calculations and order state machine rules.
* Security tests for Razorpay HMAC SHA-256 signature verification and forged webhook rejection.
* Schema validation tests for PIN codes, Indian phone numbers, and address formats.

---

## 🏗️ Production Build

To build the production bundle:
```bash
pnpm build
```

To run the production server:
```bash
pnpm start
```

---

## 🗺️ Key Routes Summary

| Area | Route | Purpose |
| :--- | :--- | :--- |
| **Storefront** | `/` | Editorial homepage with hero, occasions, catalog highlights & heritage story |
| | `/products` | Filterable catalog with search, categories, and sorting |
| | `/products/[slug]` | Product Detail Page with MOQ rules, bulk tiers, and specs |
| | `/cart` & Drawer | Server-synced shopping cart |
| | `/checkout` | Delivery address form & Razorpay payment trigger |
| | `/checkout/success` | Order confirmation with dispatch timeline |
| | `/wholesale` | Bulk order & corporate quotation enquiry form |
| | `/custom-packaging` | Bespoke box manufacturing & branding service page |
| | `/shipping-policy` | 2-day dispatch & courier policy breakdown |
| | `/returns-policy` | Strict hygienic no-return policy statement |
| **Auth & Account** | `/auth/login` | Passwordless 6-digit email OTP login |
| | `/account` | Customer dashboard overview |
| | `/account/orders` | Order history & live LR tracking lookup |
| | `/account/addresses`| Saved shipping addresses manager |
| **Admin Panel** | `/admin/login` | Secure administrator authentication |
| | `/admin` | Metrics overview (Revenue, Orders, Low Stock Alerts) |
| | `/admin/orders` | Order fulfillment pipeline & courier tracking entry |
| | `/admin/products` | Catalog inventory & bulk tier manager |
| | `/admin/inventory` | Real-time stock audit & adjustments journal |
| | `/admin/enquiries` | Wholesale CRM lead management pipeline |
| | `/admin/settings` | Store configuration, tax details & operational rules |

---

## 📄 Documentation

Comprehensive architecture, research audit, and API documentation are located in `/docs`:
* [`docs/website-audit.md`](file:///docs/website-audit.md): Systematic audit of the reference website.
* [`docs/feature-matrix.md`](file:///docs/feature-matrix.md): Full comparison of reference vs. new Mithai Box Wala platform.
* [`docs/architecture.md`](file:///docs/architecture.md): Technical architecture, data flow, and security boundaries.
* [`docs/api-documentation.md`](file:///docs/api-documentation.md): Complete REST API contract and endpoint specifications.
* [`docs/implementation-plan.md`](file:///docs/implementation-plan.md): 12-phase execution and verification record.
