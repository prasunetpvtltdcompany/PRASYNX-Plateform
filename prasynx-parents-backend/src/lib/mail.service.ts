import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@prasynx.com';

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Prasynx - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Prasynx account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  } catch (error: any) {
    console.error('[Mail] Failed to send email:', error.message);
    console.log(`[Mail] Dev fallback — reset link for ${email}: ${resetLink}`);
  }
}
