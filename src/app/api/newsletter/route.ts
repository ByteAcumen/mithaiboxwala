import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { NewsletterSubscription } from '@/models';
import { NewsletterSignupSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = NewsletterSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email and consent.' },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      // Honeypot triggered
      return NextResponse.json({ success: true, message: 'Subscribed' }, { status: 200 });
    }

    await connectDB();

    await NewsletterSubscription.findOneAndUpdate(
      { email: parsed.data.email },
      {
        email: parsed.data.email,
        isActive: true,
        source: 'storefront_footer',
        subscribedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to Mithai Box Wala updates!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
