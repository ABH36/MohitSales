import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

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
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

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
