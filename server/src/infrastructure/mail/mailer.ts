import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../shared/logger/logger';

/**
 * SMTP transport. In development without SMTP configured we use a JSON preview
 * transport so flows (reset email, credential provisioning) still work locally.
 */
function createTransporter(): Transporter {
  if (!config.smtp.host) {
    logger.info('Mail: no SMTP_HOST configured, using JSON preview transport');
    return nodemailer.createTransport({ jsonTransport: true }) as Transporter;
  }
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
}

const transporter = createTransporter();

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: config.smtp.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    logger.info({ to: opts.to, messageId: info.messageId }, 'Mail sent');
  } catch (err) {
    // Never let mail delivery break a business flow - log and move on.
    logger.error({ err, to: opts.to }, 'Mail send failed');
  }
}

export function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  return sendMail({
    to,
    subject: 'PRASYNX - Reset your password',
    html: `<p>Hello,</p><p>You requested a password reset. Click the link below (valid for 1 hour):</p>
<p><a href="${resetLink}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`,
  });
}

export function sendSchoolCredentialsEmail(to: string, schoolName: string, fullName: string, temporaryPassword: string): Promise<void> {
  return sendMail({
    to,
    subject: `PRASYNX - ${schoolName} portal access`,
    html: `<p>Hello ${fullName},</p><p>Your <strong>${schoolName}</strong> portal account was created by PRASYNX.</p>
<p>Sign in at ${config.frontendUrl} with:</p>
<ul><li>Email: ${to}</li><li>Temporary password: <code>${temporaryPassword}</code></li></ul>
<p>You will be asked to change it on first login.</p>`,
  });
}