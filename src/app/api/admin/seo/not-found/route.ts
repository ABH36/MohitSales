import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR', 'VIEWER']);
    if (auth instanceof NextResponse) return auth;

    const logs = await prisma.notFoundLog.findMany({
      orderBy: { hitCount: 'desc' },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('[Admin 404 Logs GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch 404 logs' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    await prisma.notFoundLog.deleteMany();

    return NextResponse.json({ success: true, message: 'All 404 logs cleared successfully' });
  } catch (error) {
    console.error('[Admin 404 Logs DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear 404 logs' }, { status: 500 });
  }
}
