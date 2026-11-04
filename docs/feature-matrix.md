# MithaiBoxes — Feature Matrix

**Status Key:** ✅ Implement | 🔄 Partial (needs enhancement) | ❌ Not on reference site (new feature) | 📋 Configurable

---

## Customer-Facing Features

### Navigation & Discovery
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Sticky header | Unknown | ✅ Yes | High |
| Category mega-menu | No | ✅ Yes with images | High |
| Real-time search | No | ✅ Instant search + suggestions | High |
| Search history | No | ✅ Recent searches | Medium |
| Category browse | ✅ Basic | ✅ Enhanced with filters | High |
| Breadcrumbs | Unknown | ✅ Yes | Medium |
| Announcement bar | Unknown | ✅ Configurable | Medium |
| Mobile navigation drawer | Unknown | ✅ Full-feature | High |
| Wishlist | Partial | ✅ Full wishlist | Medium |
| Recently viewed | Unknown | ✅ Yes | Low |

### Product Catalog
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Category pages | ✅ Yes | ✅ Enhanced | High |
| Subcategory support | Unknown | ✅ Yes | High |
| Product grid view | ✅ Yes | ✅ Refined | High |
| Product list view | Unknown | ✅ Yes | Medium |
| Price filters | Unknown | ✅ Yes | High |
| Size/dimension filters | No | ✅ Yes | High |
| Color/material filters | No | ✅ Yes | High |
| MOQ filters | No | ✅ Yes | High |
| Availability filter | Unknown | ✅ Yes | High |
| Sort by price | Unknown | ✅ Yes | High |
| Sort by newest | Unknown | ✅ Yes | High |
| Sort by popularity | Unknown | ✅ Yes | High |
| Filter URL persistence | Unknown | ✅ Yes | Medium |
| Active filter tags | Unknown | ✅ Yes | Medium |
| Filter reset | Unknown | ✅ Yes | Medium |
| Pagination | Unknown | ✅ Yes (+ infinite scroll option) | High |
| Product count per category | Unknown | ✅ Yes | Low |
| Empty state | Unknown | ✅ Yes | High |

### Product Detail Pages
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Product name & SKU | ✅ Yes | ✅ Yes | High |
| INR pricing | ✅ Yes | ✅ Yes | High |
| Per-piece/per-set pricing | ✅ Yes (implied) | ✅ Configurable | High |
| MOQ display | ✅ Yes (implied) | ✅ Prominent | High |
| Bulk pricing tiers | Unknown | ✅ Yes | High |
| Image gallery | ✅ Basic | ✅ Enhanced with zoom | High |
| Video support | Unknown | ✅ Yes | Low |
| Dimensions & specs | Unknown | ✅ Full specs table | High |
| Materials info | Unknown | ✅ Yes | High |
| Colors available | Unknown | ✅ Yes with swatches | Medium |
| Compartment/cavity info | Unknown | ✅ Yes | High |
| Customization options | Unknown | ✅ Enquiry form | Medium |
| Stock availability | Unknown | ✅ Yes | High |
| Quantity selector | ✅ Yes | ✅ With MOQ validation | High |
| Add to cart | ✅ Yes | ✅ With feedback | High |
| Buy now | Unknown | ✅ Yes | Medium |
| Dispatch estimate | Unknown | ✅ Yes (configurable) | Medium |
| Product enquiry | Unknown | ✅ Yes | High |
| Related products | Unknown | ✅ Yes | Medium |
| Recently viewed | No | ✅ Yes | Low |
| Social sharing | Unknown | ✅ Yes | Low |
| SEO metadata | Unknown | ✅ Full structured data | High |

### Cart
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Add/remove items | ✅ Yes | ✅ Yes | High |
| Update quantity | ✅ Yes | ✅ With MOQ validation | High |
| Variant-aware items | Unknown | ✅ Yes | High |
| Guest cart | Unknown | ✅ Yes | High |
| Persistent cart (auth) | Unknown | ✅ Yes | High |
| Cart merge after login | Unknown | ✅ Yes | High |
| Coupon application | Unknown | ✅ Yes | High |
| Subtotal calculation | ✅ Yes | ✅ Server-authoritative | High |
| Tax calculation | Unknown | ✅ Yes (configurable) | High |
| Shipping estimate | Unknown | ✅ Conditional | Medium |
| Bulk pricing update | Unknown | ✅ Yes | High |
| Stock validation | Unknown | ✅ Yes | High |
| Empty cart state | Unknown | ✅ Yes | Medium |
| Continue shopping | Unknown | ✅ Yes | Medium |

### Checkout
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Contact info step | ✅ Yes | ✅ Yes | High |
| Shipping address | ✅ Yes | ✅ With saved addresses | High |
| Billing address | ✅ Yes | ✅ Same/different option | High |
| PIN code validation | Unknown | ✅ India PIN validation | Medium |
| Shipping method selection | Unknown | ✅ Yes | High |
| Order summary | ✅ Yes | ✅ Detailed | High |
| Tax breakdown | Unknown | ✅ Yes | High |
| Coupon at checkout | Unknown | ✅ Yes | High |
| Payment selection | ✅ Razorpay | ✅ Razorpay + mock dev | High |
| Guest checkout | Unknown | ✅ Yes | High |
| Save address option | Unknown | ✅ Yes | Medium |
| Order confirmation page | ✅ Yes | ✅ With PDF invoice | High |
| Session expiry handling | Unknown | ✅ Yes | High |
| Out-of-stock handling | Unknown | ✅ Yes | High |
| Payment retry | Unknown | ✅ Yes | High |

