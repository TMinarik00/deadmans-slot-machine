// Email sending utility using Nodemailer.
// In development, emails go to Mailpit (localhost:1025) which catches
// them and shows them in a web UI at localhost:8025.
// In production, you'd swap SMTP settings for a real provider.

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false, // Mailpit doesn't use TLS
});

// Send a password reset email with a link containing the reset token.
export async function sendPasswordResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: '"Dead Man\'s Slot Machine" <noreply@deadmans-slot.com>',
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #d4a020;">Password Reset</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #d4a020; color: #1a0f0a; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p style="color: #888; font-size: 0.9rem;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
