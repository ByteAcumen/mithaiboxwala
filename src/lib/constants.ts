/**
 * Business constants — owner-confirmed information.
 * Do not modify without authorization from Ajay Kumar or Sanjay Kumar.
 */

export const BUSINESS = {
  brand: 'Mithai Box Wala',
  manufacturer: 'Ajay Packers',
  gstin: '09AMJPK3071C3Z6',
  email: 'mithaiboxwala@gmail.com',
  website: 'www.mithaiboxes.com',
  address: {
    line1: 'Mirzapur',
    city: 'Mirzapur',
    state: 'Uttar Pradesh',
    pincode: '231001',
    country: 'India',
    full: 'Mirzapur, Uttar Pradesh – 231001, India',
  },
  representatives: ['Ajay Kumar', 'Sanjay Kumar'],
  experience: 40,
  tagline: 'The Perfection of Your Sweets, Paired with Our Ultimate Packaging.',
  officeHours: 'Monday to Saturday, 10:00 AM to 6:00 PM IST',
} as const;

export const COPY = {
  heroHeadline: 'Every Sweet Deserves a Beautiful Beginning.',
  heroSubtext:
    'Premium Mithai Boxes, Thoughtful Designs, and Customized Packaging Solutions for Every Celebration.',
  heroPrimaryBtn: 'Explore Collections',
  heroSecondaryBtn: 'Request Bulk Quote',
  brandMessage: '40 Years of Packaging Experience. Quality, Creativity and Craftsmanship.',
  mission:
    'To provide quality packaging solutions that enhance presentation, protect sweets, and help businesses elevate their brand value.',
  vision:
    'To become a trusted packaging partner for sweet manufacturers, retailers, gifting businesses, and corporate customers through quality, innovation, customization, and reliable service.',
  wholesaleTitle: 'Wholesale & Bulk Orders',
  wholesaleDesc:
    'We supply packaging in bulk to sweet manufacturers, retailers, distributors, and gifting businesses across India. Contact us for custom dimensions, printing, and volume pricing.',
} as const;

export const CATEGORIES = [
  { name: 'Mithai Boxes', slug: 'mithai-boxes', emoji: '🍮' },
  { name: 'Dry Fruit Boxes', slug: 'dry-fruit-boxes', emoji: '🥜' },
  { name: 'Chocolate Boxes', slug: 'chocolate-boxes', emoji: '🍫' },
  { name: 'Sweet Boxes', slug: 'sweet-boxes', emoji: '🍬' },
  { name: 'Cake Boxes', slug: 'cake-boxes', emoji: '🎂' },
  { name: 'Gift Hampers', slug: 'gift-hampers', emoji: '🎁' },
  { name: 'Wedding Boxes', slug: 'wedding-boxes', emoji: '💍' },
  { name: 'Folding Boxes', slug: 'folding-boxes', emoji: '📦' },
  { name: 'Basket & Gourmet', slug: 'basket-gourmet', emoji: '🧺' },
  { name: 'Corporate Gifting', slug: 'corporate-gifting', emoji: '🏢' },
  { name: 'Customized Packaging', slug: 'customized-packaging', emoji: '✏️' },
] as const;

export const FESTIVALS = [
  { name: 'Diwali Collection', slug: 'diwali' },
  { name: 'Raksha Bandhan', slug: 'raksha-bandhan' },
  { name: 'Bhai Dooj', slug: 'bhai-dooj' },
  { name: 'Holi', slug: 'holi' },
  { name: 'Wedding Season', slug: 'wedding' },
  { name: 'Birthday Packaging', slug: 'birthday' },
  { name: 'Corporate Gifts', slug: 'corporate' },
] as const;

// Shipping policy constants (from verified public policy)
export const SHIPPING_POLICY = {
  dispatchDays: 2,
  fridayNote: 'Orders placed on Friday are dispatched the following Monday.',
  chargesNote: 'Shipping and packing charges are extra and calculated based on destination and quantity.',
  mumbaNote: 'Additional charges apply for deliveries within and outside Mirzapur/UP.',
  noReturns: 'No returns are accepted once an order has been dispatched.',
  advancePayment: '100% advance payment is required before dispatch.',
} as const;

// Order status display labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting Payment',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refund_pending: 'Refund Pending',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-amber-600 bg-amber-50',
  confirmed: 'text-blue-600 bg-blue-50',
  processing: 'text-indigo-600 bg-indigo-50',
  packed: 'text-purple-600 bg-purple-50',
  shipped: 'text-sky-600 bg-sky-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-600 bg-red-50',
  refund_pending: 'text-orange-600 bg-orange-50',
  refunded: 'text-gray-600 bg-gray-50',
};
