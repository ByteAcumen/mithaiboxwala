import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Product } from '@/models';
import path from 'path';
import fs from 'fs/promises';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpeg, png, webp' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    const altText = formData.get('altText') as string | null;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.type.split('/')[1];
    const filename = `${id}-${Date.now()}.${ext}`;

    if (process.env.NODE_ENV === 'production') {
      // TODO: upload to cloud storage (e.g. AWS S3 / Cloudflare R2)
      // For now fall through to local storage
      return NextResponse.json({ error: 'Storage service not configured for production' }, { status: 501 });
    }

    // Dev: save to public/uploads/products/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/products/${filename}`;
    const storageKey = `products/${filename}`;

    product.images.push({
      url: imageUrl,
      altText: altText ?? '',
      sortOrder: product.images.length,
      storageKey,
    });

    await product.save();

    return NextResponse.json({ success: true, image: { url: imageUrl, storageKey, altText } }, { status: 201 });
  } catch (err) {
    console.error('[Admin Product Images POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['super_admin', 'catalog_manager']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  let body: { storageKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.storageKey) {
    return NextResponse.json({ error: 'storageKey is required' }, { status: 400 });
  }

  try {
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imgIndex = product.images.findIndex((img) => img.storageKey === body.storageKey);
    if (imgIndex === -1) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete file from local storage in dev
    if (process.env.NODE_ENV !== 'production') {
      try {
        const filePath = path.join(process.cwd(), 'public', body.storageKey);
        await fs.unlink(filePath);
      } catch {
        // Ignore if file doesn't exist on disk
      }
    }

    product.images.splice(imgIndex, 1);
    await product.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Product Images DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
