import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { searchProducts, SEARCH_MAX_LIMIT } from '@/lib/search';

export const dynamic = 'force-dynamic';

/**
 * Product search for the public site — powers the header search box.
 *
 * Ranking and de-duplication live in @/lib/search so this route and the /search
 * page can never drift apart. Results are cached briefly because the header
 * fires a request per keystroke burst.
 */
const CACHE_TTL = 5 * 60 * 1000; // matches the other public routes
const cache = new Map<string, { data: unknown; expires: number }>();

function readCache(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires <= Date.now()) { cache.delete(key); return null; }
  return hit.data;
}

function writeCache(key: string, data: unknown) {
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) if (v.expires <= now) cache.delete(k);
    if (cache.size > 500) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const q = (params.get('q') || '').trim();
    const limit = Math.min(parseInt(params.get('limit') || '20', 10) || 20, SEARCH_MAX_LIMIT);

    const cacheKey = `${q.toLowerCase()}::${limit}`;
    const cached = readCache(cacheKey);
    if (cached) return NextResponse.json(cached);

    const results = await searchProducts(q, limit);
    const payload = { success: true, query: q, count: results.length, results };
    writeCache(cacheKey, payload);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[public/search] error:', err);
    // Fail soft — a broken search must not break the header it lives in.
    return NextResponse.json({ success: false, query: '', count: 0, results: [] });
  }
}
