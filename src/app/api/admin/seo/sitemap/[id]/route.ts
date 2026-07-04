import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    await prisma.sitemapOverride.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Sitemap Override DELETE]', error);
    return NextResponse.json({ success: false, error: 'Failed to delete override' }, { status: 500 });
  }
}
