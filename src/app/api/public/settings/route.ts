import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { isPublic: true },
    });
    
    // Convert settings array into a key-value object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    // Public settings (contact info, social links) change rarely and are fetched
    // client-side on every fresh load — cache at the edge for a minute so we
    // don't hit the DB per visit. Admin edits surface within ~60s.
    const res = NextResponse.json({ success: true, data: settingsMap });
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res;
  } catch (error: any) {
    console.error('[Public Settings GET Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
