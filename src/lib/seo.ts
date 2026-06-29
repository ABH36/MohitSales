import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function getSeoMetadata(pagePath: string, fallback: Metadata): Promise<Metadata> {
  try {
    const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
    
    // Look up both exact path and underscore/hyphen alternate versions
    const altPath = cleanPath.includes('_') 
      ? cleanPath.replace(/_/g, '-') 
      : (cleanPath.includes('-') ? cleanPath.replace(/-/g, '_') : null);

    const seoMeta = await prisma.seoMeta.findFirst({
      where: {
        page: {
          in: altPath ? [cleanPath, altPath] : [cleanPath]
        }
      }
    }).catch(() => null);

    if (!seoMeta) return fallback;

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
        : fallback.alternates || undefined,
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
