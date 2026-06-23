import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (!userRole) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const page = request.nextUrl.searchParams.get('page');
    const where = page ? { page } : {};
    const sections = await prisma.cmsSection.findMany({
      where,
      orderBy: [{ page: 'asc' }, { sortOrder: 'asc' }],
    });
    return NextResponse.json({ success: true, data: sections });
  } catch (error: any) {
    console.error('[Admin CMS GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
