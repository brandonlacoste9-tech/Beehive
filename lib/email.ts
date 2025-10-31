import nodemailer from "nodemailer";
import { createLogger } from "@/lib/logger";

const logger = createLogger({ function: "email-service" });

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

interface WelcomeEmailData {
  email: string;
  name?: string;
  plan: string;
}

interface ReceiptEmailData {
  email: string;
  amount: number;
  currency: string;
  date: string;
  invoiceUrl?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { email, name = "there", plan } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AdGenXAI! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Thanks for subscribing to AdGenXAI <strong>${plan}</strong> plan! You now have access to:</p>
      <ul>
        <li>✨ AI-powered ad generation</li>
        <li>🎯 Multi-persona targeting</li>
        <li>📊 Real-time analytics</li>
        <li>⚡ Streaming responses</li>
      </ul>
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">
          Get Started →
        </a>
      </p>
      <p>If you have any questions, just reply to this email. We're here to help!</p>
      <p>Best,<br>The AdGenXAI Team</p>
    </div>
    <div class="footer">
      <p>AdGenXAI • AI-Powered Advertising Creative Platform</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Welcome to AdGenXAI! 🚀",
      html
    });

    logger.info("welcome_email_sent", { email, plan });
    return { success: true };
  } catch (error) {
    logger.error("welcome_email_failed", { 
      email, 
      error: (error as Error).message 
    });
    throw error;
  }
}

export async function sendReceiptEmail(data: ReceiptEmailData) {
  const { email, amount, currency, date, invoiceUrl } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 30px 20px; text-align: center; }
    .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; }
    .amount { font-size: 36px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Receipt 📧</h1>
    </div>
    <div class="content">
      <p>Thank you for your payment!</p>
      <div class="amount">${currency} ${(amount / 100).toFixed(2)}</div>
      <p><strong>Date:</strong> ${date}</p>
      ${invoiceUrl ? `<p style="text-align: center;"><a href="${invoiceUrl}" class="button">View Invoice</a></p>` : ''}
      <p>This receipt confirms your payment has been processed successfully.</p>
      <p>Questions? Just reply to this email.</p>
    </div>
    <div class="footer">
      <p>AdGenXAI • Payment Receipt</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Receipt for ${currency} ${(amount / 100).toFixed(2)}`,
      html
    });

    logger.info("receipt_email_sent", { email, amount });
    return { success: true };
  } catch (error) {
    logger.error("receipt_email_failed", { 
      email, 
      error: (error as Error).message 
    });
    throw error;
  }
}
