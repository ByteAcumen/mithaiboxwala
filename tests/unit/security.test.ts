import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

function testVerifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpaySignature, 'hex')
    );
  } catch {
    return false;
  }
}

describe('Payment Security & Webhook Signatures', () => {
  const testSecret = 'rzp_test_secret_key_12345';
  const orderId = 'order_DA98123XYZ';
  const paymentId = 'pay_FA12345678';

  it('successfully validates authentic HMAC signatures', () => {
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = testVerifyPaymentSignature(orderId, paymentId, validSignature, testSecret);
    expect(result).toBe(true);
  });

  it('rejects tampered or forged signatures', () => {
    const forgedSignature = crypto
      .createHmac('sha256', 'wrong_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = testVerifyPaymentSignature(orderId, paymentId, forgedSignature, testSecret);
    expect(result).toBe(false);
  });

  it('rejects malformed signatures without crashing', () => {
    const result = testVerifyPaymentSignature(orderId, paymentId, 'invalid_hex', testSecret);
    expect(result).toBe(false);
  });
});
