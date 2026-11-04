import { connectDB } from '@/lib/db/connect';
import { OTPChallenge, User } from '@/models';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES ?? '10');
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5');

function generateOTP(): string {
  // Cryptographically secure 6-digit OTP
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const num = (new DataView(bytes.buffer).getUint32(0) % 900000) + 100000;
  return num.toString();
}

export interface OTPResult {
  success: boolean;
  error?: 'rate_limited' | 'invalid_email' | 'send_failed';
  // Only included in dev/test mode for mock email
  devOtp?: string;
}

export interface OTPVerifyResult {
  success: boolean;
  userId?: string;
  isNewUser?: boolean;
  error?: 'not_found' | 'expired' | 'invalid' | 'max_attempts' | 'already_used';
}

/**
 * Generate and store an OTP for the given email.
 * Returns the OTP value to be sent by the email service.
 * Never logs or returns OTP in production output.
 */
export async function generateAndStoreOTP(email: string): Promise<{
  otp: string;
  expiresAt: Date;
}> {
  await connectDB();

  // Invalidate any existing unused OTPs for this email
  await OTPChallenge.updateMany(
    { email: email.toLowerCase(), isUsed: false },
    { isUsed: true }
  );

  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await OTPChallenge.create({
    email: email.toLowerCase(),
    otpHash,
    expiresAt,
    attempts: 0,
    isUsed: false,
  });

  return { otp, expiresAt };
}

/**
 * Verify an OTP for a given email.
 * Returns userId and whether the account was just created.
 * Handles attempt tracking and invalidation.
 */
export async function verifyOTP(
  email: string,
  otp: string,
  profile?: { name?: string; phone?: string }
): Promise<OTPVerifyResult> {
  await connectDB();

  const normalizedEmail = email.toLowerCase().trim();

  const challenge = await OTPChallenge.findOne(
    {
      email: normalizedEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    },
    '+otpHash'
  ).sort({ createdAt: -1 });

  if (!challenge) {
    // Check if there's an expired or used one to give a better hint
    const expired = await OTPChallenge.findOne({
      email: normalizedEmail,
      isUsed: false,
    });
    return { success: false, error: expired ? 'expired' : 'not_found' };
  }

  // Check attempt limit
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await OTPChallenge.updateOne({ _id: challenge._id }, { isUsed: true });
    return { success: false, error: 'max_attempts' };
  }

  // Increment attempts
  await OTPChallenge.updateOne({ _id: challenge._id }, { $inc: { attempts: 1 } });

  // Verify OTP hash
  const isValid = await bcrypt.compare(otp, challenge.otpHash);
  if (!isValid) {
    const attemptsLeft = OTP_MAX_ATTEMPTS - (challenge.attempts + 1);
    if (attemptsLeft <= 0) {
      await OTPChallenge.updateOne({ _id: challenge._id }, { isUsed: true });
    }
    return { success: false, error: 'invalid' };
  }

  // Mark OTP as used
  await OTPChallenge.updateOne({ _id: challenge._id }, { isUsed: true });

  // Find or create user
  let user = await User.findOne({ email: normalizedEmail });
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      name: profile?.name?.trim() || undefined,
      phone: profile?.phone?.trim() || undefined,
      isActive: true,
      emailVerified: true,
    });
    isNewUser = true;
  } else {
    const updateObj: Record<string, unknown> = { emailVerified: true, lastLoginAt: new Date() };
    if (profile?.name?.trim() && !user.name) updateObj.name = profile.name.trim();
    if (profile?.phone?.trim() && !user.phone) updateObj.phone = profile.phone.trim();
    await User.updateOne({ _id: user._id }, updateObj);
  }

  return {
    success: true,
    userId: user._id.toString(),
    isNewUser,
  };
}

/**
 * Check if OTP rate limit applies.
 * Returns true if the user can request an OTP, false if rate limited.
 */
export async function checkOTPRateLimit(email: string): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
}> {
  await connectDB();

  const windowMs = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MS ?? '900000');
  const maxRequests = parseInt(process.env.OTP_RATE_LIMIT_MAX ?? '3');
  const since = new Date(Date.now() - windowMs);

  const recentCount = await OTPChallenge.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: since },
  });

  if (recentCount >= maxRequests) {
    // Find the oldest challenge in the window to calculate retry-after
    const oldest = await OTPChallenge.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: since },
    }).sort({ createdAt: 1 });

    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + windowMs - Date.now()
      : windowMs;

    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  return { allowed: true };
}
