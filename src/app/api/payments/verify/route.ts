import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { getCustomerSession } from '@/lib/auth/session';
import { confirmPayment } from '@/server/services/order.service';
import { VerifyPaymentSchema } from '@/lib/validation/schemas';
import { Order } from '@/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const session = await getCustomerSession();

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const result = await confirmPayment({
      orderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      userId: session?.user._id?.toString(),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const order = await Order.findById(orderId).select('orderNumber grandTotal status');

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: order,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
