import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { LRUCache } from 'lru-cache';
import { isRedirectedPath } from '@/lib/seo-routes';

const sitemapCache = new LRUCache<string, MetadataRoute.Sitemap>({
  max: 1,
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const CACHE_KEY = 'full-sitemap';
  const cachedSitemap = sitemapCache.get(CACHE_KEY);
  if (cachedSitemap) {
    return cachedSitemap;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

  // 1. Static routes (All core navigation routes)
  const staticPaths = [
    '',
    '/about-us',
    '/contact-us',
    '/feedback',
    '/catalogue',
    '/certificates',
    '/achievements',
    '/resources',
    '/blog',
    '/polycab',
    '/dowells',
    '/cable-terminal',
    '/fans',
    '/gland',
    '/solar',
    '/switchgears',
    '/home-appliances',
    '/conduit-accessories',
    '/pricelist',
    '/crimping-tool',
    '/conduit-catalogue',
    '/cables-catalogue',
    '/fans-catalogue',
    '/home-appliances-catalogue',
    '/solar-catalogue',
    '/switchgear-catalogue'
  ];

  const staticRoutes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Load excluded slugs (inactive or out of stock products in DB)
  const excludedSlugs = new Set<string>();
  try {
    const inactiveOrOutOfStock = await prisma.product.findMany({
      where: {
        OR: [
          { isActive: false },
          { stock: { lte: 0 } }
        ]
      },
      select: { slug: true }
    });
    inactiveOrOutOfStock.forEach(p => excludedSlugs.add(p.slug.toLowerCase().trim()));
  } catch (error) {
    console.error('Error fetching inactive/out of stock products for exclusion:', error);
  }

  // 2. Dynamic routes from the PageContent table (the ~4,339 stored HTML pages).
  // This is authoritative and covers every content page (the old content-export.json
  // source was removed and no longer exists). Two exclusions:
  //   • slugs matching a permanent redirect (polycab/cables-by-* → industries/*
  //     in next.config.js) — including them would list URLs that 308-redirect;
  //   • inactive / out-of-stock product slugs (excludedSlugs), so we never point
  //     crawlers at a page the product routes intentionally drop.
  // Overlaps with static/product/category routes are merged by the URL de-dup
  // in step 4, so listing every active page here is safe.
  let pageContentRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.pageContent.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    pageContentRoutes = pages
      .filter((p) => {
        const key = p.slug.toLowerCase().trim();
        return !isRedirectedPath(key) && !excludedSlugs.has(key);
      })
      .map((p) => ({
        url: `${baseUrl}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error('Error generating sitemap PageContent routes:', error);
  }

  // 3. Generate dynamic routes from Database (Products, Categories, and Blogs)
  let dbRoutes: MetadataRoute.Sitemap = [];
  try {
    const [products, categories, blogs] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0 } },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
      })
    ]);

    const productRoutes = products.map(p => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const categoryRoutes = categories.map(c => ({
      url: `${baseUrl}/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const blogRoutes = blogs.map(b => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    dbRoutes = [...productRoutes, ...categoryRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap DB routes:', error);
  }

  // 4. Combine, drop URLs that permanently redirect, and de-duplicate by URL.
  // The redirect filter runs on ALL sources (not just pageContent) because a
  // product/category can also carry a redirected slug — e.g. the bare
  // `polycab/cables-by-*` section pages exist as products but 308 to
  // /industries/* (next.config.js). Listing a redirecting URL in the sitemap is
  // a crawl-hygiene error, so exclude the whole redirected subtree + legacy
  // homepage aliases here.
  const allRoutes = [...staticRoutes, ...pageContentRoutes, ...dbRoutes];
  const uniqueUrls = new Set<string>();
  const uniqueRoutes: MetadataRoute.Sitemap = [];

  for (const route of allRoutes) {
    if (isRedirectedPath(route.url)) continue;
    const urlLower = route.url.toLowerCase();
    if (!uniqueUrls.has(urlLower)) {
      uniqueUrls.add(urlLower);
      uniqueRoutes.push(route);
    }
  }

  // 5. Apply admin-managed SitemapOverrides (priority, changeFreq, exclusions)
  let finalRoutes = uniqueRoutes;
  try {
    const overrides = await prisma.sitemapOverride.findMany();
    if (overrides.length > 0) {
      const overrideMap = new Map(overrides.map(o => [o.urlPath, o]));

      finalRoutes = uniqueRoutes
        .filter(route => {
          const urlPath = route.url.replace(baseUrl, '') || '/';
          const ov = overrideMap.get(urlPath);
          return !ov?.isExcluded;
        })
        .map(route => {
          const urlPath = route.url.replace(baseUrl, '') || '/';
          const ov = overrideMap.get(urlPath);
          if (!ov) return route;
          return {
            ...route,
            priority: ov.priority,
            changeFrequency: ov.changeFreq as MetadataRoute.Sitemap[number]['changeFrequency'],
          };
        });
    }
  } catch {
    // fail open — use uniqueRoutes as-is
    finalRoutes = uniqueRoutes;
  }

  sitemapCache.set(CACHE_KEY, finalRoutes);
  return finalRoutes;
}
