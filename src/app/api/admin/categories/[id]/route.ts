import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Category, Product } from '@/models';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await connectDB();

    const category = await Category.findByIdAndUpdate(id, body as object, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (err) {
    console.error('[Admin Category PUT] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    // Check no active products in this category
    const activeProductsCount = await Product.countDocuments({ category: id, isActive: true });
    if (activeProductsCount > 0) {
      return NextResponse.json(
        { error: `Cannot archive: ${activeProductsCount} active product(s) are in this category` },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean();
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category archived' });
  } catch (err) {
    console.error('[Admin Category DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
