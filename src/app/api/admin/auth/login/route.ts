import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import { AdminUser } from '@/models';
import { AdminLoginSchema } from '@/lib/validation/schemas';
import { createAdminSession, setAdminSessionCookie } from '@/lib/auth/session';
import { consumePersistentRateLimit } from '@/lib/security/rate-limit';
import { getClientIp, isTrustedMutation } from '@/lib/security/request';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const ipAddress = getClientIp(request);
  const rateLimit = await consumePersistentRateLimit({
    namespace: 'admin-login',
    identifier: ipAddress,
    limit: parseInt(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX ?? '10'),
    windowMs: parseInt(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS ?? '900000'),
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = AdminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    await connectDB();
    const admin = await AdminUser.findOne({ email }).select('+passwordHash');
    if (!admin) {
      await bcrypt.compare(password, '$2b$10$invalidhashinvalidhashinvalidhash');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMinutes} minute(s).` },
        { status: 423 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatch) {
      const attempts = (admin.loginAttempts ?? 0) + 1;
      const update: Record<string, unknown> = { loginAttempts: attempts };
      if (attempts >= MAX_LOGIN_ATTEMPTS) update.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await AdminUser.updateOne({ _id: admin._id }, update);

      return NextResponse.json(
        { error: 'Invalid credentials', attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts), locked: attempts >= MAX_LOGIN_ATTEMPTS },
        { status: 401 }
      );
    }

    const sessionId = await createAdminSession(String(admin._id), {
      ipAddress,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });
    await AdminUser.updateOne(
      { _id: admin._id },
      { loginAttempts: 0, $unset: { lockedUntil: 1 }, lastLoginAt: new Date() }
    );
    await setAdminSessionCookie(sessionId);

    return NextResponse.json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}