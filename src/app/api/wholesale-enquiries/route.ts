import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { WholesaleEnquiry } from '@/models';
import { WholesaleEnquirySchema } from '@/lib/validation/schemas';
import { sendWholesaleEnquiryConfirmation } from '@/lib/email';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = WholesaleEnquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      // Honeypot triggered
      return NextResponse.json({ success: true, message: 'Enquiry received' }, { status: 200 });
    }

    await connectDB();

    const referenceNumber = `MB-WHL-${Date.now().toString().slice(-6)}-${nanoid(4).toUpperCase()}`;

    const enquiry = await WholesaleEnquiry.create({
      ...parsed.data,
      referenceNumber,
      status: 'new',
    });

    try {
      await sendWholesaleEnquiryConfirmation(parsed.data.email, {
        contactName: parsed.data.contactName,
        referenceNumber,
      });
    } catch (emailErr) {
      console.error('[Wholesale Email Error]:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Your wholesale enquiry has been submitted successfully.',
      data: { referenceNumber },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