### Authentication & Accounts
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Login | ✅ Yes | ✅ Email OTP | High |
| Logout | ✅ Yes | ✅ Yes | High |
| Customer registration | ✅ Implied | ✅ Auto-create on OTP | High |
| Password auth | Unknown | ✅ Optional | Low |
| Phone OTP | Unknown | ✅ Optional | Low |
| Session management | Unknown | ✅ Secure HTTP-only cookies | High |
| CSRF protection | Unknown | ✅ Yes | High |
| Rate limiting | Unknown | ✅ Yes | High |
| OTP expiry | Unknown | ✅ Yes | High |
| OTP attempt limits | Unknown | ✅ Yes | High |
| Profile management | Unknown | ✅ Yes | High |
| Address book | Unknown | ✅ Yes | High |
| Order history | ✅ Yes (/orders) | ✅ Yes | High |
| Order detail + invoice | Unknown | ✅ Yes | High |
| Order tracking | Unknown | ✅ Yes | High |
| Wishlist management | Unknown | ✅ Yes | Medium |
| Account deletion | Unknown | ✅ Yes | Medium |
| Privacy preferences | Unknown | ✅ Yes | Medium |
| Notification settings | Unknown | ✅ Yes | Low |

### Informational Pages
| Feature | Reference Site | Our Platform | Priority |
|---|---|---|---|
| Homepage | ✅ Yes | ✅ Premium redesign | High |
| About Us | ✅ Yes | ✅ Editable | High |
| Contact Us | ✅ Yes | ✅ With form | High |
| Wholesale enquiry | Unknown | ✅ Dedicated CRM | High |
| Custom packaging enquiry | Unknown | ✅ Yes | High |
| Corporate gifting | Unknown | ✅ Yes | Medium |
| FAQ | Unknown | ✅ Editable | Medium |
| Shipping policy | ✅ Yes | ✅ Editable by admin | High |
| Returns policy | ✅ Yes | ✅ Editable by admin | High |
| Privacy policy | ✅ Yes | ✅ Editable by admin | High |
| Terms & conditions | ✅ Yes | ✅ Editable by admin | High |
| Sitemap | Unknown | ✅ XML + HTML | Medium |
| Custom 404 | Unknown | ✅ Yes | Medium |
| Error/maintenance pages | Unknown | ✅ Yes | Medium |

---

## Admin Dashboard Features

### Core Admin
| Feature | Our Platform | Priority |
|---|---|---|
| Secure admin login | ✅ Yes | High |
| Role-based access control | ✅ Yes | High |
| Audit logs | ✅ Yes | High |
| MFA support | ✅ Optional | Medium |
| Login rate limiting | ✅ Yes | High |
| Session management | ✅ Yes | High |
| Bootstrap admin command | ✅ Yes | High |

### Dashboard Overview
| Feature | Our Platform | Priority |
|---|---|---|
| Revenue from paid orders | ✅ Real data | High |
| Order counts by status | ✅ Real data | High |
| Low-stock alerts | ✅ Yes | High |
| Customer count | ✅ Real data | High |
| Sales trends chart | ✅ Real data | High |
| Bestselling products | ✅ Real data | High |
| Recent orders table | ✅ Yes | High |
| Date range filters | ✅ Yes | High |

### Product Management
| Feature | Our Platform | Priority |
|---|---|---|
| Full CRUD | ✅ Yes | High |
| Category management | ✅ Yes | High |
| Variant management | ✅ Yes | High |
| Image upload & reorder | ✅ Yes | High |
| Bulk pricing tiers | ✅ Yes | High |
| MOQ configuration | ✅ Yes | High |
| SEO fields | ✅ Yes | High |
| Publish/archive | ✅ Yes | High |
| CSV import/export | ✅ Yes | Medium |
| Featured product marking | ✅ Yes | High |

### Inventory
| Feature | Our Platform | Priority |
|---|---|---|
| Real-time stock tracking | ✅ Yes | High |
| Reserved stock tracking | ✅ Yes | High |
| Stock adjustments | ✅ Yes | High |
| Movement history | ✅ Yes | High |
| Low-stock notifications | ✅ Yes | High |
| Anti-overselling (atomic ops) | ✅ Yes | High |

### Order Management
| Feature | Our Platform | Priority |
|---|---|---|
| Searchable order list | ✅ Yes | High |
| Order status management | ✅ Full state machine | High |
| Internal notes | ✅ Yes | Medium |
| Invoice generation | ✅ Yes | High |
| Cancellation workflow | ✅ Yes | High |
| Refund workflow | ✅ Yes | High |
| Export reports | ✅ CSV | High |
| Tracking number entry | ✅ Yes | High |

### Wholesale CRM
| Feature | Our Platform | Priority |
|---|---|---|
| Enquiry capture form | ✅ Yes | High |
| Enquiry status tracking | ✅ Yes | High |
| Staff assignment | ✅ Yes | Medium |
| Internal notes | ✅ Yes | Medium |
| Quote preparation | ✅ Yes | High |
| Quote history | ✅ Yes | Medium |
| Email responses | ✅ Yes | Medium |
| Convert to draft order | ✅ Yes | Low |

---

## Integration Requirements

| Integration | Status | Notes |
|---|---|---|
| Razorpay Payment | ✅ Required | Test mode until production credentials provided |
| MongoDB Atlas | ✅ Required | Connection string from env |
| Email Provider (Resend/SendGrid) | ✅ Required | Transactional emails |
| Object Storage (S3/Cloudflare R2) | ✅ Required | Product images |
| Error Monitoring (Sentry) | ✅ Recommended | Structured logs |
| CDN (Vercel/Cloudflare) | ✅ Recommended | Image optimization |
| Shipping Provider API | 📋 Optional | Manual tracking number entry as fallback |
