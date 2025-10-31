// app/lib/mailer.ts
import nodemailer from "nodemailer";

const from = process.env.FROM_EMAIL || "AdGenXAI <no-reply@example.com>";

export async function sendWelcomeEmail({ to, plan }: { to: string; plan: string }) {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial">
      <h2>Welcome to AdGenXAI ✨</h2>
      <p>Your <b>${plan}</b> subscription is active. You're ready to generate ads & reels, and broadcast everywhere.</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}">Open AdGenXAI</a></p>
      <hr/>
      <p style="font-size:12px;color:#666">If you didn't expect this email, ignore it.</p>
    </div>
  `;

  await t.sendMail({ to, from, subject: "Welcome to AdGenXAI", html });
}
