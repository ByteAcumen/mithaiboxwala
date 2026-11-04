import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Wishlist, Product } from '@/models';
import { requireCustomerAuth } from '@/lib/auth/session';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await requireCustomerAuth();
    await connectDB();

    let wishlist = await Wishlist.findOne({ user: session.user._id }).populate({
      path: 'products',
      select: 'name slug sku basePrice salePrice images moq isActive',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: session.user._id, products: [] });
    }

    return NextResponse.json({ success: true, data: wishlist.products });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireCustomerAuth();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user._id },
      { $addToSet: { products: new mongoose.Types.ObjectId(productId) } },
      { upsert: true, new: true }
    ).populate({
      path: 'products',
      select: 'name slug sku basePrice salePrice images moq isActive',
    });

    return NextResponse.json({ success: true, data: wishlist.products });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireCustomerAuth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await connectDB();
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: session.user._id },
      { $pull: { products: new mongoose.Types.ObjectId(productId) } },
      { new: true }
    ).populate({
      path: 'products',
      select: 'name slug sku basePrice salePrice images moq isActive',
    });

    return NextResponse.json({ success: true, data: wishlist?.products || [] });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
