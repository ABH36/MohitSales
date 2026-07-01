import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (!userRole || !['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error('[Admin Inquiries GET]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (!userRole || !['ADMIN', 'EDITOR'].includes(userRole)) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
    }

    await prisma.inquiry.deleteMany({});
    return NextResponse.json({ success: true, message: 'All inquiries cleared successfully.' });
  } catch (error) {
    console.error('[Admin Inquiries DELETE]', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
