import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Product, Inventory, AuditLog } from '@/models';
import { CreateProductSchema } from '@/lib/validation/schemas';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const [product, inventory] = await Promise.all([
      Product.findById(id).populate('category', 'name slug').lean(),
      Inventory.findOne({ product: id }).lean(),
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product, inventory });
  } catch (err) {
    console.error('[Admin Product GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  let session: Awaited<ReturnType<typeof requireAdminAuth>>;
  try {
    session = await requireAdminAuth(['super_admin', 'catalog_manager']);
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

  const parsed = CreateProductSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    await connectDB();

    const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminId: String(session.admin._id),
      adminEmail: session.admin.email,
      action: 'product.update',
      resourceType: 'Product',
      resourceId: id,
      changes: parsed.data,
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error('[Admin Product PUT] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  let session: Awaited<ReturnType<typeof requireAdminAuth>>;
  try {
    session = await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminId: String(session.admin._id),
      adminEmail: session.admin.email,
      action: 'product.archive',
      resourceType: 'Product',
      resourceId: id,
      changes: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Product archived' });
  } catch (err) {
    console.error('[Admin Product DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
