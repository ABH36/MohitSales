/**
 * Shared Mailer Utility — Mohit Industries
 * =========================================
 * Centralized email configuration using environment variables only.
 * No credentials are hardcoded anywhere in this file.
 */

import nodemailer from 'nodemailer';

// ─── Environment Variable Validation ─────────────────────────────────────────

function getRequiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}. Please set it in your .env file.`);
  }
  return val;
}

// ─── Create Reusable Transporter ─────────────────────────────────────────────

export function createMailTransporter() {
  const host   = process.env.SMTP_HOST   || 'smtp.gmail.com';
  const port   = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true'; // true = 465, false = 587 (TLS/STARTTLS)
  const user   = getRequiredEnv('SMTP_USER');
  const pass   = getRequiredEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

// ─── Email Recipient Config ───────────────────────────────────────────────────

export const emailConfig = {
  from: (name: string) => `"${name}" <${process.env.SMTP_USER}>`,
  toInquiry:  process.env.SMTP_TO_INQUIRY  || 'info@mohitscpl.com',
  toFeedback: process.env.SMTP_TO_FEEDBACK || 'info@mohitscpl.com',
  bcc:        process.env.SMTP_BCC         || '',
};

// ─── Reusable Send Function ───────────────────────────────────────────────────

interface SendMailOptions {
  from: string;
  to: string;
  bcc?: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const transporter = createMailTransporter();
  await transporter.sendMail(options);
}
