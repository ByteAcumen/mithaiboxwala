/**
 * Email Service
 * Supports Resend and SMTP providers.
 * All transactional emails go through this module.
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER ?? 'resend';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'noreply@mithaiboxes.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME ?? 'MithaiBoxes';
const MOCK_EMAIL = process.env.MOCK_EMAIL === 'true';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ============================================================
// PROVIDER IMPLEMENTATIONS
// ============================================================

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

async function sendViaSMTP(payload: EmailPayload): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

async function mockSend(payload: EmailPayload): Promise<void> {
  // Mock provider: logs to console in development
  console.log('[Email Mock]', {
    to: payload.to,
    subject: payload.subject,
    preview: payload.text?.substring(0, 100) ?? payload.html.substring(0, 100),
  });
}

// ============================================================
// MAIN SEND FUNCTION
// ============================================================

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (MOCK_EMAIL || process.env.NODE_ENV === 'test') {
    return mockSend(payload);
  }

  switch (EMAIL_PROVIDER) {
    case 'resend':
      return sendViaResend(payload);
    case 'smtp':
      return sendViaSMTP(payload);
    default:
      throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`);
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #24211F;
  max-width: 600px;
  margin: 0 auto;
  background: #FAF7F0;
`;

const headerStyle = `
  background: #681C2D;
  padding: 24px 32px;
  text-align: center;
`;

const bodyStyle = `
  padding: 32px;
  background: #FFFFFF;
`;

const footerStyle = `
  padding: 16px 32px;
  background: #FAF7F0;
  font-size: 12px;
  color: #666;
  text-align: center;
`;

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MithaiBoxes</title>
    </head>
    <body style="margin: 0; padding: 16px; background: #EDE4D6;">
      <div style="${baseStyle}">
        <div style="${headerStyle}">
          <h1 style="color: #B8955A; font-size: 28px; margin: 0; letter-spacing: 2px;">MithaiBoxes</h1>
          <p style="color: #FAF7F0; margin: 4px 0 0; font-size: 12px;">Premium Packaging</p>
        </div>
        <div style="${bodyStyle}">
          ${content}
        </div>
        <div style="${footerStyle}">
          <p>© ${new Date().getFullYear()} Perfect Pack — MithaiBoxes. All rights reserved.</p>
          <p>Jogeshwari East, Mumbai, India | Mon–Sat: 10:00 AM to 6:00 PM</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// OTP Email
export async function sendOTPEmail(email: string, otp: string, expiresInMinutes: number = 10): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #681C2D; margin-top: 0;">Your Login Code</h2>
    <p>Use the following one-time code to sign in to your MithaiBoxes account:</p>
    <div style="background: #EDE4D6; border: 2px solid #B8955A; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #681C2D;">${otp}</span>
    </div>
    <p style="color: #666; font-size: 14px;">This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
    <p style="color: #666; font-size: 14px;">If you did not request this code, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #EDE4D6; margin: 24px 0;" />
    <p style="color: #666; font-size: 13px;">For security, never share this code with anyone. MithaiBoxes will never ask for your code.</p>
  `);

  await sendEmail({
    to: email,
    subject: `${otp} — Your MithaiBoxes Login Code`,
    html,
    text: `Your MithaiBoxes login code is: ${otp}\n\nThis code expires in ${expiresInMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
  });
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(
  email: string,
  data: {
    orderNumber: string;
    customerName: string;
    grandTotal: number;
    items: { name: string; quantity: number; unitPrice: number }[];
    shippingAddress: string;
  }
): Promise<void> {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #EDE4D6;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #EDE4D6; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #EDE4D6; text-align: right;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #EDE4D6; text-align: right;">₹${(item.quantity * item.unitPrice).toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  const html = emailWrapper(`
    <h2 style="color: #681C2D; margin-top: 0;">Order Confirmed!</h2>
    <p>Hi ${data.customerName}, thank you for your order.</p>
    
    <div style="background: #EDE4D6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <strong>Order Number: #${data.orderNumber}</strong>
    </div>
    
    <h3 style="color: #681C2D;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #681C2D; color: white;">
          <th style="padding: 8px; text-align: left;">Product</th>
          <th style="padding: 8px; text-align: center;">Qty</th>
          <th style="padding: 8px; text-align: right;">Price</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold;">Grand Total:</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #681C2D;">₹${data.grandTotal.toLocaleString('en-IN')}</td>
        </tr>
      </tfoot>
    </table>
    
    <h3 style="color: #681C2D;">Shipping To</h3>
    <p>${data.shippingAddress}</p>
    
    <p style="color: #666; font-size: 13px;">
      Standard orders are dispatched within 2 business days. 
      Shipping and packing charges are as specified in your order.
      Once dispatched, you will receive a tracking notification.
    </p>
    
    <p style="background: #681C2D; color: white; padding: 12px 24px; border-radius: 4px; display: inline-block; margin-top: 16px;">
      100% advance payment received. Your order is being processed.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: `Order Confirmed: #${data.orderNumber} — MithaiBoxes`,
    html,
    text: `Order #${data.orderNumber} confirmed. Grand Total: ₹${data.grandTotal}. Thank you for shopping with MithaiBoxes.`,
  });
}

// Wholesale Enquiry Confirmation
export async function sendWholesaleEnquiryConfirmation(
  email: string,
  data: { contactName: string; referenceNumber: string }
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #681C2D; margin-top: 0;">Wholesale Enquiry Received</h2>
    <p>Hi ${data.contactName},</p>
    <p>Thank you for your wholesale enquiry. We have received your request and our team will review it and respond within 1–2 business days.</p>
    
    <div style="background: #EDE4D6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <strong>Reference Number: ${data.referenceNumber}</strong>
      <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Please quote this reference number in any future correspondence.</p>
    </div>
    
    <p>Our business hours are Monday to Saturday, 10:00 AM to 6:00 PM IST.</p>
    <p>If your requirement is urgent, please call us directly.</p>
  `);

  await sendEmail({
    to: email,
    subject: `Wholesale Enquiry Received: ${data.referenceNumber} — MithaiBoxes`,
    html,
    text: `Hi ${data.contactName}, your wholesale enquiry (${data.referenceNumber}) has been received. We will respond within 1-2 business days.`,
  });
}

// Dispatch Notification
export async function sendDispatchNotificationEmail(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    courier: string;
    trackingNumber: string;
    trackingUrl?: string;
  }
): Promise<void> {
  const html = emailWrapper(`
    <h2 style="color: #681C2D; margin-top: 0;">Your Order Has Been Dispatched!</h2>
    <p>Hi ${data.customerName}, great news — your order #${data.orderNumber} is on its way.</p>
    
    <div style="background: #EDE4D6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Courier:</strong> ${data.courier}</p>
      <p style="margin: 8px 0 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      ${data.trackingUrl ? `<p style="margin: 8px 0 0;"><a href="${data.trackingUrl}" style="color: #681C2D;">Track Your Shipment →</a></p>` : ''}
    </div>
    
    <p style="color: #666; font-size: 13px;">
      Please note: Once goods leave our premises, MithaiBoxes cannot be held responsible for transit delays or damages caused by third-party couriers.
    </p>
  `);

  await sendEmail({
    to: email,
    subject: `Dispatched: Order #${data.orderNumber} — MithaiBoxes`,
    html,
    text: `Order #${data.orderNumber} dispatched via ${data.courier}. Tracking: ${data.trackingNumber}`,
  });
}
