/**
 * Admin Setting By ID — /api/admin/settings/[id]
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { settingUpdateSchema } from '@/lib/schemas/setting';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;

    const parsed = await parseBody(request, settingUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { value, password } = parsed.data;

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

    if (setting.isPublic) revalidatePath('/');

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    console.error('[Admin Settings PUT Error]:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

