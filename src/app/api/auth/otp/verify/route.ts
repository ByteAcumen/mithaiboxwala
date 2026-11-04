import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { verifyOTP } from '@/lib/auth/otp';
import { createCustomerSession, setCustomerSessionCookie } from '@/lib/auth/session';
import { VerifyOTPSchema } from '@/lib/validation/schemas';
import { User } from '@/models';

export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body', requestId },
        { status: 400 }
      );
    }

    const parsed = VerifyOTPSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
          requestId,
        },
        { status: 422 }
      );
    }

    const { email, otp, name, phone } = parsed.data;

    await connectDB();
    const result = await verifyOTP(email, otp, { name, phone });

    if (!result.success) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        expired: 410,
        invalid: 400,
        max_attempts: 429,
        already_used: 409,
      };
      const status = result.error ? (statusMap[result.error] ?? 400) : 400;

      const messageMap: Record<string, string> = {
        not_found: 'No OTP request found for this email. Please request a new code.',
        expired: 'This OTP has expired. Please request a new code.',
        invalid: 'Invalid OTP. Please check and try again.',
        max_attempts: 'Maximum attempts reached. Please request a new OTP.',
        already_used: 'This OTP has already been used. Please request a new code.',
      };

      return NextResponse.json(
        {
          success: false,
          error: result.error ?? 'verification_failed',
          message: result.error ? messageMap[result.error] : 'OTP verification failed.',
          requestId,
        },
        { status }
      );
    }

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;

    const sessionId = await createCustomerSession(result.userId!, { ipAddress, userAgent });
    await setCustomerSessionCookie(sessionId);

    // Fetch user profile for response
    const user = await User.findById(result.userId).select('_id email name').lean();

    return NextResponse.json(
      {
        success: true,
        isNewUser: result.isNewUser,
        user: {
          id: user?._id?.toString() ?? result.userId,
          email: user?.email ?? email,
          name: user?.name ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/auth/otp/verify] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}
