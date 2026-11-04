import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================================
// USER MODEL
// ============================================================
export interface IUser extends Document {
  email: string;
  name?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  deletionRequestedAt?: Date;
  marketingConsent: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, trim: true, maxlength: 100 },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    deletionRequestedAt: { type: Date },
    marketingConsent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ============================================================
// ADMIN USER MODEL
// ============================================================
export type AdminRole =
  | 'super_admin'
  | 'catalog_manager'
  | 'order_manager'
  | 'inventory_manager'
  | 'customer_support'
  | 'marketing_manager';

export interface IAdminUser extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['super_admin', 'catalog_manager', 'order_manager', 'inventory_manager', 'customer_support', 'marketing_manager'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    lastLoginAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

// ============================================================
// SESSION MODEL
// ============================================================
export interface ISession extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  userType: 'customer' | 'admin';
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ['customer', 'admin'], required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ============================================================
// OTP CHALLENGE MODEL
// ============================================================
export interface IOTPChallenge extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
}

const OTPChallengeSchema = new Schema<IOTPChallenge>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    attempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ============================================================
// CATEGORY MODEL
// ============================================================
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parent?: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, maxlength: 2000 },
    imageUrl: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
  },
  { timestamps: true }
);

CategorySchema.index({ parent: 1, sortOrder: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

// ============================================================
// PRODUCT MODEL
// ============================================================
export interface IProductImage {
  url: string;
  altText?: string;
  sortOrder: number;
  storageKey?: string;
}

export interface IBulkPricingTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  images: IProductImage[];
  basePrice: number;
  salePrice?: number;
  moq: number;
  unit: string;
  bulkPricingTiers: IBulkPricingTier[];
  // Specifications
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: number;
  materials?: string[];
  colors?: string[];
  compartments?: number;
  style?: string;
  // States
  isActive: boolean;
  isFeatured: boolean;
  isCustomizable: boolean;
  hasVariants: boolean;
  videoUrl?: string;
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  // Stats (denormalized for performance)
  totalSold: number;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, maxlength: 10000 },
    shortDescription: { type: String, maxlength: 500 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
        sortOrder: { type: Number, default: 0 },
        storageKey: { type: String },
      },
    ],
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    moq: { type: Number, required: true, default: 1, min: 1 },
    unit: { type: String, default: 'piece' },
    bulkPricingTiers: [
      {
        minQty: { type: Number, required: true, min: 1 },
        maxQty: { type: Number },
        pricePerUnit: { type: Number, required: true, min: 0 },
      },
    ],
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'cm' },
    },
    weight: { type: Number },
    materials: [{ type: String }],
    colors: [{ type: String }],
    compartments: { type: Number },
    style: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isCustomizable: { type: Boolean, default: false },
    hasVariants: { type: Boolean, default: false },
    videoUrl: { type: String },
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
    tags: [{ type: String }],
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1, basePrice: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ totalSold: -1, isActive: 1 });

// ============================================================
// PRODUCT VARIANT MODEL
// ============================================================
export interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  priceModifier: number;
  isActive: boolean;
  createdAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    attributes: { type: Map, of: String },
    priceModifier: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ============================================================
// INVENTORY MODEL
// ============================================================
export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantityOnHand: number;
  quantityReserved: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: false },
    allowBackorder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InventorySchema.index({ product: 1, variant: 1 }, { unique: true });

// ============================================================
// INVENTORY MOVEMENT MODEL
// ============================================================
export interface IInventoryMovement extends Document {
  inventory: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  type: 'in' | 'out' | 'reserved' | 'released' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
    type: { type: String, enum: ['in', 'out', 'reserved', 'released', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    reference: { type: String },
    performedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// ============================================================
// ADDRESS MODEL
// ============================================================
export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, maxlength: 50 },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ============================================================
// CART MODEL
// ============================================================
export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  productSnapshot: {
    name: string;
    sku: string;
    slug: string;
    imageUrl?: string;
    moq: number;
  };
  quantity: number;
  unitPrice: number;
  addedAt: Date;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  couponCode?: string;
  expiresAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    guestId: { type: String, sparse: true, index: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
        productSnapshot: {
          name: String,
          sku: String,
          slug: String,
          imageUrl: String,
          moq: Number,
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    couponCode: { type: String },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

// ============================================================
// COUPON MODEL
// ============================================================
export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: mongoose.Types.ObjectId[];
  usageLimit?: number;
  perCustomerLimit?: number;
  usedCount: number;
  startsAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    usageLimit: { type: Number, min: 0 },
    perCustomerLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CouponSchema.index({ isActive: 1, expiresAt: 1 });

// ============================================================
// ORDER MODEL
// ============================================================
export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  // Immutable snapshot at order time
  snapshot: {
    name: string;
    variantName?: string;
    sku: string;
    imageUrl?: string;
    moq: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ITaxLine {
  name: string;
  rate: number;
  amount: number;
}

export interface IShippingLine {
  name: string;
  amount: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  // Immutable snapshots
  customerSnapshot: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddressSnapshot: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddressSnapshot?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxLines: ITaxLine[];
  taxTotal: number;
  shippingLines: IShippingLine[];
  shippingTotal: number;
  grandTotal: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string; updatedBy?: string }[];
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  internalNotes?: string;
  guestEmail?: string;
  razorpayOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customerSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    shippingAddressSnapshot: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    billingAddressSnapshot: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },
        snapshot: {
          name: String,
          variantName: String,
          sku: String,
          imageUrl: String,
          moq: Number,
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String },
    taxLines: [{ name: String, rate: Number, amount: Number }],
    taxTotal: { type: Number, default: 0 },
    shippingLines: [{ name: String, amount: Number }],
    shippingTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refund_pending', 'refunded'],
      default: 'pending_payment',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    internalNotes: { type: String },
    guestEmail: { type: String },
    razorpayOrderId: { type: String, index: true },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'customerSnapshot.email': 1 });

// ============================================================
// PAYMENT MODEL
// ============================================================
export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  method?: string;
  bank?: string;
  wallet?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  capturedAt?: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String, select: false },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending',
    },
    method: { type: String },
    bank: { type: String },
    wallet: { type: String },
    metadata: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    capturedAt: { type: Date },
  },
  { timestamps: true }
);

