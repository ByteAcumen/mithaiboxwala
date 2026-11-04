import { NextResponse } from 'next/server';
import {
  getAdminSession,
  revokeAdminSession,
  clearAdminSessionCookie,
} from '@/lib/auth/session';

export async function POST() {
  try {
    const session = await getAdminSession();

    if (session) {
      await revokeAdminSession(session.sessionId);
    }

    await clearAdminSessionCookie();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Logout] Error:', err);
    // Even on error, clear the cookie
    await clearAdminSessionCookie().catch(() => {});
    return NextResponse.json({ success: true });
  }
}
