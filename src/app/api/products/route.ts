import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { Product } from '@/models';
import { ProductFiltersSchema } from '@/lib/validation/schemas';

// ============================================================
// GET /api/products — List products with filtering/sorting/pagination
// ============================================================
export async function GET(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const { searchParams } = new URL(request.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const parsed = ProductFiltersSchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'validation_failed',
          details: parsed.error.flatten().fieldErrors,
          requestId,
        },
        { status: 422 }
      );
    }

    const {
      category,
      minPrice,
      maxPrice,
      colors,
      materials,
      inStock,
      featured,
      search,
      sort,
      page,
      limit,
    } = parsed.data;

    await connectDB();

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (category) {
      // Support filtering by category slug — join via Category model
      const { Category } = await import('@/models');
      const cat = await Category.findOne({ slug: category, isActive: true }).select('_id').lean();
      if (cat) {
        filter.category = cat._id;
      } else {
        // Category slug not found — return empty
        return NextResponse.json(
          { success: true, data: { items: [], total: 0, page, totalPages: 0 } },
          { status: 200 }
        );
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
    }

    if (colors && colors.length > 0) {
      filter.colors = { $in: colors };
    }

    if (materials && materials.length > 0) {
      filter.materials = { $in: materials };
    }

    if (featured !== undefined) {
      filter.isFeatured = featured;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOption: Record<string, any> = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { basePrice: 1 };
        break;
      case 'price_desc':
        sortOption = { basePrice: -1 };
        break;
      case 'popular':
        sortOption = { totalSold: -1 };
        break;
      case 'relevance':
        if (search) sortOption = { score: { $meta: 'textScore' } };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const selectFields =
      'name slug sku shortDescription images basePrice salePrice moq unit bulkPricingTiers category isFeatured isCustomizable totalSold createdAt';

    const [items, total] = await Promise.all([
      Product.find(filter)
        .select(selectFields)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: items.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            shortDescription: p.shortDescription ?? null,
            imageUrl: p.images?.[0]?.url ?? null,
            images: p.images?.map((img) => ({ url: img.url, altText: img.altText ?? null })) ?? [],
            basePrice: p.basePrice,
            salePrice: p.salePrice ?? null,
            moq: p.moq,
            unit: p.unit,
            bulkPricingTiers: p.bulkPricingTiers ?? [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            category: p.category ? { id: (p.category as any)._id?.toString(), name: (p.category as any).name, slug: (p.category as any).slug } : null,
            isFeatured: p.isFeatured,
            isCustomizable: p.isCustomizable,
            totalSold: p.totalSold,
          })),
          total,
          page,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/products] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
