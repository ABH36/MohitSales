import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

/** Canonical production origin — single source of truth for absolute URLs. */
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

/** Tag used to bust the cached SEO rows when an admin edits meta. */
export const SEO_META_TAG = 'seo-meta';

/**
 * Cached SeoMeta row lookup. Tagged `seo-meta` so the admin meta API can
 * revalidate it on change, with a 1h fallback TTL. Avoids a DB query on every
 * force-dynamic page render.
 */
function getCachedSeoRow(paths: string[]) {
  return unstable_cache(
    () => prisma.seoMeta.findFirst({ where: { page: { in: paths } } }).catch(() => null),
    ['seo-meta', ...paths],
    { tags: [SEO_META_TAG], revalidate: 3600 },
  )();
}

export async function getSeoMetadata(pagePath: string, fallback: Metadata): Promise<Metadata> {
  try {
    const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
    // Self-referencing canonical by default (best practice); DB value or an
    // explicit fallback canonical still win.
    const defaultCanonical = `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;

    // Look up both exact path and underscore/hyphen alternate versions
    const altPath = cleanPath.includes('_')
      ? cleanPath.replace(/_/g, '-')
      : (cleanPath.includes('-') ? cleanPath.replace(/-/g, '_') : null);

    const seoMeta = await getCachedSeoRow(altPath ? [cleanPath, altPath] : [cleanPath]);

    // No admin SEO row: use the caller's fallback, but fill in the pieces most
    // callers leave out. Most pages pass only title/description, and without an
    // explicit openGraph.title Next inherits the root layout's — so sharing
    // /about-us showed the homepage's title in the link preview while the page's
    // own <title> was correct. Only the branch below (a real SEO row) used to set
    // these, so pages with no row never got them.
    if (!seoMeta) {
      const fbTitle = typeof fallback.title === 'string' ? fallback.title : undefined;
      const fbDescription =
        typeof fallback.description === 'string' ? fallback.description : undefined;

      return {
        ...fallback,
        alternates: fallback.alternates || { canonical: defaultCanonical },
        // Left untouched when there is nothing to add, so a page that sets none
        // of this keeps inheriting the layout defaults rather than being handed
        // an empty object.
        ...(fbTitle || fallback.openGraph
          ? {
              openGraph: {
                ...(fallback.openGraph || {}),
                title: (fallback.openGraph?.title as string) || fbTitle,
                description: (fallback.openGraph?.description as string) || fbDescription,
              },
            }
          : {}),
        ...(fbTitle || fallback.twitter
          ? {
              twitter: {
                ...(fallback.twitter || {}),
                title: (fallback.twitter?.title as string) || fbTitle,
                description: (fallback.twitter?.description as string) || fbDescription,
              },
            }
          : {}),
      };
    }

    return {
      title: seoMeta.title || (fallback.title as string) || undefined,
      description: seoMeta.description || (fallback.description as string) || undefined,
      keywords: seoMeta.keywords 
        ? seoMeta.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) 
        : (fallback.keywords as string[]) || undefined,
      robots: { 
        index: !seoMeta.noIndex, 
        follow: !seoMeta.noFollow 
      },
      alternates: seoMeta.canonicalUrl
        ? { canonical: seoMeta.canonicalUrl }
        : fallback.alternates || { canonical: defaultCanonical },
      openGraph: {
        ...(fallback.openGraph || {}),
        title: seoMeta.ogTitle || seoMeta.title || (fallback.openGraph?.title as string) || undefined,
        description: seoMeta.description || (fallback.openGraph?.description as string) || undefined,
        images: seoMeta.ogImage 
          ? [seoMeta.ogImage] 
          : (fallback.openGraph?.images as any) || undefined,
      },
      twitter: {
        ...(fallback.twitter || {}),
        title: seoMeta.ogTitle || seoMeta.title || (fallback.twitter?.title as string) || undefined,
        description: seoMeta.description || (fallback.twitter?.description as string) || undefined,
        images: seoMeta.ogImage ? [seoMeta.ogImage] : (fallback.twitter?.images as any) || undefined,
      }
    };
  } catch (error) {
    console.error(`[getSeoMetadata] Error fetching SEO for ${pagePath}:`, error);
    return fallback;
  }
}
