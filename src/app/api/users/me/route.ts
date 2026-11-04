import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { connectDB } from '@/lib/db/connect';
import { requireCustomerAuth } from '@/lib/auth/session';
import { User } from '@/models';
import { PhoneSchema } from '@/lib/validation/schemas';

// ============================================================
// GET /api/users/me — Return current user profile
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
    const user = await User.findById(session.user._id)
      .select('_id email name phone marketingConsent emailVerified createdAt lastLoginAt')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'User not found.', requestId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? null,
          phone: user.phone ?? null,
          marketingConsent: user.marketingConsent,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[GET /api/users/me] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/users/me — Update user profile
// ============================================================

const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: PhoneSchema.optional(),
  marketingConsent: z.boolean().optional(),
});

export async function PUT(request: NextRequest) {
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

    const parsed = UpdateProfileSchema.safeParse(body);
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

    const updates = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'no_changes', message: 'No fields to update.', requestId },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      session.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('_id email name phone marketingConsent emailVerified')
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'User not found.', requestId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedUser._id.toString(),
          email: updatedUser.email,
          name: updatedUser.name ?? null,
          phone: updatedUser.phone ?? null,
          marketingConsent: updatedUser.marketingConsent,
          emailVerified: updatedUser.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[PUT /api/users/me] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
