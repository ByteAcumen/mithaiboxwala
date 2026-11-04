import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { Product, Inventory } from '@/models';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// ============================================================
// GET /api/products/[slug] — Get single product by slug
// ============================================================
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const requestId = nanoid(10);

  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { success: false, error: 'invalid_slug', message: 'Invalid product slug.', requestId },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate('category', 'name slug description imageUrl')
      .populate('subcategory', 'name slug')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Product not found.', requestId },
        { status: 404 }
      );
    }

    // Fetch inventory availability
    const inventory = await Inventory.findOne({
      product: product._id,
      variant: null,
    }).lean();

    let availability: {
      trackInventory: boolean;
      quantityAvailable: number | null;
      allowBackorder: boolean;
      lowStockThreshold: number;
      isLowStock: boolean;
      inStock: boolean;
    };

    if (inventory) {
      const quantityAvailable = Math.max(
        0,
        inventory.quantityOnHand - inventory.quantityReserved
      );
      const isLowStock =
        inventory.trackInventory &&
        quantityAvailable > 0 &&
        quantityAvailable <= inventory.lowStockThreshold;
      const inStock = !inventory.trackInventory || inventory.allowBackorder || quantityAvailable > 0;

      availability = {
        trackInventory: inventory.trackInventory,
        quantityAvailable: inventory.trackInventory ? quantityAvailable : null,
        allowBackorder: inventory.allowBackorder,
        lowStockThreshold: inventory.lowStockThreshold,
        isLowStock,
        inStock,
      };
    } else {
      // No inventory record — treat as always in stock (untracked)
      availability = {
        trackInventory: false,
        quantityAvailable: null,
        allowBackorder: false,
        lowStockThreshold: 0,
        isLowStock: false,
        inStock: true,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description ?? null,
          shortDescription: product.shortDescription ?? null,
          images: product.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder,
          })),
          basePrice: product.basePrice,
          salePrice: product.salePrice ?? null,
          moq: product.moq,
          unit: product.unit,
          bulkPricingTiers: product.bulkPricingTiers,
          dimensions: product.dimensions ?? null,
          weight: product.weight ?? null,
          materials: product.materials ?? [],
          colors: product.colors ?? [],
          compartments: product.compartments ?? null,
          style: product.style ?? null,
          isFeatured: product.isFeatured,
          isCustomizable: product.isCustomizable,
          hasVariants: product.hasVariants,
          videoUrl: product.videoUrl ?? null,
          seoTitle: product.seoTitle ?? null,
          seoDescription: product.seoDescription ?? null,
          tags: product.tags ?? [],
          totalSold: product.totalSold,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: product.category ? { id: (product.category as any)._id?.toString(), name: (product.category as any).name, slug: (product.category as any).slug } : null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          subcategory: product.subcategory ? { id: (product.subcategory as any)._id?.toString(), name: (product.subcategory as any).name, slug: (product.subcategory as any).slug } : null,
          availability,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/products/[slug]] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
