/**
 * Admin Settings API — /api/admin/settings
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('[Admin Settings GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
