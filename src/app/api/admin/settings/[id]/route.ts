/**
 * Admin Setting By ID — /api/admin/settings/[id]
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');

    if (userRole !== 'ADMIN' || !userId) {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { value, password } = body;

    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required to authorize updates.' }, { status: 400 });
    }

    // Fetch user from DB to verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Settings update unauthorized.' }, { status: 401 });
    }

    const setting = await prisma.setting.update({
      where: { id: params.id },
      data: { value },
    });
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    console.error('[Admin Settings PUT Error]:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

