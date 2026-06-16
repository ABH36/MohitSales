import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken, verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tempToken, otp } = body;

    if (!tempToken || !otp) {
      return NextResponse.json(
        { success: false, message: 'Verification token and code are required.' },
        { status: 400 }
      );
    }

    // 1. Decrypt tempToken
    const decrypted = await verifyToken(tempToken);
    if (!decrypted || decrypted.purpose !== '2fa' || !decrypted.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification session.' },
        { status: 400 }
      );
    }

    // 2. Fetch OTP record
    const otpSession = await prisma.adminOtp.findFirst({
      where: {
        tempToken,
        userId: decrypted.userId as string
      }
    });

    if (!otpSession) {
      return NextResponse.json(
        { success: false, message: 'Verification session not found.' },
        { status: 400 }
      );
    }

    // 3. Check expiration
    if (new Date() > otpSession.expiresAt) {
      await prisma.adminOtp.delete({ where: { id: otpSession.id } });
      return NextResponse.json(
        { success: false, message: 'Verification code expired. Please log in again.' },
        { status: 400 }
      );
    }

    // 4. Check attempts (limit to 3 wrong attempts)
    if (otpSession.attempts >= 3) {
      await prisma.adminOtp.delete({ where: { id: otpSession.id } });
      return NextResponse.json(
        { success: false, message: 'Too many incorrect attempts. Please start login process again.' },
        { status: 400 }
      );
    }

    // 5. Verify OTP code
    const isOtpValid = await bcrypt.compare(otp, otpSession.code);
    if (!isOtpValid) {
      // Increment attempts
      await prisma.adminOtp.update({
        where: { id: otpSession.id },
        data: { attempts: { increment: 1 } }
      });

      return NextResponse.json(
        { 
          success: false, 
          message: `Invalid code. ${3 - (otpSession.attempts + 1)} attempts remaining.` 
        },
        { status: 400 }
      );
    }

    // 6. OTP code is valid — Fetch full User
    const user = await prisma.user.findUnique({
      where: { id: otpSession.userId },
      include: { role: true }
    });

    if (!user || !user.isActive || !user.role) {
      await prisma.adminOtp.delete({ where: { id: otpSession.id } });
      return NextResponse.json(
        { success: false, message: 'Account deactivated or role assignment missing.' },
        { status: 401 }
      );
    }

    // Delete OTP record after successful use
    await prisma.adminOtp.delete({ where: { id: otpSession.id } });

    // 7. Generate active JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || 'Admin',
      role: user.role.name,
    });

    // 8. Set active HTTP-only cookie
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
      secure: process.env.NODE_ENV === 'production' && process.env['SECURE_COOKIE'] !== 'false',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[Verify OTP API Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
