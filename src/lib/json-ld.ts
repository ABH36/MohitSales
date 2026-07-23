/**
 * Kept dependency-free (no @/lib/seo import — that module pulls in prisma,
 * which must never reach a client bundle; these builders are used from client
 * pages like contact-us too). NEXT_PUBLIC_ vars are inlined on both sides.
 */
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

/**
 * Shared JSON-LD builders — the single place structured data is shaped
 * (site-wide Organization/WebSite lives in <OrganizationSchema />; admin
 * overrides come from the SchemaMarkup table via <SchemaInjector />).
 *
 * Rendered with <JsonLd data={…} /> so the escaping lives in one component.
 */

export interface Crumb {
  name: string;
  /** Site-relative path ("/fans/ceiling-fans"). Omit for the current page. */
  path?: string;
}

/**
 * BreadcrumbList matching the visual breadcrumb trail. "Home" is added
 * automatically; pass the remaining crumbs in order, the last one being the
 * current page (its `path` may be omitted and `currentPath` is used).
 */
export function breadcrumbJsonLd(crumbs: Crumb[], currentPath: string) {
  const items = [{ name: 'Home', path: '' }, ...crumbs];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path ?? currentPath}`,
    })),
  };
}

/**
 * Product schema for a catalogue product. Deliberately carries NO offers/price
 * — this is a B2B distributor site that never publishes prices; enquiries are
 * the conversion. Brand is inferred from the slug (dowells/* vs everything
 * else, which is the Polycab range).
 */
export function productJsonLd(p: {
  title: string;
  slug: string;
  description?: string | null;
  imageSrc?: string | null;
  categoryName?: string | null;
}) {
  const brand = p.slug.startsWith('dowells') ? 'Dowells' : 'Polycab';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    url: `${SITE_URL}/${p.slug}`,
    ...(p.imageSrc ? { image: p.imageSrc } : {}),
    ...(p.description ? { description: p.description.slice(0, 300) } : {}),
    ...(p.categoryName ? { category: p.categoryName } : {}),
    brand: { '@type': 'Brand', name: brand },
    manufacturer: { '@type': 'Organization', name: brand },
  };
}
