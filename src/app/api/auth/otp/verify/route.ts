import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { verifyOTP } from '@/lib/auth/otp';
import { createCustomerSession, setCustomerSessionCookie } from '@/lib/auth/session';
import { VerifyOTPSchema } from '@/lib/validation/schemas';
import { User } from '@/models';
import { consumePersistentRateLimit } from '@/lib/security/rate-limit';
import { getClientIp, isTrustedMutation } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  if (!isTrustedMutation(request)) {
    return NextResponse.json({ success: false, error: 'Invalid request origin', requestId }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = VerifyOTPSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors, requestId },
        { status: 422 }
      );
    }

    const { email, otp, name, phone, company } = parsed.data;
    const rateLimit = await consumePersistentRateLimit({
      namespace: 'otp-verify',
      identifier: `${email.toLowerCase()}:${getClientIp(request)}`,
      limit: parseInt(process.env.OTP_VERIFY_RATE_LIMIT_MAX ?? '10'),
      windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS ?? '900000'),
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please request a new code.', requestId },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    await connectDB();
    const result = await verifyOTP(email, otp, { name, phone, company });
    if (!result.success) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        expired: 410,
        invalid: 400,
        max_attempts: 429,
        already_used: 409,
      };
      const messageMap: Record<string, string> = {
        not_found: 'No OTP request found for this email. Please request a new code.',
        expired: 'This OTP has expired. Please request a new code.',
        invalid: 'Invalid OTP. Please check and try again.',
        max_attempts: 'Maximum attempts reached. Please request a new code.',
        already_used: 'This OTP has already been used. Please request a new code.',
      };
      const error = result.error ?? 'invalid';
      return NextResponse.json(
        { success: false, error, message: messageMap[error], requestId },
        { status: statusMap[error] ?? 400 }
      );
    }

    const sessionId = await createCustomerSession(result.userId!, {
      ipAddress: getClientIp(request),
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    await setCustomerSessionCookie(sessionId);

    const user = await User.findById(result.userId).select('_id email name').lean();
    return NextResponse.json({
      success: true,
      isNewUser: result.isNewUser,
      user: {
        id: user?._id?.toString() ?? result.userId,
        email: user?.email ?? email,
        name: user?.name ?? null,
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/otp/verify] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An unexpected error occurred.', requestId },
      { status: 500 }
    );
  }
}