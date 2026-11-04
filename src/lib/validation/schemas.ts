/**
 * Shared Zod validation schemas for API input validation.
 * Use these on both client (form validation) and server (API handlers).
 */

import { z } from 'zod';

// ============================================================
// COMMON
// ============================================================

export const PincodeSchema = z
  .string()
  .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits');

export const PhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const EmailSchema = z.string().email('Enter a valid email address').toLowerCase().trim();

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

// ============================================================
// AUTH
// ============================================================

export const SendOTPSchema = z.object({
  email: EmailSchema,
});

export const VerifyOTPSchema = z.object({
  email: EmailSchema,
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must contain only digits'),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(160).optional(),
});

export const AdminLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

// ============================================================
// ADDRESS
// ============================================================

export const AddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2).max(100).trim(),
  phone: PhoneSchema,
  addressLine1: z.string().min(5).max(200).trim(),
  addressLine2: z.string().max(200).trim().optional(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  pincode: PincodeSchema,
  country: z.string().default('India'),
  isDefault: z.boolean().optional().default(false),
});

// ============================================================
// PRODUCT
// ============================================================

export const ProductFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  colors: z.string().transform((v) => v.split(',')).optional(),
  materials: z.string().transform((v) => v.split(',')).optional(),
  inStock: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  featured: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'relevance']).default('newest'),
  ...PaginationSchema.shape,
});

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  slug: z.string().min(2).max(200).toLowerCase().trim().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  sku: z.string().min(2).max(50).toUpperCase().trim(),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  moq: z.number().int().min(1),
  unit: z.string().default('piece'),
  bulkPricingTiers: z.array(z.object({
    minQty: z.number().int().min(1),
    maxQty: z.number().int().optional(),
    pricePerUnit: z.number().min(0),
  })).optional().default([]),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    unit: z.string().default('cm'),
  }).optional(),
  materials: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  compartments: z.number().int().min(1).optional(),
  style: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isCustomizable: z.boolean().default(false),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  tags: z.array(z.string()).optional().default([]),
});

// ============================================================
// CART
// ============================================================

export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
});

export const UpdateCartItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0), // 0 removes the item
});

export const ApplyCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase().trim(),
});

// ============================================================
// CHECKOUT
// ============================================================

export const CheckoutContactSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2).max(100).trim(),
  phone: PhoneSchema,
});

export const InitiateCheckoutSchema = z.object({
  contact: CheckoutContactSchema,
  shippingAddress: AddressSchema,
  billingAddressSameAsShipping: z.boolean().default(true),
  billingAddress: AddressSchema.optional(),
  couponCode: z.string().max(50).optional(),
  saveAddress: z.boolean().default(false),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// ============================================================
// WHOLESALE ENQUIRY
// ============================================================

export const WholesaleEnquirySchema = z.object({
  companyName: z.string().max(200).trim().optional(),
  contactName: z.string().min(2).max(100).trim(),
  email: EmailSchema,
  phone: PhoneSchema,
  productInterest: z.string().max(500).trim().optional(),
  categoryInterest: z.string().optional(),
  estimatedQuantity: z.number().int().min(1).optional(),
  customizationRequirements: z.string().max(2000).trim().optional(),
  requiredDeliveryDate: z.string().optional(),
  destination: z.string().max(200).trim().optional(),
  message: z.string().max(2000).trim().optional(),
  // Honeypot field — must be empty
  website: z.string().max(0).optional(),
});

// ============================================================
// COUPON (ADMIN)
// ============================================================

export const CreateCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().trim().regex(/^[A-Z0-9_-]+$/, 'Code can only contain letters, numbers, underscores, and hyphens'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perCustomerLimit: z.number().int().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

// ============================================================
// NEWSLETTER
// ============================================================

export const NewsletterSignupSchema = z.object({
  email: EmailSchema,
  consent: z.literal(true, { errorMap: () => ({ message: 'You must consent to subscribe' }) }),
  // Honeypot
  website: z.string().max(0).optional(),
});

// ============================================================
// ADMIN USER
// ============================================================

export const CreateAdminUserSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2).max(100).trim(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  role: z.enum(['super_admin', 'catalog_manager', 'order_manager', 'inventory_manager', 'customer_support', 'marketing_manager']),
});
