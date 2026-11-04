import type { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  return ipAddress?.slice(0, 64) || 'unknown';
}

export function isTrustedMutation(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const allowedOrigins = [request.nextUrl.origin, process.env.NEXT_PUBLIC_APP_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return value;
      }
    });

  return allowedOrigins.includes(origin);
}