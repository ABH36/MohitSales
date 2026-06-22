import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { LRUCache } from 'lru-cache';

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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohit.bdm.co.in';

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

  // 2. Generate dynamic routes from JSON file (legacy content)
  let jsonRoutes: MetadataRoute.Sitemap = [];
  try {
    const jsonPath = path.join(process.cwd(), 'content-export.json');
    if (fs.existsSync(jsonPath)) {
      const rawData = await fs.promises.readFile(jsonPath, 'utf-8');
      const dataList = JSON.parse(rawData);

      jsonRoutes = dataList
        .map((item: any) => {
          // Clean path: "cable-terminal/aluminium.php" -> "/cable-terminal/aluminium"
          const cleanPath = item.path.replace(/\.php$/i, '').trim();
          return {
            url: `${baseUrl}/${cleanPath}`,
            pathKey: cleanPath.toLowerCase(),
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          };
        })
        .filter((route: any) => !excludedSlugs.has(route.pathKey))
        .map((route: any) => {
          const { pathKey, ...rest } = route;
          return rest;
        });
    }
  } catch (error) {
    console.error('Error generating sitemap JSON routes:', error);
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

  // 4. Combine and Deduplicate by URL
  const allRoutes = [...staticRoutes, ...jsonRoutes, ...dbRoutes];
  const uniqueUrls = new Set<string>();
  const uniqueRoutes: MetadataRoute.Sitemap = [];

  for (const route of allRoutes) {
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
