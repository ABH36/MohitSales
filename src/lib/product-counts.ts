import prisma from '@/lib/prisma';

interface SlugRow {
  slug: string;
  features: string | null;
}

/**
 * How many product cards a multi-product page holds. Some listings are a single
 * product row whose `features` is a JSON array of card objects (e.g.
 * cable-terminal/copper shows 17 cards from one row) rather than many separate
 * rows — so a plain row count would report 1 where a visitor sees 17.
 */
export function cardCountOf(features: string | null): number {
  if (!features) return 0;
  try {
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
      return parsed.length;
    }
  } catch {
    /* not JSON cards */
  }
  return 0;
}

/**
 * The count shown as "View Products (N)" on a category card, for each slug:
 *  - if product rows live *under* the slug (slug + "/…"), N is their number
 *    (the sub-ranges / products, matching the DB-category card convention);
 *  - otherwise, if the slug is itself a multi-product row, N is its card count;
 *  - a plain leaf product counts as 1; nothing found is 0.
 */
export function countFromRows(rows: SlugRow[], slugs: string[]): Record<string, number> {
  const bySlug = new Map(rows.map((r) => [r.slug, r] as const));
  const out: Record<string, number> = {};
  for (const s of [...new Set(slugs.filter(Boolean))]) {
    const prefix = s.endsWith('/') ? s : s + '/';
    let under = 0;
    for (const r of rows) if (r.slug.startsWith(prefix)) under++;
    if (under > 0) {
      out[s] = under;
      continue;
    }
    const self = bySlug.get(s);
    out[s] = self ? cardCountOf(self.features) || 1 : 0;
  }
  return out;
}

/**
 * Loads every active product's slug + features once and returns the
 * "View Products (N)" count for each requested slug. One query total.
 */
export async function productCountsBySlug(
  slugs: string[],
): Promise<Record<string, number>> {
  const uniq = [...new Set(slugs.filter(Boolean))];
  if (uniq.length === 0) return {};
  const rows = await prisma.product
    .findMany({ where: { isActive: true }, select: { slug: true, features: true } })
    .catch(() => [] as SlugRow[]);
  return countFromRows(rows, uniq);
}
