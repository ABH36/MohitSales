import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const source = searchParams.get('source') || 'all';
    const where = source === 'website' || source === 'feedback' ? { source } : {};

    const [inquiries, total, statusGroups] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
      // Overall counts (all sources) for the stat cards — accurate regardless of page/filter.
      prisma.inquiry.groupBy({ by: ['status'], _count: true }),
    ]);

    const counts = { total: 0, new: 0, replied: 0 };
    statusGroups.forEach((g) => {
      counts.total += g._count;
      if (g.status === 'new') counts.new = g._count;
      if (g.status === 'replied') counts.replied = g._count;
    });

    return NextResponse.json({
      success: true,
      data: inquiries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts,
    });
  } catch (error) {
    console.error('[Admin Inquiries GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Wiping ALL inquiries is admin-only (matches the destructive-delete pattern
    // across Pages/Products/Categories); EDITORs can still delete single rows.
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;

    await prisma.inquiry.deleteMany({});
    return NextResponse.json({ success: true, message: 'All inquiries cleared successfully.' });
  } catch (error) {
    console.error('[Admin Inquiries DELETE]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
