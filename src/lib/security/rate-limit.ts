import { createHash } from 'crypto';
import { connectDB } from '@/lib/db/connect';
import { RateLimitBucket } from '@/models';

interface PersistentRateLimitOptions {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
}

export async function consumePersistentRateLimit({
  namespace,
  identifier,
  limit,
  windowMs,
}: PersistentRateLimitOptions): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const fingerprint = createHash('sha256')
    .update(`${namespace}:${identifier}:${windowStart}`)
    .digest('hex');

  await connectDB();
  const bucket = await RateLimitBucket.findOneAndUpdate(
    { fingerprint },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}