import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { requireCustomerAuth } from '@/lib/auth/session';
import { Address } from '@/models';
import { AddressSchema } from '@/lib/validation/schemas';
import mongoose from 'mongoose';

// ============================================================
// GET /api/addresses — List user's saved addresses
// ============================================================
export async function GET(_request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const session = await requireCustomerAuth().catch(() => null);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'Authentication required.', requestId },
        { status: 401 }
      );
    }

    await connectDB();
    const addresses = await Address.find({ user: session.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: addresses.map((addr) => ({
          id: addr._id.toString(),
          label: addr.label ?? null,
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 ?? null,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/addresses] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/addresses — Create a new address
// ============================================================
export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const session = await requireCustomerAuth().catch(() => null);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'Authentication required.', requestId },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'invalid_body', message: 'Invalid JSON body.', requestId },
        { status: 400 }
      );
    }

    const parsed = AddressSchema.safeParse(body);
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

    await connectDB();
    const userId = session.user._id as mongoose.Types.ObjectId;

    // If this address is being set as default, unset all other defaults
    if (parsed.data.isDefault) {
      await Address.updateMany({ user: userId }, { $set: { isDefault: false } });
    }

    // Enforce max addresses per user (e.g., 10)
    const count = await Address.countDocuments({ user: userId });
    if (count >= 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'limit_reached',
          message: 'You can save a maximum of 10 addresses. Please delete an existing address first.',
          requestId,
        },
        { status: 409 }
      );
    }

    const address = await Address.create({
      user: userId,
      ...parsed.data,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: address._id.toString(),
          label: address.label ?? null,
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
          isDefault: address.isDefault,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/addresses] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
