// Global TypeScript types for the MithaiBoxes platform

export type UserRole = 'customer';

export type AdminRole =
  | 'super_admin'
  | 'catalog_manager'
  | 'order_manager'
  | 'inventory_manager'
  | 'customer_support'
  | 'marketing_manager';

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

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type EnquiryStatus =
  | 'new'
  | 'in_review'
  | 'quote_sent'
  | 'negotiating'
  | 'converted'
  | 'closed_won'
  | 'closed_lost';

export type StorageProvider = 'local' | 's3' | 'r2';
export type EmailProvider = 'resend' | 'smtp';

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response wrapper
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  requestId?: string;
}

// Address
export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

// Product pricing
export interface BulkPricingTier {
  minQty: number;
  maxQty?: number;
  pricePerUnit: number;
}

// Cart line item
export interface CartLineItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku: string;
  slug: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  moq: number;
}

// Order snapshot types (immutable at order creation)
export interface OrderAddressSnapshot extends Address {}

export interface OrderProductSnapshot {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  moq: number;
}

// Razorpay checkout options (client-side)
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

// Filter types for product listing
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  materials?: string[];
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'relevance';
  page?: number;
  limit?: number;
}

// Dashboard metrics
export interface DashboardMetrics {
  totalOrders: number;
  confirmedRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundTotal: number;
  productCount: number;
  lowStockCount: number;
  customerCount: number;
  newCustomersThisMonth: number;
  recentOrders: RecentOrder[];
  salesByDay: SalesByDay[];
  topProducts: TopProduct[];
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface SalesByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  imageUrl?: string;
  totalSold: number;
  revenue: number;
}
