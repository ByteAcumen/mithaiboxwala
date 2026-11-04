import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Product, Category, AuditLog } from '@/models';
import { CreateProductSchema } from '@/lib/validation/schemas';

export async function GET(req: NextRequest) {
  let session: Awaited<ReturnType<typeof requireAdminAuth>>;
  try {
    session = await requireAdminAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  void session;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '24')));
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const status = searchParams.get('status') ?? ''; // 'active' | 'inactive'
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (status === 'active') filter.isActive = true;
    else if (status === 'inactive') filter.isActive = false;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[Admin Products GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let session: Awaited<ReturnType<typeof requireAdminAuth>>;
  try {
    session = await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    await connectDB();

    // Verify category exists
    const cat = await Category.findById(parsed.data.category);
    if (!cat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const product = await Product.create(parsed.data);

    // Audit log
    await AuditLog.create({
      adminId: String(session.admin._id),
      adminEmail: session.admin.email,
      action: 'product.create',
      resourceType: 'Product',
      resourceId: String(product._id),
      changes: { name: product.name, sku: product.sku },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      return NextResponse.json({ error: 'A product with that SKU or slug already exists' }, { status: 409 });
    }
    console.error('[Admin Products POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
