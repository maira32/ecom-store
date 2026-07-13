import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: `LuxeLane <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your LuxeLane password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #475569;">
          We received a request to reset your LuxeLane password. This link expires in 1 hour.
        </p>
        <a
          href="${resetUrl}"
          style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;
                 border-radius:12px;text-decoration:none;font-weight:600;margin:16px 0;"
        >
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}

export async function sendContactReplyEmail(
  to: string,
  customerName: string,
  originalMessage: string,
  replyText: string
) {
  await transporter.sendMail({
    from: `LuxeLane Support <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Re: Your message to LuxeLane',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
        <p>Hi ${customerName},</p>
        <p style="white-space: pre-wrap; color: #1e293b;">${replyText}</p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">Your original message:</p>
          <p style="color: #64748b; font-size: 13px; white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 8px;">
            ${originalMessage}
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          — LuxeLane Support
        </p>
      </div>
    `,
  });
}