import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';

const ROBOTS_KEY = 'seo_robots_txt';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: ROBOTS_KEY } });
    return NextResponse.json({ success: true, data: setting?.value || null });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch robots config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const { rules } = body; // array of { userAgent, allow, disallow, crawlDelay }
    if (!rules) return NextResponse.json({ success: false, error: 'rules required' }, { status: 400 });

    const setting = await prisma.setting.upsert({
      where: { key: ROBOTS_KEY },
      update: { value: JSON.stringify(rules) },
      create: {
        key: ROBOTS_KEY,
        value: JSON.stringify(rules),
        type: 'json',
        group: 'seo',
        label: 'Robots.txt Rules',
        isPublic: false,
      },
    });
    return NextResponse.json({ success: true, data: setting });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save robots config' }, { status: 500 });
  }
}
