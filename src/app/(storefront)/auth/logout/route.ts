import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession, revokeCustomerSession, clearCustomerSessionCookie } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (session?.sessionId) {
      await revokeCustomerSession(session.sessionId);
    }
  } catch {
    /* best effort */
  }

  await clearCustomerSessionCookie();
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: NextRequest) {
  return GET(request);
}
