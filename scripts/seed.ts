import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithaiboxes';

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    imageUrl: String,
    sortOrder: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    sku: { type: String, unique: true },
    description: String,
    shortDescription: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [{ url: String, altText: String, sortOrder: Number }],
    basePrice: Number,
    salePrice: Number,
    moq: Number,
    unit: String,
    bulkPricingTiers: [{ minQty: Number, maxQty: Number, pricePerUnit: Number }],
    dimensions: { length: Number, width: Number, height: Number, unit: String },
    materials: [String],
    colors: [String],
    compartments: Number,
    isActive: Boolean,
    isFeatured: Boolean,
    isCustomizable: Boolean,
    totalSold: Number,
  },
  { timestamps: true }
);

const InventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantityOnHand: Number,
    quantityReserved: Number,
    lowStockThreshold: Number,
    trackInventory: Boolean,
  },
  { timestamps: true }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    type: String,
    value: Number,
    minOrderAmount: Number,
    isActive: Boolean,
    usedCount: Number,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

const INITIAL_CATEGORIES = [
  { name: 'Mithai Boxes', slug: 'mithai-boxes', description: 'Traditional and contemporary rigid and folding sweet boxes', sortOrder: 1 },
  { name: 'Dry Fruit Boxes', slug: 'dry-fruit-boxes', description: 'Multi-compartment luxury dry-fruit gift boxes and golden trays', sortOrder: 2 },
  { name: 'Chocolate Boxes', slug: 'chocolate-boxes', description: 'Artisanal confectionery and praline packaging', sortOrder: 3 },
  { name: 'Sweet Boxes', slug: 'sweet-boxes', description: 'Standard high-volume retail sweet packaging', sortOrder: 4 },
  { name: 'Cake Boxes', slug: 'cake-boxes', description: 'Heavy-duty pastry and bakery packaging', sortOrder: 5 },
  { name: 'Gift Hampers', slug: 'gift-hampers', description: 'Grand festive celebration hampers and gourmet baskets', sortOrder: 6 },
  { name: 'Wedding Boxes', slug: 'wedding-boxes', description: 'Royal Indian wedding card and sweet presentation boxes', sortOrder: 7 },
  { name: 'Folding Boxes', slug: 'folding-boxes', description: 'Compact flat-pack high-volume folding boxes', sortOrder: 8 },
  { name: 'Basket & Gourmet', slug: 'basket-gourmet', description: 'Premium decorative wicker and kappa basket packaging', sortOrder: 9 },
  { name: 'Corporate Gifting', slug: 'corporate-gifting', description: 'B2B executive gift boxes with logo branding', sortOrder: 10 },
  { name: 'Customized Packaging', slug: 'customized-packaging', description: 'Tailor-made die-cut box dimensions and hot foil finishes', sortOrder: 11 },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log('[Seed] Clearing existing demo catalog data...');
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Inventory.deleteMany({});
  await Coupon.deleteMany({});

  console.log('[Seed] Creating categories...');
  const createdCats: Record<string, any> = {};
  for (const c of INITIAL_CATEGORIES) {
    const cat = await Category.create({ ...c, isActive: true });
    createdCats[c.slug] = cat;
  }

  console.log('[Seed] Creating products and inventory...');
  const sampleProducts = [
    {
      name: 'Royal Heritage 12-Cavity Gold Mithai Box',
      slug: 'royal-heritage-12-cavity-gold-mithai-box',
      sku: 'MB-MTH-001',
      category: createdCats['mithai-boxes']._id,
      shortDescription: 'Luxury kappa rigid box with 12 gold-foiled cavities for premium Indian sweets.',
      description: 'Manufactured by Ajay Packers using 1200 GSM virgin board and finished with metallic gold hot-stamped patterns. Includes food-safe grease-resistant barrier liners.',
      basePrice: 85,
      salePrice: 78,
      moq: 50,
      unit: 'piece',
      bulkPricingTiers: [
        { minQty: 100, pricePerUnit: 74 },
        { minQty: 500, pricePerUnit: 68 },
        { minQty: 1000, pricePerUnit: 62 },
      ],
      dimensions: { length: 24, width: 18, height: 5, unit: 'cm' },
      materials: ['Kappa Board 1200 GSM', 'Gold Foil', 'Food Grade Liner'],
      colors: ['Deep Burgundy', 'Antique Gold'],
      compartments: 12,
      isActive: true,
      isFeatured: true,
      isCustomizable: true,
      totalSold: 1250,
    },
    {
      name: 'Diwali Shubh 4-Partition Dry Fruit Box',
      slug: 'diwali-shubh-4-partition-dry-fruit-box',
      sku: 'MB-DFB-002',
      category: createdCats['dry-fruit-boxes']._id,
      shortDescription: '4-compartment golden festive box designed for cashews, almonds, raisins, and pistachios.',
      description: 'Sturdy gift box with clear top view and golden embossed lid. Ideal for Diwali, Raksha Bandhan, and New Year gifting.',
      basePrice: 65,
      salePrice: 58,
      moq: 50,
      unit: 'piece',
      bulkPricingTiers: [
        { minQty: 100, pricePerUnit: 54 },
        { minQty: 500, pricePerUnit: 49 },
      ],
      dimensions: { length: 20, width: 20, height: 4.5, unit: 'cm' },
      materials: ['Virgin Paperboard', 'PET Window', 'Golden Partitions'],
      colors: ['Crimson Red', 'Gold'],
      compartments: 4,
      isActive: true,
      isFeatured: true,
      isCustomizable: true,
      totalSold: 2100,
    },
    {
      name: 'Elegance 16-Piece Praline & Chocolate Box',
      slug: 'elegance-16-piece-chocolate-box',
      sku: 'MB-CHO-003',
      category: createdCats['chocolate-boxes']._id,
      shortDescription: 'Contemporary chocolate box with precision cavities and magnetic closure.',
      description: 'Book-style opening box finished with matte lamination and gold foil accents. Engineered to protect artisanal chocolates from humidity.',
      basePrice: 95,
      moq: 50,
      unit: 'piece',
      bulkPricingTiers: [
        { minQty: 100, pricePerUnit: 88 },
        { minQty: 500, pricePerUnit: 80 },
      ],
      dimensions: { length: 18, width: 18, height: 3.5, unit: 'cm' },
      materials: ['Rigid Kappa Board', 'Velvet Touch Matte Paper'],
      colors: ['Charcoal Black', 'Warm Ivory'],
      compartments: 16,
      isActive: true,
      isFeatured: true,
      isCustomizable: true,
      totalSold: 840,
    },
    {
      name: 'Royal Wedding Celebration Hamper Box',
      slug: 'royal-wedding-celebration-hamper-box',
      sku: 'MB-WED-004',
      category: createdCats['wedding-boxes']._id,
      shortDescription: 'Grand keepsake gift hamper with brass-finish latch and velvet lining.',
      description: 'A lavish packaging masterwork by Ajay Packers designed for wedding invitations, premium dry fruits, and bridal sweet gifting.',
      basePrice: 240,
      salePrice: 210,
      moq: 25,
      unit: 'piece',
      bulkPricingTiers: [
        { minQty: 100, pricePerUnit: 195 },
        { minQty: 500, pricePerUnit: 180 },
      ],
      dimensions: { length: 32, width: 24, height: 8, unit: 'cm' },
      materials: ['Hardboard', 'Silk Brocade Covering', 'Brass Metal Lock'],
      colors: ['Royal Burgundy', 'Ivory & Gold'],
      compartments: 6,
      isActive: true,
      isFeatured: true,
      isCustomizable: true,
      totalSold: 420,
    },
  ];

  for (const p of sampleProducts) {
    const prod = await Product.create(p);
    await Inventory.create({
      product: prod._id,
      quantityOnHand: 1500,
      quantityReserved: 50,
      lowStockThreshold: 100,
      trackInventory: true,
    });
  }

  console.log('[Seed] Creating welcome coupons...');
  await Coupon.create({
    code: 'FESTIVE10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 2000,
    isActive: true,
    usedCount: 14,
  });

  await Coupon.create({
    code: 'BULK500',
    type: 'fixed',
    value: 500,
    minOrderAmount: 5000,
    isActive: true,
    usedCount: 8,
  });

  console.log('[Seed] Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
