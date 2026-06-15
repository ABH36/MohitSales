/**
 * Admin Login API — POST /api/admin/auth/login
 * ==============================================
 * Authenticates admin user against the database and returns JWT in HTTP-only cookie.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken, COOKIE_NAME } from '../../../../../lib/auth';
import { loginRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',').at(-1)?.trim() : null)
      || request.ip 
      || request.headers.get('x-real-ip') 
      || '127.0.0.1';

    if (loginRateLimiter.limit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Dummy hash to execute when user is not found to prevent user enumeration timing side-channels
    const dummyHash = "$2a$10$K.ZJv1r6t307d0pI.Dk0tOpE3G9L2r9Y9O3F6aZ3xW6v5p4q3r2s.";

    if (!user || !user.isActive) {
      await bcrypt.compare(password, dummyHash);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // S3: Ensure user has an assigned role
    if (!user.role) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Two Factor Authentication Step
    if (user.twoFactorEnabled) {
      // 1. Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);

      // 2. Generate encrypted tempToken valid for 10 minutes
      const tempToken = await createToken({ userId: user.id, purpose: '2fa' }, '10m');

      // 3. Save OTP session in DB
      await prisma.adminOtp.create({
        data: {
          userId: user.id,
          code: hashedOtp,
          tempToken,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      });

      // 4. Send email
      try {
        const { sendMail, emailConfig } = await import('@/lib/mailer');
        await sendMail({
          from: emailConfig.from('MSC Portal Security'),
          to: user.email,
          subject: '[MSC Portal] Two-Factor Authentication OTP Code',
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #1e293b; margin: 0; font-weight: 800; letter-spacing: -0.5px;">MOHIT SALES CORPORATION</h2>
                <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">Security Verification Service</p>
              </div>
              <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <p style="margin: 0 0 16px 0; color: #334155; font-size: 16px;">Hello <strong>${user.name || 'Admin'}</strong>,</p>
                <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.5;">
                  We detected a login attempt for your account. Please enter the following 6-digit verification code to complete your sign-in. This code is valid for <strong>10 minutes</strong>.
                </p>
                <div style="background-color: #f1f5f9; padding: 18px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                  <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; font-family: monospace;">${otpCode}</span>
                </div>
                <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                  If you did not initiate this login request, please contact the primary administrator or system security immediately.
                </p>
              </div>
            </div>
          `
        });
      } catch (mailError) {
        console.error('[Admin Login OTP Mail Error]:', mailError);
        return NextResponse.json(
          { success: false, message: 'Failed to send OTP verification email. Please check your system mail settings.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        step: 'otp',
        tempToken,
        message: 'Verification code sent to your email.'
      });
    }

    // Create JWT
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role.name,
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 }
    );
  }
}
