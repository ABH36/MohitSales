import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    await prisma.sitemapOverride.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Sitemap Override DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete override' }, { status: 500 });
  }
}
