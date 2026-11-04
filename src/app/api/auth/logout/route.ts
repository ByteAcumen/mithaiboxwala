import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getCustomerSession, revokeCustomerSession, clearCustomerSessionCookie } from '@/lib/auth/session';

export async function POST(_request: NextRequest) {
  const requestId = nanoid(10);

  try {
    // Attempt to get and revoke the current session
    const session = await getCustomerSession();

    if (session?.sessionId) {
      await revokeCustomerSession(session.sessionId);
    }

    // Always clear the cookie regardless of session validity
    await clearCustomerSessionCookie();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/auth/logout] Unexpected error:', err);
    // Still clear the cookie on error
    try {
      await clearCustomerSessionCookie();
    } catch {
      // best-effort
    }
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'Logout failed.', requestId },
      { status: 500 }
    );
  }
}
