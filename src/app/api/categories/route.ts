import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { Category, Product } from '@/models';

// ============================================================
// GET /api/categories — List all active categories with product counts
// ============================================================
export async function GET(_request: NextRequest) {
  const requestId = nanoid(10);

  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Get product counts per category in one aggregation
    const productCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(
      productCounts.map((pc) => [pc._id.toString(), pc.count])
    );

    return NextResponse.json(
      {
        success: true,
        data: categories.map((cat) => ({
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? null,
          imageUrl: cat.imageUrl ?? null,
          parent: cat.parent?.toString() ?? null,
          sortOrder: cat.sortOrder,
          seoTitle: cat.seoTitle ?? null,
          seoDescription: cat.seoDescription ?? null,
          productCount: countMap.get(cat._id.toString()) ?? 0,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/categories] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
