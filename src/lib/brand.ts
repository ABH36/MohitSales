/**
 * Which brand a product/category belongs to, from its slug's first segment.
 * Dowells owns the terminal/gland/crimping ranges; everything else on the
 * site is Polycab. Used for the wordmark on the shared product cards
 * (.hce-card-brand). Plain module — safe to import from client pages.
 */
const DOWELLS_ROOTS = new Set(['dowells', 'cable-terminal', 'gland', 'crimping-tool']);

export function brandFromSlug(slug: string | null | undefined): 'polycab' | 'dowells' {
  const root = (slug || '').replace(/^\//, '').split('/')[0].toLowerCase();
  return DOWELLS_ROOTS.has(root) ? 'dowells' : 'polycab';
}
