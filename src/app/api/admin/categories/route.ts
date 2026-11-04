import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { connectDB } from '@/lib/db/connect';
import { Category } from '@/models';
import mongoose from 'mongoose';

export async function GET(_req: NextRequest) {
  try {
    await requireAdminAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();

    // Build tree
    const map = new Map<string, typeof categories[0] & { children: unknown[] }>();
    const roots: (typeof categories[0] & { children: unknown[] })[] = [];

    for (const cat of categories) {
      map.set(String(cat._id), { ...cat, children: [] });
    }

    for (const cat of categories) {
      const node = map.get(String(cat._id))!;
      if (cat.parent) {
        const parent = map.get(String(cat.parent));
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return NextResponse.json({ categories: roots });
  } catch (err) {
    console.error('[Admin Categories GET] Error:', err);
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

  void session;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = body as {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    parent?: string;
    sortOrder?: number;
    isActive?: boolean;
    seoTitle?: string;
    seoDescription?: string;
  };

  if (!data.name || !data.slug) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
  }

  try {
    await connectDB();

    const category = await Category.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      parent: data.parent ? new mongoose.Types.ObjectId(data.parent) : undefined,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      return NextResponse.json({ error: 'A category with that slug already exists' }, { status: 409 });
    }
    console.error('[Admin Categories POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
