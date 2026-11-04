import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/connect';
import { Session, User, AdminUser } from '@/models';
import type { IUser, IAdminUser } from '@/models';

const CUSTOMER_SESSION_TTL = parseInt(process.env.CUSTOMER_SESSION_TTL_SECONDS ?? '2592000') * 1000;
const ADMIN_SESSION_TTL = parseInt(process.env.ADMIN_SESSION_TTL_SECONDS ?? '28800') * 1000;
const COOKIE_NAME = 'mb_session';
const ADMIN_COOKIE_NAME = 'mb_admin_session';

// ============================================================
// SESSION CREATION
// ============================================================

export async function createCustomerSession(
  userId: string,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  await connectDB();
  const sessionId = nanoid(64);
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_TTL);

  await Session.create({
    sessionId,
    userId,
    userType: 'customer',
    expiresAt,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    isRevoked: false,
  });

  return sessionId;
}

export async function createAdminSession(
  adminId: string,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  await connectDB();
  const sessionId = nanoid(64);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL);

  await Session.create({
    sessionId,
    userId: adminId,
    userType: 'admin',
    expiresAt,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    isRevoked: false,
  });

  return sessionId;
}

// ============================================================
// SESSION VALIDATION
// ============================================================

export async function getCustomerSession(): Promise<{
  sessionId: string;
  user: IUser;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    await connectDB();
    const session = await Session.findOne({
      sessionId: sessionCookie.value,
      userType: 'customer',
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) return null;

    const user = await User.findById(session.userId).lean();
    if (!user || !user.isActive) return null;

    return { sessionId: sessionCookie.value, user: user as unknown as IUser };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{
  sessionId: string;
  admin: IAdminUser;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    await connectDB();
    const session = await Session.findOne({
      sessionId: sessionCookie.value,
      userType: 'admin',
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) return null;

    const admin = await AdminUser.findById(session.userId).lean();
    if (!admin || !admin.isActive) return null;

    return { sessionId: sessionCookie.value, admin: admin as unknown as IAdminUser };
  } catch {
    return null;
  }
}

// ============================================================
// COOKIE MANAGEMENT
// ============================================================

export async function setCustomerSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(CUSTOMER_SESSION_TTL / 1000),
    path: '/',
  });
}

export async function setAdminSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(ADMIN_SESSION_TTL / 1000),
    path: '/admin',
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// ============================================================
// SESSION REVOCATION
// ============================================================

export async function revokeCustomerSession(sessionId: string): Promise<void> {
  await connectDB();
  await Session.updateOne({ sessionId }, { isRevoked: true });
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  await connectDB();
  await Session.updateOne({ sessionId }, { isRevoked: true });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await connectDB();
  await Session.updateMany({ userId, isRevoked: false }, { isRevoked: true });
}

// ============================================================
// REQUIRE AUTH HELPERS (for server components & route handlers)
// ============================================================

export async function requireCustomerAuth() {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireAdminAuth(requiredRoles?: string[]) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(session.admin.role)) {
      throw new Error('FORBIDDEN');
    }
  }
  return session;
}