// ============================================================
// SHIPMENT MODEL
// ============================================================
export interface IShipment extends Document {
  order: mongoose.Types.ObjectId;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedDelivery?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    courier: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    trackingUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
      default: 'pending',
    },
    estimatedDelivery: { type: Date },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// ============================================================
// WISHLIST MODEL
// ============================================================
export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

// ============================================================
// WHOLESALE ENQUIRY MODEL
// ============================================================
export type EnquiryStatus =
  | 'new'
  | 'in_review'
  | 'quote_sent'
  | 'negotiating'
  | 'converted'
  | 'closed_won'
  | 'closed_lost';

export interface IWholesaleEnquiry extends Document {
  companyName?: string;
  contactName: string;
  email: string;
  phone: string;
  productInterest?: string;
  categoryInterest?: mongoose.Types.ObjectId;
  estimatedQuantity?: number;
  customizationRequirements?: string;
  requiredDeliveryDate?: Date;
  destination?: string;
  message?: string;
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId;
  internalNotes?: string;
  followUpDate?: Date;
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const WholesaleEnquirySchema = new Schema<IWholesaleEnquiry>(
  {
    companyName: { type: String, trim: true, maxlength: 200 },
    contactName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    productInterest: { type: String, maxlength: 500 },
    categoryInterest: { type: Schema.Types.ObjectId, ref: 'Category' },
    estimatedQuantity: { type: Number, min: 1 },
    customizationRequirements: { type: String, maxlength: 2000 },
    requiredDeliveryDate: { type: Date },
    destination: { type: String, maxlength: 200 },
    message: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ['new', 'in_review', 'quote_sent', 'negotiating', 'converted', 'closed_won', 'closed_lost'],
      default: 'new',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    internalNotes: { type: String },
    followUpDate: { type: Date },
    referenceNumber: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

WholesaleEnquirySchema.index({ createdAt: -1 });

// ============================================================
// SITE CONTENT MODEL
// ============================================================
export interface ISiteContent extends Document {
  key: string;
  type: 'text' | 'html' | 'json' | 'image';
  value: string;
  label: string;
  isPublished: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['text', 'html', 'json', 'image'], required: true },
    value: { type: String, required: true },
    label: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

// ============================================================
// AUDIT LOG MODEL
// ============================================================
export interface IAuditLog extends Document {
  adminId?: mongoose.Types.ObjectId;
  adminEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    adminEmail: { type: String },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ adminId: 1, createdAt: -1 });

// ============================================================
// WEBHOOK EVENT MODEL (idempotency)
// ============================================================
export interface IWebhookEvent extends Document {
  provider: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Date;
  error?: string;
  createdAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: { type: String, required: true },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
    processedAt: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

WebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

// ============================================================
// NEWSLETTER SUBSCRIPTION MODEL
// ============================================================
export interface INewsletterSubscription extends Document {
  email: string;
  isActive: boolean;
  source?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    source: { type: String },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

// ============================================================
// STORE SETTINGS MODEL
// ============================================================
export interface IStoreSettings extends Document {
  key: string;
  value: unknown;
  label: string;
  group: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    label: { type: String, required: true },
    group: { type: String, required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

// ============================================================
// MODEL REGISTRATION (with Next.js hot-reload protection)
// ============================================================
function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const User = getModel<IUser>('User', UserSchema);
export const AdminUser = getModel<IAdminUser>('AdminUser', AdminUserSchema);
export const Session = getModel<ISession>('Session', SessionSchema);
export const OTPChallenge = getModel<IOTPChallenge>('OTPChallenge', OTPChallengeSchema);
export const Category = getModel<ICategory>('Category', CategorySchema);
export const Product = getModel<IProduct>('Product', ProductSchema);
export const ProductVariant = getModel<IProductVariant>('ProductVariant', ProductVariantSchema);
export const Inventory = getModel<IInventory>('Inventory', InventorySchema);
export const InventoryMovement = getModel<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);
export const Address = getModel<IAddress>('Address', AddressSchema);
export const Cart = getModel<ICart>('Cart', CartSchema);
export const Coupon = getModel<ICoupon>('Coupon', CouponSchema);
export const Order = getModel<IOrder>('Order', OrderSchema);
export const Payment = getModel<IPayment>('Payment', PaymentSchema);
export const Shipment = getModel<IShipment>('Shipment', ShipmentSchema);
export const Wishlist = getModel<IWishlist>('Wishlist', WishlistSchema);
export const WholesaleEnquiry = getModel<IWholesaleEnquiry>('WholesaleEnquiry', WholesaleEnquirySchema);
export const SiteContent = getModel<ISiteContent>('SiteContent', SiteContentSchema);
export const AuditLog = getModel<IAuditLog>('AuditLog', AuditLogSchema);
export const WebhookEvent = getModel<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
export const NewsletterSubscription = getModel<INewsletterSubscription>('NewsletterSubscription', NewsletterSubscriptionSchema);
export const StoreSettings = getModel<IStoreSettings>('StoreSettings', StoreSettingsSchema);
