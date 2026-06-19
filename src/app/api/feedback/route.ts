import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendMail, emailConfig } from '../../../lib/mailer';
import { feedbackRateLimiter } from '@/lib/rate-limiter';
import { escapeHtml } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting Check with safe IP extraction to prevent spoofing bypass
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null)
      || request.ip 
      || request.headers.get('x-real-ip') 
      || '127.0.0.1';

    /*
    if (feedbackRateLimiter.limit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again in a minute.' },
        { status: 429 }
      );
    }
    */

    const formData       = await request.formData();
    const name           = formData.get('name')            as string;
    const email          = formData.get('email')           as string;
    const client_existance = formData.get('client_existance') as string;
    const here_about     = formData.get('here_about')      as string;
    const rating         = formData.get('rating')          as string;
    const feedback_type  = formData.get('feedback_type')   as string;
    const feedback       = formData.get('feedback')        as string;

    // ─── Input Validation ────────────────────────────────────────────────────
    if (!name || !email || !here_about || !feedback) {
      return NextResponse.json(
        { success: false, message: 'Name, Email, Source, and Feedback are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // ─── Save to Database ─────────────────────────────────────────────────────
    try {
      await prisma.inquiry.create({
        data: {
          name,
          company: client_existance ? `Existing Client: ${client_existance}` : 'N/A',
          email,
          mobile: 'N/A',
          message: [
            `Feedback Type : ${feedback_type  || 'N/A'}`,
            `Heard About   : ${here_about}`,
            `Rating        : ${rating ? rating + ' Stars' : 'N/A'}`,
            `Comments      : ${feedback}`,
          ].join('\n'),
          source: 'feedback',
          status: 'new',
        },
      });
    } catch (dbError) {
      console.error('[Feedback API] Database save failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Server error. Failed to record feedback.' },
        { status: 500 }
      );
    }

    // ─── Send Email Notification ──────────────────────────────────────────────
    try {
      await sendMail({
        from:    emailConfig.from(name),
        to:      emailConfig.toFeedback,
        bcc:     emailConfig.bcc,
        subject: 'New Feedback — Mohit Sales Corporation Pvt. Ltd.',
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
                        💬 New Feedback Received
                      </h2>
                      <p style="color:rgba(255,255,255,0.75); margin:6px 0 0; font-size:13px;">
                        Mohit Sales Corporation Pvt. Ltd.
                      </p>
                    </td>
                  </tr>

                  <!-- Rating Banner -->
                  ${rating ? `
                  <tr>
                    <td style="background:#FFF8EE; padding:14px 30px; text-align:center; border-bottom:1px solid #FFE0B2;">
                      <span style="font-size:28px;">${'⭐'.repeat(Math.min(5, Math.max(0, parseInt(rating) || 0)))}</span>
                      <span style="font-size:14px; color:#F7931E; font-weight:bold; margin-left:8px;">${escapeHtml(rating || '')} Star Rating</span>
                    </td>
                  </tr>` : ''}
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; width:35%; border:1px solid #e0e0e0; color:#1E2E5E;">Name</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(name)}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Email</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">
                            <a href="mailto:${escapeHtml(email)}" style="color:#F7931E;">${escapeHtml(email)}</a>
                          </td>
                        </tr>
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Existing Client?</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(client_existance || 'N/A')}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Heard About Us Via</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(here_about)}</td>
                        </tr>
                        <tr style="background:#f8f9fb;">
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E;">Feedback Type</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(feedback_type || 'N/A')}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px; font-weight:bold; border:1px solid #e0e0e0; color:#1E2E5E; vertical-align:top;">Comments</td>
                          <td style="padding:12px 16px; border:1px solid #e0e0e0;">${escapeHtml(feedback).replace(/\n/g, '<br>')}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f4f5fa; padding:16px 30px; text-align:center; font-size:12px; color:#888;">
                      This feedback was submitted via the website feedback form.<br>
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://mohit.bdm.co.in'}" style="color:#1E2E5E;">mohit.bdm.co.in</a>
                    </td>
                  </tr>
                  
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (mailError) {
      console.error('[Feedback API] Email notification failed:', mailError);
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error: any) {
    console.error('[Feedback API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
