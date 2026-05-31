import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to ethereal for dev
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: 'dev@ethereal.email', pass: 'dev' },
      });
    }
  }
  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"MkulimaLink Kenya" <${process.env.EMAIL_FROM || 'noreply@mkulimalink.co.ke'}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    logger.info('Email sent', { to, messageId: info.messageId });
    return true;
  } catch (err) {
    logger.error('Email send error', { to, err });
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderId: string,
  total: number
): Promise<void> {
  const subject = 'Order Confirmation - MkulimaLink';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2E7D32; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">MkulimaLink Kenya</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Order Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has been confirmed.</p>
        <p>Total Amount: <strong>KES ${total.toLocaleString()}</strong></p>
        <p>Please complete payment via M-Pesa to confirm your order.</p>
        <a href="${process.env.FRONTEND_URL}/orders/${orderId}" 
           style="background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">
          View Order
        </a>
      </div>
      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>MkulimaLink Kenya - Connecting Farmers to Markets</p>
      </div>
    </div>
  `;
  await sendEmail(to, subject, `Order ${orderId.slice(0, 8).toUpperCase()} confirmed. Total: KES ${total}`, html);
}
