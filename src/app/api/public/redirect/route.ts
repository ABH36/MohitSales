import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const redirectCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const path = new URL(request.url).searchParams.get('path') || '/';

    const cached = redirectCache.get(path);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const found = await prisma.redirect.findFirst({
      where: { fromPath: path, isActive: true },
      select: { id: true, toPath: true, type: true },
    });

    let responseData;
    if (found) {
      prisma.redirect.update({
        where: { id: found.id },
        data: { hitCount: { increment: 1 } },
      }).catch(() => null);
      responseData = { redirect: { toPath: found.toPath, type: found.type } };
    } else {
      responseData = { redirect: null };
    }

    redirectCache.set(path, { data: responseData, expires: Date.now() + CACHE_TTL });

    if (redirectCache.size > 5000) {
      const now = Date.now();
      for (const [key, val] of redirectCache) {
        if (val.expires < now) redirectCache.delete(key);
      }
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ redirect: null });
  }
}
