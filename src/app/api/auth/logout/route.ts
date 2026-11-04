import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getCustomerSession, revokeCustomerSession, clearCustomerSessionCookie } from '@/lib/auth/session';
import { isTrustedMutation } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  const requestId = nanoid(10);

  if (!isTrustedMutation(request)) {
    return NextResponse.json({ success: false, error: 'Invalid request origin', requestId }, { status: 403 });
  }

  try {
    const session = await getCustomerSession();
    if (session?.sessionId) await revokeCustomerSession(session.sessionId);
    await clearCustomerSessionCookie();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[POST /api/auth/logout] Unexpected error:', error);
    try {
      await clearCustomerSessionCookie();
    } catch {
      // Best-effort cookie cleanup.
    }
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'Logout failed.', requestId },
      { status: 500 }
    );
  }
}