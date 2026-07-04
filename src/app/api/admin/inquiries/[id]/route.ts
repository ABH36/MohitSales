import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { inquiryUpdateSchema } from '@/lib/schemas/inquiry';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, inquiryUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { status } = parsed.data;

    const inquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error: any) {
    console.error('[Admin Inquiry PUT]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN', 'EDITOR']);
    if (auth instanceof NextResponse) return auth;

    await prisma.inquiry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error: any) {
    console.error('[Admin Inquiry DELETE]', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
