import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"NewsDecoder" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}

export function otpEmailHtml(name: string, otp: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#e0e0e0;border-radius:12px">
      <h2 style="color:#4a72b0;margin-bottom:8px">Welcome to NewsDecoder</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <div style="text-align:center;margin:24px 0">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;background:#4a72b0;padding:12px 28px;border-radius:8px;display:inline-block">${otp}</span>
      </div>
      <p style="color:#999;font-size:13px">This code expires in 10 minutes. If you didn't sign up, ignore this email.</p>
    </div>
  `;
}

export function resetEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;color:#e0e0e0;border-radius:12px">
      <h2 style="color:#4a72b0;margin-bottom:8px">Password Reset</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="font-size:14px;font-weight:bold;color:#fff;background:#4a72b0;padding:12px 32px;border-radius:8px;display:inline-block;text-decoration:none">Reset Password</a>
      </div>
      <p style="color:#999;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="color:#666;font-size:11px;word-break:break-all">${resetUrl}</p>
    </div>
  `;
}
