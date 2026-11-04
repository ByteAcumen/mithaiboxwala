import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { WebhookEvent, Order, Payment } from '@/models';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.payload?.payment?.entity?.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    await connectDB();

    // Idempotency check
    const existing = await WebhookEvent.findOne({ provider: 'razorpay', eventId });
    if (existing) {
      return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
    }

    const webhookRecord = await WebhookEvent.create({
      provider: 'razorpay',
      eventId,
      eventType,
      payload,
      status: 'pending',
    });

    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          {
            status: 'confirmed',
            paymentStatus: 'paid',
            $push: {
              statusHistory: {
                status: 'confirmed',
                timestamp: new Date(),
                note: `Webhook payment.captured: ${paymentEntity.id}`,
              },
            },
          }
        );
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            status: 'captured',
            razorpayPaymentId: paymentEntity.id,
            capturedAt: new Date(),
          }
        );
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            status: 'failed',
            failureReason: paymentEntity?.error_description || 'Payment failed',
          }
        );
      }
    }

    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
