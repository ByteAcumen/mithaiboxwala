import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { generateAndStoreOTP, checkOTPRateLimit } from '@/lib/auth/otp';
import { sendOTPEmail } from '@/lib/email';
import { SendOTPSchema } from '@/lib/validation/schemas';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  try {
    const body = await request.json();
    const parsed = SendOTPSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address', requestId },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check rate limit
    const rateLimit = await checkOTPRateLimit(email);
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.retryAfterMs ?? 900000) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
          retryAfterSeconds,
          requestId,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      );
    }

    await connectDB();

    // Generate OTP (hash stored, plain OTP sent via email only)
    const { otp, expiresAt } = await generateAndStoreOTP(email);

    // Send email
    await sendOTPEmail(email, otp);

    // Never include OTP in response (except dev mode for mock emails)
    const response: Record<string, unknown> = {
      success: true,
      message: 'Login code sent. Please check your email.',
      expiresAt: expiresAt.toISOString(),
      requestId,
    };

    if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAIL === 'true') {
      // Only for local dev with mock email — console-only, not in response
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('[API /auth/otp/send]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to send login code. Please try again.', requestId },
      { status: 500 }
    );
  }
}
