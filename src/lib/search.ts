import prisma from '@/lib/prisma';

/**
 * Product search shared by the API route and the /search page, so both rank and
 * de-duplicate identically — a result list that disagrees with its own API is
 * worse than no search at all.
 */

export const SEARCH_MIN_QUERY = 2;
export const SEARCH_MAX_LIMIT = 50;

export interface SearchResult {
  title: string;
  slug: string;
  imageSrc: string | null;
}

export async function searchProducts(query: string, limit = 20): Promise<SearchResult[]> {
  const q = (query || '').trim();
  if (q.length < SEARCH_MIN_QUERY) return [];

  const capped = Math.min(limit, SEARCH_MAX_LIMIT);

  // AND the terms so "polycab 11kv" narrows rather than widens.
  const terms = q.split(/\s+/).filter(Boolean).slice(0, 6);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      AND: terms.map((t) => ({ title: { contains: t, mode: 'insensitive' as const } })),
    },
    select: { title: true, slug: true, imageSrc: true },
    // The same product sits under several taxonomy branches, so over-fetch and
    // collapse by title below.
    take: capped * 4,
    orderBy: { title: 'asc' },
  });

  const seen = new Set<string>();
  const deduped = products.filter((p) => {
    const key = p.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Titles beginning with the query are the stronger match.
  const lower = q.toLowerCase();
  deduped.sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(lower) ? 0 : 1;
    const bStarts = b.title.toLowerCase().startsWith(lower) ? 0 : 1;
    return aStarts - bStarts || a.title.localeCompare(b.title);
  });

  return deduped.slice(0, capped);
}
