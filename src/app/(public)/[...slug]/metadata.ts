import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { extractTagline } from '@/lib/product-specs';
import { getProductData } from './data';

interface ProductPageProps {
  params: { slug: string[] } | Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');

  const cleanPath = `/${slugPath}`;
  const altPath = cleanPath.includes('_')
    ? cleanPath.replace(/_/g, '-')
    : (cleanPath.includes('-') ? cleanPath.replace(/-/g, '_') : null);

  // Runtime is always DB-driven (build-cache removed).
  const [product, seoMeta, dbProduct] = await Promise.all([
    getProductData(slugPath),
    prisma.seoMeta.findFirst({
      where: { page: { in: altPath ? [cleanPath, altPath] : [cleanPath] } }
    }).catch(() => null),
    // title/description are selected too: with no admin-authored meta (none of
    // the 2173 products carry metaTitle/metaDescription) the fallback below used
    // to build the title from the slug, which mangles technical notation —
    // "polycab-mv-cu-bs-6622-63511kv" came out as "Polycab Mv Cu Bs 6622
    // 63511kv" instead of the stored "Polycab MV Cu BS 6622 6.35/11kV".
    prisma.product.findUnique({ where: { slug: slugPath }, select: { metaTitle: true, metaDescription: true, metaKeywords: true, imageSrc: true, title: true, description: true } }).catch(() => null),
  ]);

  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com'}/${slugPath}`;

  // Admin-managed SEO meta takes top priority (only if it has actual content)
  const seoHasContent = seoMeta && (seoMeta.title || seoMeta.description || seoMeta.keywords || seoMeta.ogTitle || seoMeta.ogImage);
  if (seoHasContent) {
    return {
      title: seoMeta.title || undefined,
      description: seoMeta.description || undefined,
      keywords: seoMeta.keywords ? seoMeta.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined,
      robots: { index: !seoMeta.noIndex, follow: !seoMeta.noFollow },
      alternates: seoMeta.canonicalUrl ? { canonical: seoMeta.canonicalUrl } : { canonical: pageUrl },
      openGraph: {
        url: pageUrl,
        title: seoMeta.ogTitle || seoMeta.title || undefined,
        description: seoMeta.description || undefined,
        images: seoMeta.ogImage ? [seoMeta.ogImage] : undefined,
      },
    };
  }

  // The stored description is sometimes a JSON array of paragraphs and sometimes
  // plain text; take the first paragraph either way and trim it to a sane length
  // for a meta description.
  const productDescription = (() => {
    const raw = dbProduct?.description;
    if (!raw || raw === '[]' || raw === 'null') return null;
    let text = raw;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) text = parsed.filter(Boolean).join(' ');
      else text = String(parsed);
    } catch {
      text = raw.split('\n\n').filter(Boolean)[0] || raw;
    }
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) return null;
    return text.length > 300 ? `${text.slice(0, 297).trimEnd()}…` : text;
  })();

  const SITE_SUFFIX = 'Mohit Sales Corporation Pvt. Ltd.';
  const GENERIC_DESCRIPTION = 'Authorized Polycab & Dowells Distributor';

  // A short lead line in the description (e.g. "Electron beam technology 90M
  // housewire") is folded into the <title> so the route carries the product's
  // key selling point for search — richer, more specific titles than the bare
  // product name alone.
  const descLines = (() => {
    const raw = dbProduct?.description;
    if (!raw) return [] as string[];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return String(raw).split('\n\n').filter(Boolean);
    }
  })();
  const tagline = extractTagline(descLines);
  const titleWithTagline = (base: string) =>
    tagline ? `${base} — ${tagline} | ${SITE_SUFFIX}` : `${base} - ${SITE_SUFFIX}`;

  // Product-specific admin-managed SEO meta takes next priority
  if (dbProduct && (dbProduct.metaTitle || dbProduct.metaDescription || dbProduct.metaKeywords)) {
    const title = dbProduct.metaTitle || titleWithTagline(dbProduct.title || product?.heading || product?.title || 'Product');
    const description = dbProduct.metaDescription || productDescription || (product?.description && product.description[0]) || GENERIC_DESCRIPTION;
    return {
      title,
      description,
      keywords: dbProduct.metaKeywords ? dbProduct.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined,
      alternates: { canonical: pageUrl },
      openGraph: {
        url: pageUrl,
        title,
        description,
        images: dbProduct.imageSrc ? [dbProduct.imageSrc] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: dbProduct.imageSrc ? [dbProduct.imageSrc] : [],
      }
    };
  }

  if (product) {
    const title = `${product.heading || product.title} - Mohit Sales Corporation Pvt. Ltd.`;
    const description = (product.description && product.description[0]) || 'Authorized Polycab & Dowells Distributor';
    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        url: pageUrl,
        title,
        description,
        images: product.imageSrc ? [product.imageSrc] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: product.imageSrc ? [product.imageSrc] : [],
      }
    };
  }

  // A real product with no admin-authored meta: use its own stored title and
  // description. Deriving these from the slug (below) destroys the technical
  // notation these names depend on — "6.35/11kV" becomes "63511kv" — so the
  // slug is only ever a last resort for pages with no product row at all.
  if (dbProduct?.title) {
    const title = titleWithTagline(dbProduct.title);
    const description = productDescription || GENERIC_DESCRIPTION;
    const images = dbProduct.imageSrc ? [dbProduct.imageSrc] : [];
    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: { url: pageUrl, title, description, images },
      twitter: { card: 'summary_large_image', title, description, images },
    };
  }

  const parts = resolvedParams.slug;
  const lastPart = parts[parts.length - 1];
  const formattedTitle = lastPart
    .replace(/-/g, ' ')
    .replace(/\.php$/i, '')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${formattedTitle} - ${SITE_SUFFIX}`,
    description: GENERIC_DESCRIPTION,
    alternates: { canonical: pageUrl },
    openGraph: { url: pageUrl },
  };
}
