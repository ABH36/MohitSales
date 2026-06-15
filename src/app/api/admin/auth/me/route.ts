import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const admin = await verifyToken(token);
    if (!admin || !admin.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    // Query database for fresh user info and validation
    const dbUser = await prisma.user.findUnique({
      where: { id: admin.userId as string },
      include: { role: true }
    });

    if (!dbUser || !dbUser.isActive || !dbUser.role) {
      const response = NextResponse.json(
        { success: false, message: 'Session expired or deactivated.' },
        { status: 401 }
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role.name,
        twoFactorEnabled: dbUser.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('[Auth Me API GET Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const admin = await verifyToken(token);
    if (!admin || !admin.userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, twoFactorEnabled } = body;

    // Email validation
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
    }

    // Check unique email constraint
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      if (existingUser && existingUser.id !== admin.userId) {
        return NextResponse.json(
          { success: false, message: 'Email address is already taken by another administrator.' },
          { status: 400 }
        );
      }
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: admin.userId as string },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(twoFactorEnabled !== undefined ? { twoFactorEnabled: twoFactorEnabled === true } : {})
      },
      include: { role: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role.name,
        twoFactorEnabled: updatedUser.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('[Auth Me API PUT Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
