/**
 * Email Notification Service
 *
 * Supports multiple providers:
 * - SendGrid (recommended for production)
 * - Resend
 * - Postmark
 * - Fallback to console logging for development
 */

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailParams {
  email: string;
  name?: string;
  plan: string;
}

interface UsageAlertParams {
  email: string;
  name?: string;
  dailyUsage: number;
  dailyLimit: number;
  plan: string;
}

interface PaymentEmailParams {
  email: string;
  name?: string;
  amount: number;
  plan: string;
  status: 'success' | 'failed';
  invoiceUrl?: string;
}

/**
 * Send email using configured provider
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  try {
    switch (provider) {
      case 'sendgrid':
        return await sendWithSendGrid(params);

      case 'resend':
        return await sendWithResend(params);

      case 'postmark':
        return await sendWithPostmark(params);

      default:
        // Development fallback - log to console
        console.log('📧 Email (dev mode):', {
          to: params.to,
          subject: params.subject,
          preview: params.html.substring(0, 100),
        });
        return true;
    }
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

/**
 * SendGrid implementation
 */
async function sendWithSendGrid(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: {
        email: process.env.FROM_EMAIL || 'noreply@adgenxai.pro',
        name: process.env.FROM_NAME || 'AdGenXAI',
      },
      subject: params.subject,
      content: [
        { type: 'text/html', value: params.html },
        ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
      ],
    }),
  });

  return response.ok;
}

/**
 * Resend implementation
 */
async function sendWithResend(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'noreply@adgenxai.pro',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  return response.ok;
}

/**
 * Postmark implementation
 */
async function sendWithPostmark(params: EmailParams): Promise<boolean> {
  const apiKey = process.env.POSTMARK_API_KEY;
  if (!apiKey) {
    throw new Error('POSTMARK_API_KEY not configured');
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      From: process.env.FROM_EMAIL || 'noreply@adgenxai.pro',
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.html,
      TextBody: params.text,
      MessageStream: 'outbound',
    }),
  });

  return response.ok;
}

/**
 * Welcome email template
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean> {
  const { email, name, plan } = params;
  const displayName = name || email.split('@')[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AdGenXAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #1f2937; font-size: 32px; margin: 0;">Welcome to AdGenXAI</h1>
      <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">AI-Powered Advertising Creative Platform</p>
    </div>

    <!-- Main Content -->
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Hi ${displayName}! 👋</h2>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining AdGenXAI! You're now part of a community using AI to create high-converting ad creatives.
      </p>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Your <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan is now active. Here's what you can do:
      </p>

      <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
        <li>Generate compelling ad headlines and body copy</li>
        <li>Create detailed image prompts for AI image generation</li>
        <li>A/B test multiple variations${plan !== 'free' ? ' (Pro/Enterprise)' : ''}</li>
        <li>Track your generation history and analytics</li>
        ${plan === 'enterprise' ? '<li>Unlimited generations with priority support</li>' : ''}
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/dashboard"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>

      <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
        <p style="color: #1f2937; font-weight: 600; margin: 0 0 10px 0;">💡 Quick Tip:</p>
        <p style="color: #4b5563; margin: 0; line-height: 1.6;">
          For best results, be specific about your product and target audience. The more detail you provide, the better your AI-generated ads will be!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
        Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/support" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AdGenXAI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

  const text = `
Welcome to AdGenXAI!

Hi ${displayName}!

Thank you for joining AdGenXAI! You're now part of a community using AI to create high-converting ad creatives.

Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active.

Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/dashboard

Need help? Contact us at ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/support

© ${new Date().getFullYear()} AdGenXAI. All rights reserved.
`;

  return sendEmail({
    to: email,
    subject: '🎉 Welcome to AdGenXAI - Your AI Ad Creative Platform',
    html,
    text,
  });
}

/**
 * Usage alert email (80% quota reached)
 */
export async function sendUsageAlertEmail(params: UsageAlertParams): Promise<boolean> {
  const { email, name, dailyUsage, dailyLimit, plan } = params;
  const displayName = name || email.split('@')[0];
  const percentUsed = Math.round((dailyUsage / dailyLimit) * 100);
  const remaining = dailyLimit - dailyUsage;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage Alert - AdGenXAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Hi ${displayName},</h2>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #92400e; font-weight: 600; margin: 0 0 10px 0;">⚠️ Usage Alert</p>
        <p style="color: #78350f; margin: 0; line-height: 1.6;">
          You've used <strong>${dailyUsage} of ${dailyLimit}</strong> daily generations (${percentUsed}%).
          Only <strong>${remaining}</strong> generations remaining today.
        </p>
      </div>

      ${plan === 'free' ? `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        Running low on generations? Upgrade to <strong>Pro</strong> for 10x more daily generations and advanced features!
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/pricing"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Upgrade to Pro
        </a>
      </div>
      ` : `
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
        Your quota will automatically reset at midnight UTC. Keep creating amazing ads!
      </p>
      `}
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AdGenXAI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: email,
    subject: `⚠️ ${percentUsed}% of Your Daily Quota Used - AdGenXAI`,
    html,
  });
}

/**
 * Payment confirmation email
 */
export async function sendPaymentEmail(params: PaymentEmailParams): Promise<boolean> {
  const { email, name, amount, plan, status, invoiceUrl } = params;
  const displayName = name || email.split('@')[0];

  const html = status === 'success' ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - AdGenXAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 32px;">✓</span>
        </div>
        <h2 style="color: #1f2937; font-size: 24px; margin: 0;">Payment Successful!</h2>
      </div>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${displayName},
      </p>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Thank you for your payment! Your <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> subscription is now active.
      </p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Amount Paid:</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: 600; text-align: right;">$${(amount / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Plan:</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: 600; text-align: right;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Date:</td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 16px; font-weight: 600; text-align: right;">${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      </div>

      ${invoiceUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invoiceUrl}"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Download Invoice
        </a>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AdGenXAI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
` : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed - AdGenXAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
        <p style="color: #991b1b; font-weight: 600; margin: 0 0 10px 0;">❌ Payment Failed</p>
        <p style="color: #7f1d1d; margin: 0; line-height: 1.6;">
          We couldn't process your payment for the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan ($${(amount / 100).toFixed(2)}).
        </p>
      </div>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${displayName},
      </p>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        This could be due to insufficient funds, an expired card, or your bank declining the transaction.
      </p>

      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Please update your payment method and try again.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.adgenxai.pro'}/dashboard"
           style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Update Payment Method
        </a>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} AdGenXAI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: email,
    subject: status === 'success'
      ? `✅ Payment Confirmed - $${(amount / 100).toFixed(2)} - AdGenXAI`
      : `❌ Payment Failed - Action Required - AdGenXAI`,
    html,
  });
}
