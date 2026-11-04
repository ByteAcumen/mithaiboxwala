# Mithai Box Wala — Backend API Documentation

**Base URL:** `http://localhost:3000/api`  
**Authentication Scheme:** Secure HttpOnly Session Cookies (`mb_session` for customers, `mb_admin_session` for administrators)  
**Response Structure:** Standardized `{ success: boolean, data?: T, error?: string, message?: string, requestId?: string }`

---

## 1. Authentication & Account Endpoints

### `POST /api/auth/otp/send`
Request a cryptographically secure 6-digit one-time password delivered via configured transactional email provider (Resend/SMTP).
- **Rate Limit:** 3 attempts per 15-minute rolling window per email.
- **Request Body:**
  ```json
  {
    "email": "customer@sweetbrand.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login code sent. Please check your email.",
    "expiresAt": "2026-11-01T15:45:00.000Z",
    "requestId": "mb_req_7294"
  }
  ```

### `POST /api/auth/otp/verify`
Verify the 6-digit OTP code, create a persistent MongoDB session, and set an encrypted HttpOnly cookie.
- **Request Body:**
  ```json
  {
    "email": "customer@sweetbrand.com",
    "otp": "492018"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "isNewUser": false,
    "user": {
      "id": "6724fa10842bb1001e389a01",
      "email": "customer@sweetbrand.com",
      "name": "Ajay Kumar"
    }
  }
  ```

### `POST /api/auth/logout`
Revoke active session in database and delete the `mb_session` cookie.

### `GET /api/users/me`
Retrieve currently authenticated customer profile.
- **Headers:** Cookie: `mb_session=...`

---

## 2. Product Catalog & Search Endpoints

### `GET /api/products`
Query catalog with multi-dimensional filtering, text indexing, sorting, and pagination.
- **Query Parameters:**
  - `category`: Category slug (e.g., `mithai-boxes`, `dry-fruit-boxes`)
  - `search`: Full-text search term
  - `sort`: `newest` | `price_asc` | `price_desc` | `popular`
  - `page`: Integer (default `1`)
  - `limit`: Integer (default `16`, max `50`)

### `GET /api/products/[slug]`
Retrieve single product specifications, inventory tracking, image gallery, and volume tier pricing.

### `GET /api/categories`
List all active categories with associated product counts.

### `GET /api/search?q=...`
Instant search suggestion endpoint returning top 6 matching box names, thumbnails, and base prices.

---

## 3. Cart & Wishlist Endpoints

### `GET /api/cart`
Retrieve customer or guest cart with real-time server-authoritative price recalculations.

### `POST /api/cart`
Add line item to cart with server-side validation against Minimum Order Quantity (MOQ) and stock availability.
- **Request Body:**
  ```json
  {
    "productId": "6724fb20842bb1001e389a10",
    "quantity": 100
  }
  ```

### `PUT /api/cart/[itemId]`
Update quantity or remove (when `quantity: 0`).

### `POST /api/cart/coupon`
Apply coupon code with validation against minimum order values, active dates, and usage limits.

---

## 4. Checkout & Razorpay Payment Endpoints

### `POST /api/checkout/initiate`
Server-authoritative checkout initiation:
1. Re-validates cart items, MOQs, and volume discounts directly from MongoDB.
2. Atomically reserves stock to prevent overselling.
3. Creates an order record in `pending_payment` status.
4. Generates an authentic Razorpay order server-side via official SDK in paise.
- **Request Body:**
  ```json
  {
    "contact": { "name": "Ajay Kumar", "email": "ajay@ajaypackers.com", "phone": "9876543210" },
    "shippingAddress": {
      "fullName": "Ajay Kumar",
      "phone": "9876543210",
      "addressLine1": "Civil Lines, Near Clock Tower",
      "city": "Mirzapur",
      "state": "Uttar Pradesh",
      "pincode": "231001",
      "country": "India"
    },
    "billingAddressSameAsShipping": true
  }
  ```

### `POST /api/payments/verify`
Server-side cryptographic verification of Razorpay payment signature using HMAC SHA-256.
- Confirms order status to `confirmed`.
- Converts reserved stock to permanently deducted inventory.
- Dispatches transactional order confirmation email.
- **Request Body:**
  ```json
  {
    "orderId": "6724fc30842bb1001e389b05",
    "razorpay_order_id": "order_DA98123XYZ",
    "razorpay_payment_id": "pay_FA12345678",
    "razorpay_signature": "9b128f...39a1c"
  }
  ```

### `POST /api/webhooks/razorpay`
Idempotent webhook endpoint verifying Razorpay HMAC signatures and recording deduplicated events in `WebhookEvent` collection.

---

## 5. Wholesale Quotation CRM Endpoints

### `POST /api/wholesale-enquiries`
Submit high-volume packaging inquiry (500+ units, custom foil stamping, tailored dimensions).
- **Honeypot protection:** Rejects spam submissions where `website` field is populated.
- Generates a unique tracking reference number (e.g. `MB-WHL-123456-ABCD`).
- Sends email confirmation to customer and notification to management.

---

## 6. Admin API Endpoints (`/api/admin/*`)

Protected by `requireAdminAuth()` with Role-Based Access Control:
- `super_admin`: Full privileges
- `catalog_manager`: Products, categories, images
- `order_manager`: Status transitions, cancellations, shipments
- `inventory_manager`: Stock additions, deductions, threshold adjustments
- `customer_support`: View-only for customer inquiries and orders
- `marketing_manager`: Coupons, promotional content

### Key Admin Endpoints:
- `POST /api/admin/auth/login`: Email & bcrypt password verification with brute-force attempt limits.
- `GET /api/admin/dashboard`: Real-time aggregated MongoDB metrics.
- `GET / POST / PUT /api/admin/products`: Product CRUD.
- `GET / PUT /api/admin/orders/[id]`: Order state machine transitions & courier LR tracking numbers.
- `POST /api/admin/orders/[id]/cancel`: Order cancellation with automatic inventory release.
- `GET / PUT /api/admin/inventory/[id]`: Stock adjustments with `InventoryMovement` audit trails.
- `GET /api/admin/reports/orders?format=csv`: CSV report export.
