import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = new URL(request.url).searchParams.get('page') || '/';
    const meta = await prisma.seoMeta.findUnique({ where: { page } });
    return NextResponse.json({ success: true, data: meta || null });
  } catch {
    return NextResponse.json({ success: false, data: null }, { status: 500 });
  }
}
