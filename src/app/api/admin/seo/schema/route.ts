import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const schemas = await prisma.schemaMarkup.findMany({ orderBy: { page: 'asc' } });
    return NextResponse.json({ success: true, data: schemas });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch schemas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'ADMIN' && role !== 'EDITOR') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { page, schemaType, jsonLd, isActive } = body;
    if (!page || !schemaType || !jsonLd) return NextResponse.json({ success: false, error: 'page, schemaType, jsonLd required' }, { status: 400 });

    // Validate JSON
    try { JSON.parse(jsonLd); } catch { return NextResponse.json({ success: false, error: 'Invalid JSON-LD' }, { status: 400 }); }

    const schema = await prisma.schemaMarkup.upsert({
      where: { page },
      update: { schemaType, jsonLd, isActive: isActive !== false },
      create: { page, schemaType, jsonLd, isActive: isActive !== false },
    });
    revalidatePath(page);
    return NextResponse.json({ success: true, data: schema });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save schema' }, { status: 500 });
  }
}
