import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { requireCustomerAuth } from '@/lib/auth/session';
import { Address } from '@/models';
import { AddressSchema } from '@/lib/validation/schemas';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================================
// PUT /api/addresses/[id] — Update an address (verify ownership)
// ============================================================
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const requestId = nanoid(10);

  try {
    const session = await requireCustomerAuth().catch(() => null);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'Authentication required.', requestId },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'Invalid address ID.', requestId },
        { status: 400 }
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

    // Ownership check — both _id AND user must match
    const existing = await Address.findOne({ _id: id, user: userId });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Address not found.', requestId },
        { status: 404 }
      );
    }

    // If setting as default, clear all other defaults for this user first
    if (parsed.data.isDefault) {
      await Address.updateMany(
        { user: userId, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    const updated = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Address not found.', requestId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updated._id.toString(),
          label: updated.label ?? null,
          fullName: updated.fullName,
          phone: updated.phone,
          addressLine1: updated.addressLine1,
          addressLine2: updated.addressLine2 ?? null,
          city: updated.city,
          state: updated.state,
          pincode: updated.pincode,
          country: updated.country,
          isDefault: updated.isDefault,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[PUT /api/addresses/[id]] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/addresses/[id] — Delete an address (verify ownership)
// ============================================================
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const requestId = nanoid(10);

  try {
    const session = await requireCustomerAuth().catch(() => null);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'Authentication required.', requestId },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'invalid_id', message: 'Invalid address ID.', requestId },
        { status: 400 }
      );
    }

    await connectDB();
    const userId = session.user._id as mongoose.Types.ObjectId;

    // Ownership check — only delete if user owns the address
    const result = await Address.findOneAndDelete({ _id: id, user: userId });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Address not found.', requestId },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[DELETE /api/addresses/[id]] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
