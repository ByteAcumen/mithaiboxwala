import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { generateAndStoreOTP, checkOTPRateLimit } from '@/lib/auth/otp';
import { sendOTPEmail } from '@/lib/email';
import { SendOTPSchema } from '@/lib/validation/schemas';
import { nanoid } from 'nanoid';
import { consumePersistentRateLimit } from '@/lib/security/rate-limit';
import { getClientIp, isTrustedMutation } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  if (!isTrustedMutation(request)) {
    return NextResponse.json({ success: false, error: 'Invalid request origin', requestId }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = SendOTPSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address', requestId },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const ipAddress = getClientIp(request);
    const windowMs = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS ?? '900000');
    const limit = parseInt(process.env.OTP_RATE_LIMIT_MAX ?? '3');
    const rateLimit = await consumePersistentRateLimit({
      namespace: 'otp-send',
      identifier: `${email.toLowerCase()}:${ipAddress}`,
      limit,
      windowMs,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutes.`,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
          requestId,
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const emailRateLimit = await checkOTPRateLimit(email);
    if (!emailRateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((emailRateLimit.retryAfterMs ?? windowMs) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
          retryAfterSeconds,
          requestId,
        },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }

    await connectDB();
    const { otp, expiresAt } = await generateAndStoreOTP(email);
    await sendOTPEmail(email, otp);

    if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAIL === 'true') {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login code sent. Please check your email.',
        expiresAt: expiresAt.toISOString(),
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /auth/otp/send]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send login code. Please try again.', requestId },
      { status: 500 }
    );
  }
}