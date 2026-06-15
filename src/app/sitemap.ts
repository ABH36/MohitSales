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
    '/polycab',
    '/dowells',
    '/cable-terminal',
    '/fans',
    '/gland',
    '/solar',
    '/switchgears',
    '/home-appliances',
    '/conduit-accessories'
  ];

  const staticRoutes = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Generate dynamic routes from JSON file (legacy content)
  let jsonRoutes: MetadataRoute.Sitemap = [];
  try {
    const jsonPath = path.join(process.cwd(), 'content-export.json');
    if (fs.existsSync(jsonPath)) {
      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const dataList = JSON.parse(rawData);

      jsonRoutes = dataList.map((item: any) => {
        // Clean path: "cable-terminal/aluminium.php" -> "/cable-terminal/aluminium"
        const cleanPath = item.path.replace(/\.php$/i, '');
        return {
          url: `${baseUrl}/${cleanPath}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      });
    }
  } catch (error) {
    console.error('Error generating sitemap JSON routes:', error);
  }

  // 3. Generate dynamic routes from Database (Products and Categories)
  let dbRoutes: MetadataRoute.Sitemap = [];
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true }
      }),
      prisma.category.findMany({
        where: { isActive: true },
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

    dbRoutes = [...productRoutes, ...categoryRoutes];
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

  sitemapCache.set(CACHE_KEY, uniqueRoutes);
  return uniqueRoutes;
}
