import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    await prisma.notFoundLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '404 log entry deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, error: '404 log entry not found' }, { status: 404 });
    }
    console.error('[Admin 404 Log ID DELETE Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete 404 log entry' }, { status: 500 });
  }
}
