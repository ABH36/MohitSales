import prisma from '@/lib/prisma';

/**
 * Maps a public slug back to the legacy export's path so a PageContent row
 * stored under the old structure still resolves. Handles the polycab/dowells
 * prefixes, the flattened cables-by-application sub-levels, and a couple of
 * one-off renames.
 */
export function getLegacyPath(slugPath: string): string {
  let clean = slugPath.toLowerCase();

  if (clean.startsWith('polycab/cables-by-')) {
    clean = clean.replace('polycab/cables-by-', 'industries/cables-by-');
  } else if (clean.startsWith('polycab/')) {
    clean = clean.substring('polycab/'.length);
  } else if (clean.startsWith('dowells/')) {
    clean = clean.substring('dowells/'.length);
  }

  // Handle nested cables-by-application segment removals
  clean = clean.replace('cables-by-application/building-infrastructure/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/energy-and-power-grid/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/exploration-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/manufacturing-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/mobility-infrastructure/', 'cables-by-application/');

  // Handle conduit-and-accessories mapping
  clean = clean.replace('conduit-and-accessories', 'conduit-accessories');

  // Handle air-circulator-fans mapping
  clean = clean.replace('fans/air-circulator-fans', 'fans/air-circulator');

  return clean;
}

// content-export.json removed — the database (products + pageContent) is now
// authoritative and fully covers every slug. Kept as a no-op so the handful of
// call sites stay untouched; `product` is always null and handled by the
// null-safe rendering paths (verified: identical output).
export async function getProductData(_slugPath: string): Promise<any> {
  return null;
}

// ── DB lookup for page content (PageContent table; 4,339 pages) ──────────
// Returns the row's `heading` alongside the HTML: 73 of those pages were
// exported with their *section* name in the banner ("Home Appliances" on the
// Coolers page) while the row's own heading is correct, so the caller needs
// both to put the right title on screen.
export async function getPageContent(
  slugPath: string
): Promise<{ html: string; heading: string | null } | null> {
  try {
    let pageContent = await prisma.pageContent.findUnique({
      where: { slug: slugPath }
    });
    if (!pageContent) {
      const legacyPath = getLegacyPath(slugPath);
      pageContent = await prisma.pageContent.findFirst({
        where: { legacyPath: legacyPath }
      });
    }
    if (!pageContent || !pageContent.isActive) return null;
    return { html: pageContent.htmlContent, heading: pageContent.heading };
  } catch (e) {
    // A thrown error here is a TRANSIENT DB failure, not a missing page. Let it
    // propagate (the caller turns it into a 500, which ISR does not cache) so we
    // never serve a cacheable 404 for a page that actually exists. A genuine
    // "no such page" returns null above without throwing.
    console.error('[getPageContent] DB error:', e);
    throw e;
  }
}
