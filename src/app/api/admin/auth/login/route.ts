import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import { AdminUser } from '@/models';
import { AdminLoginSchema } from '@/lib/validation/schemas';
import {
  createAdminSession,
  setAdminSessionCookie,
} from '@/lib/auth/session';
import { rateLimit } from '@/lib/rate-limit';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per 15 min per IP
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = rateLimit(`admin-login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = AdminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    await connectDB();

    // Fetch admin with passwordHash (select: false field)
    const admin = await AdminUser.findOne({ email }).select('+passwordHash');
    if (!admin) {
      // Timing-safe: do a dummy compare to prevent email enumeration
      await bcrypt.compare(password, '$2b$10$invalidhashinvalidhashinvalidhash');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if account is locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMs = admin.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainingMin} minute(s).` },
        { status: 423 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: 'Account is disabled.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      const newAttempts = (admin.loginAttempts ?? 0) + 1;
      const updateData: Record<string, unknown> = { loginAttempts: newAttempts };

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }

      await AdminUser.updateOne({ _id: admin._id }, updateData);

      const attemptsLeft = Math.max(0, MAX_LOGIN_ATTEMPTS - newAttempts);
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          attemptsLeft,
          locked: newAttempts >= MAX_LOGIN_ATTEMPTS,
        },
        { status: 401 }
      );
    }

    // Successful login
    const sessionId = await createAdminSession(String(admin._id), {
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    // Reset login attempts
    await AdminUser.updateOne(
      { _id: admin._id },
      { loginAttempts: 0, $unset: { lockedUntil: 1 }, lastLoginAt: new Date() }
    );

    await setAdminSessionCookie(sessionId);

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('[Admin Login] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
