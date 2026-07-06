import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

// Metadata routes must live at the app root (not inside the (public) route group)
// or the [...slug] catch-all shadows them — /robots.txt was falling through to
// the catch-all and returning the not-found HTML page. Revalidate hourly so an
// admin-managed robots update is picked up without a redeploy.
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

  // Try fetching admin-managed rules from DB first
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'seo_robots_txt' } });
    if (setting?.value) {
      const rules: Array<{
        userAgent: string;
        allow: string[];
        disallow: string[];
        crawlDelay?: number;
      }> = JSON.parse(setting.value);

      if (Array.isArray(rules) && rules.length > 0) {
        return {
          rules: rules.map(r => ({
            userAgent: r.userAgent || '*',
            allow: r.allow?.length ? r.allow : undefined,
            disallow: r.disallow?.length ? r.disallow : undefined,
            crawlDelay: r.crawlDelay,
          })),
          sitemap: `${baseUrl}/sitemap.xml`,
        } as MetadataRoute.Robots;
      }
    }
  } catch {
    // fall through to static default
  }

  // Static fallback
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
