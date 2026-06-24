import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR' && role !== 'VIEWER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

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
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.notFoundLog.deleteMany();

    return NextResponse.json({ success: true, message: 'All 404 logs cleared successfully' });
  } catch (error) {
    console.error('[Admin 404 Logs DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear 404 logs' }, { status: 500 });
  }
}
