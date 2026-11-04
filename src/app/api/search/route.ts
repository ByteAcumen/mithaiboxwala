import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { Product } from '@/models';

const MAX_SUGGESTIONS = 8;

// ============================================================
// GET /api/search?q=query&limit=8 — Search suggestions
// ============================================================
export async function GET(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const limitParam = Math.min(parseInt(searchParams.get('limit') ?? '8', 10), MAX_SUGGESTIONS);
    const limit = isNaN(limitParam) ? MAX_SUGGESTIONS : limitParam;

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: true, data: { suggestions: [] } },
        { status: 200 }
      );
    }

    if (q.length > 200) {
      return NextResponse.json(
        { success: false, error: 'query_too_long', message: 'Search query is too long.', requestId },
        { status: 400 }
      );
    }

    await connectDB();

    const products = await Product.find(
      {
        $text: { $search: q },
        isActive: true,
      },
      { score: { $meta: 'textScore' } }
    )
      .select('name slug images basePrice salePrice')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          suggestions: products.map((p) => ({
            name: p.name,
            slug: p.slug,
            imageUrl: p.images?.[0]?.url ?? null,
            price: p.salePrice ?? p.basePrice,
          })),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/search] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
