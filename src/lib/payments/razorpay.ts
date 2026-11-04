/**
 * Razorpay Payment Service
 * All server-side payment operations go through this module.
 * API secrets are NEVER exposed to the client.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Validate required env vars at module load time (server-only)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  // Don't throw at module load — allow builds and tests to proceed
  console.warn('[Razorpay] API credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
}

function getRazorpayClient(): Razorpay {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay API credentials are not configured. Check your environment variables.');
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}

export interface RazorpayOrderParams {
  amount: number; // in paise (INR * 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

/**
 * Create a Razorpay order server-side.
 * Amount must be in paise (multiply INR by 100).
 */
export async function createRazorpayOrder(
  params: RazorpayOrderParams
): Promise<RazorpayOrderResult> {
  const client = getRazorpayClient();

  const order = await client.orders.create({
    amount: params.amount,
    currency: params.currency ?? 'INR',
    receipt: params.receipt,
    notes: params.notes,
  });

  return {
    id: order.id,
    amount: typeof order.amount === 'string' ? parseInt(order.amount) : order.amount,
    currency: order.currency,
    status: order.status,
    receipt: order.receipt ?? params.receipt,
  };
}

/**
 * Verify a Razorpay payment signature server-side.
 * This is the critical security check — never skip this.
 *
 * @param razorpayOrderId - from Razorpay order creation
 * @param razorpayPaymentId - from client callback
 * @param razorpaySignature - from client callback
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(razorpaySignature, 'hex')
  );
}

/**
 * Verify a Razorpay webhook signature.
 * Call this before processing any webhook event.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Fetch a Razorpay payment by ID (for reconciliation).
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const client = getRazorpayClient();
  return client.payments.fetch(paymentId);
}

/**
 * Initiate a Razorpay refund server-side.
 */
export async function createRazorpayRefund(
  paymentId: string,
  amount?: number, // in paise; omit for full refund
  notes?: Record<string, string>
) {
  const client = getRazorpayClient();
  const params: { amount?: number; notes?: Record<string, string> } = {};
  if (amount) params.amount = amount;
  if (notes) params.notes = notes;

  return client.payments.refund(paymentId, params);
}

// ============================================================
// MOCK PAYMENT ADAPTER (development only)
// ============================================================

export function getMockPaymentResult(razorpayOrderId: string): {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
} {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Mock payment adapter cannot be used in production');
  }
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error('Cannot generate mock signature without Razorpay key secret');
  }

  const mockPaymentId = `pay_mock_${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${mockPaymentId}`)
    .digest('hex');

  return {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: signature,
  };
}
