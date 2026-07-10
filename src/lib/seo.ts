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

    // No admin SEO row: use the caller's fallback but ensure a self-referencing
    // canonical exists (many landing pages pass only title/description).
    if (!seoMeta) {
      return fallback.alternates ? fallback : { ...fallback, alternates: { canonical: defaultCanonical } };
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
