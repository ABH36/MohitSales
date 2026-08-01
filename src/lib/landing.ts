import prisma from '@/lib/prisma';

/**
 * Shared logic for "hub" landing pages — the parent category pages (e.g.
 * /fans, /dowells, /industries/cables-by-application) that have no Category
 * row of their own but whose children live in the product/pageContent
 * hierarchy. Both the catch-all route (renderHubLanding) and the fixed static
 * landing pages (CategoryLandingGrid) derive their children from here, so the
 * child lists are DB-driven and reflect admin changes instead of being
 * hardcoded per page.
 */

const ACRONYMS = new Set([
  'it', 'ehv', 'lv', 'mv', 'hv', 'ac', 'dc', 'pvc', 'xlpe', 'led',
  'rccb', 'rcbo', 'mcb', 'accl', 'upvc', 'usb', 'tv', 'rj',
]);

/** "cables-by-application" -> "Cables By Application"; known acronyms upper-cased. */
export function humanizeSegment(slug: string): string {
  const seg = (slug.split('/').pop() || slug).replace(/-/g, ' ');
  return seg.replace(/\b[\w']+/g, (w) =>
    ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1),
  );
}

export interface HubChild {
  slug: string;
  image: string | null;
  count: number;
}

/**
 * Immediate children of a hub slug, grouped from the active products (and
 * pageContent) beneath it, each carrying a representative image and the count
 * of products under it. Returns [] for a genuine leaf so callers can 404.
 */
export async function getHubChildren(slugPath: string): Promise<HubChild[]> {
  const prefix = slugPath + '/';
  const depth = slugPath.split('/').length;
  const immediate = (s: string) => s.split('/').slice(0, depth + 1).join('/');

  const [prods, pcs] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { startsWith: prefix }, isActive: true, stock: { gt: 0 } },
      select: { slug: true, imageSrc: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.pageContent.findMany({
      where: { slug: { startsWith: prefix }, isActive: true },
      select: { slug: true },
    }),
  ]);

  const map = new Map<string, HubChild>();
  for (const pr of prods) {
    const child = immediate(pr.slug);
    if (child === slugPath) continue; // safety: never point at self
    const e = map.get(child) || { slug: child, image: null, count: 0 };
    e.count++;
    if (!e.image && pr.imageSrc) e.image = pr.imageSrc;
    map.set(child, e);
  }
  for (const pc of pcs) {
    const child = immediate(pc.slug);
    if (child === slugPath || map.has(child)) continue;
    map.set(child, { slug: child, image: null, count: 0 });
  }
  return [...map.values()];
}

const LANDING_FALLBACK =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

export interface LandingItem {
  title: string;
  image: string;
  link: string;
}

/**
 * The hub's children shaped for CategoryLandingGrid (title / image / link),
 * alphabetically ordered. Used by the static landing pages so their card lists
 * come from the DB instead of a hardcoded array.
 */
export async function getLandingItems(hubSlug: string): Promise<LandingItem[]> {
  const children = await getHubChildren(hubSlug);
  return children
    .map((c) => ({
      title: humanizeSegment(c.slug),
      image: c.image || LANDING_FALLBACK,
      link: `/${c.slug}`,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
