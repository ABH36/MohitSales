import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extname, basename } from 'path';
import { sendMail, emailConfig } from '../../../lib/mailer';
import { inquiryRateLimiter } from '@/lib/rate-limiter';
import { escapeHtml } from '@/lib/utils';
import { decryptCaptcha, isTokenUsed, markTokenUsed } from '@/lib/captcha';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting Check with safe IP extraction to prevent spoofing bypass
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null)
      || request.ip 
      || request.headers.get('x-real-ip') 
      || '127.0.0.1';

    /*
    if (inquiryRateLimiter.limit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again in a minute.' },
        { status: 429 }
      );
    }
    */

    const formData = await request.formData();
    const name    = formData.get('name')    as string;
    const cname   = formData.get('cname')   as string;
    const email   = formData.get('email')   as string;
    const mobile  = formData.get('mobile')  as string;
    const message = formData.get('message') as string;
    const file    = formData.get('file')    as File | null;
    const captchaInput = formData.get('captchaInput') as string;
    const captchaToken = formData.get('captchaToken') as string;

    // Verify CAPTCHA
    if (!captchaInput || !captchaToken) {
      return NextResponse.json(
        { success: false, message: 'Captcha is required.' },
        { status: 400 }
      );
    }

    // Extract signature from token (last part)
    const sig = captchaToken.split(':').slice(-1)[0];
    if (sig && isTokenUsed(sig)) {
      return NextResponse.json(
        { success: false, message: 'Captcha token has already been used. Please refresh.' },
        { status: 400 }
      );
    }

    const decrypted = decryptCaptcha(captchaToken);
    if (!decrypted) {
      return NextResponse.json(
        { success: false, message: 'Invalid captcha token. Please try again.' },
        { status: 400 }
      );
    }

    if (Date.now() - decrypted.timestamp > 10 * 60 * 1000) {
      return NextResponse.json(
        { success: false, message: 'Captcha has expired. Please refresh and try again.' },
        { status: 400 }
      );
    }

    if (decrypted.code !== captchaInput) {
      return NextResponse.json(
        { success: false, message: 'Incorrect captcha code. Please try again.' },
        { status: 400 }
      );
    }

    // Mark token as used to prevent replay attacks
    if (sig) {
      markTokenUsed(sig);
    }

    // ─── Input Validation ────────────────────────────────────────────────────
    if (!name || !cname || !email || !mobile || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // Safe attachment validation (size limit and extension whitelist)
    if (file && file.size > 0) {
      const ext = extname(file.name).toLowerCase();
      const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']);
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { success: false, message: 'Attachment file type not allowed.' },
          { status: 415 }
        );
      }

      // Check declared MIME type matches extension to block extension-spoofed malicious files
      const ALLOWED_MIME: Record<string, string[]> = {
        '.jpg': ['image/jpeg', 'image/pjpeg'],
        '.jpeg': ['image/jpeg', 'image/pjpeg'],
        '.png': ['image/png'],
        '.gif': ['image/gif'],
        '.webp': ['image/webp'],
        '.pdf': ['application/pdf'],
        '.doc': ['application/msword'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      };

      if (!ALLOWED_MIME[ext]?.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Attachment file content type mismatch.' },
          { status: 415 }
        );
      }
      
      // Limit to 10MB to prevent DoS
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Attachment file size exceeds 10MB limit.' },
          { status: 413 }
        );
      }
    }

    // ─── Save to Database ─────────────────────────────────────────────────────
    try {
      await prisma.inquiry.create({
        data: {
          name,
          company: cname,
          email,
          mobile,
          message,
          source: 'website',
          status: 'new',
        },
      });
    } catch (dbError) {
      console.error('[Inquiry API] Database save failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Server error. Failed to record enquiry.' },
        { status: 500 }
      );
    }

    // ─── Send Email Notification ──────────────────────────────────────────────
    try {
      const mailOptions: Parameters<typeof sendMail>[0] = {
        from:    emailConfig.from(name),
        to:      emailConfig.toInquiry,
        bcc:     emailConfig.bcc,
        subject: 'New Enquiry — Mohit Sales Corporation Pvt. Ltd.',
        html: `
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <table width="100%" style="background:#f4f4f4; padding: 30px 0;">
              <tr><td align="center">
                <table width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1E2E5E, #2d4080); padding: 28px 30px;">
                      <h2 style="color:#ffffff; margin:0; font-size:22px; font-family:Arial,sans-serif;">
                        📬 New Website Enquiry
                      </h2>
                      <p style="color:rgba(255,255,255,0.75); margin:6px 0 0; font-size:13px;">
                        Mohit Sales Corporation Pvt. Ltd.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; width:30%; border:1px solid #e0e0e0; color:#1E2E5E;">Name</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(name)}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Company</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(cname)}</td>
                        </tr>
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Email</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">
                            <a href="mailto:${escapeHtml(email)}" style="color:#F7931E;">${escapeHtml(email)}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Phone</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">
                            <a href="tel:${escapeHtml(mobile)}" style="color:#F7931E;">${escapeHtml(mobile)}</a>
                          </td>
                        </tr>
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E; vertical-align:top;">Message</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(message).replace(/\n/g, '<br>')}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f4f5fa; padding:16px 30px; text-align:center; font-size:12px; color:#888;">
                      This email was sent automatically from the website contact form.<br>
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mohit.bdm.co.in'}" style="color:#1E2E5E;">mohit.bdm.co.in</a>
                    </td>
                  </tr>
                  
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      };

      // Attach uploaded file if any
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = basename(file.name).replace(/[^\w.\-]/g, '_').slice(0, 100);
        mailOptions.attachments = [{ filename: safeName, content: buffer }];
      }

      await sendMail(mailOptions);
    } catch (mailError) {
      // Email failure is non-fatal — inquiry is already saved to DB
      console.error('[Inquiry API] Email notification failed:', mailError);
    }

    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully.' });
  } catch (error: unknown) {
    console.error('[Inquiry API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
