/**
 * Single source of truth for "which paths permanently redirect" — mirrors the
 * redirect rules in next.config.js so the sitemap never lists a URL that 308s.
 *
 * Covered:
 *   • the polycab/cables-by-{application,type,standards} subtree AND the bare
 *     section pages (they redirect to the canonical /industries/* equivalents);
 *   • the legacy /index and /index-old homepage aliases.
 */
export const REDIRECTED_PREFIX = /^polycab\/cables-by-(application|type|standards)(\/|$)/i;

/** True when `path` (a slug or an absolute/relative URL path) permanently redirects. */
export function isRedirectedPath(path: string): boolean {
  const p = path.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '').toLowerCase().trim();
  return REDIRECTED_PREFIX.test(p) || p === 'index' || p === 'index-old';
}
