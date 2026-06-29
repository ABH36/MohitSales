import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

    // 1. Static routes
    const staticPaths = [
      { path: '', priority: 1.0, changefreq: 'daily' },
      { path: '/about-us', priority: 0.8, changefreq: 'monthly' },
      { path: '/contact-us', priority: 0.8, changefreq: 'monthly' },
      { path: '/company-profile', priority: 0.7, changefreq: 'monthly' },
      { path: '/feedback', priority: 0.5, changefreq: 'monthly' },
      { path: '/catalogue', priority: 0.8, changefreq: 'weekly' },
      { path: '/certificates', priority: 0.6, changefreq: 'monthly' },
      { path: '/achievements', priority: 0.6, changefreq: 'monthly' },
      { path: '/resources', priority: 0.7, changefreq: 'weekly' },
      { path: '/blog', priority: 0.7, changefreq: 'weekly' },
      { path: '/pricelist', priority: 0.8, changefreq: 'weekly' },
      { path: '/polycab', priority: 0.8, changefreq: 'weekly' },
      { path: '/dowells', priority: 0.8, changefreq: 'weekly' },
      { path: '/cable-terminal', priority: 0.7, changefreq: 'weekly' },
      { path: '/fans', priority: 0.7, changefreq: 'weekly' },
      { path: '/gland', priority: 0.7, changefreq: 'weekly' },
      { path: '/solar', priority: 0.7, changefreq: 'weekly' },
      { path: '/switchgears', priority: 0.7, changefreq: 'weekly' },
      { path: '/home-appliances', priority: 0.7, changefreq: 'weekly' },
      { path: '/conduit-accessories', priority: 0.7, changefreq: 'weekly' },
      { path: '/crimping-tool', priority: 0.7, changefreq: 'weekly' },
    ];

    // 2. Fetch all active products, categories, blogs from DB
    const [products, categories, blogs] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0 } },
        select: { slug: true, title: true, updatedAt: true }
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: { slug: true, name: true, updatedAt: true }
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, title: true, updatedAt: true }
      })
    ]);

    // 3. Load JSON legacy content
    let jsonProducts: { slug: string; updatedAt: Date }[] = [];
    try {
      const jsonPath = path.join(process.cwd(), 'content-export.json');
      if (fs.existsSync(jsonPath)) {
        const rawData = await fs.promises.readFile(jsonPath, 'utf-8');
        const dataList = JSON.parse(rawData);
        jsonProducts = dataList.map((item: any) => ({
          slug: item.path.replace(/\.php$/i, '').trim(),
          updatedAt: new Date()
        }));
      }
    } catch { /* ignore */ }

    // 4. Fetch sitemap overrides
    const overrides = await prisma.sitemapOverride.findMany();
    const overrideMap = new Map(overrides.map(o => [o.urlPath, o]));

    // 5. Collect all URLs
    const allUrls: Array<{ url: string; lastmod: string; changefreq: string; priority: number; type: string; title?: string }> = [];
    const seenUrls = new Set<string>();

    const addUrl = (urlPath: string, lastmod: Date, changefreq: string, priority: number, type: string, title?: string) => {
      const normalizedPath = urlPath.toLowerCase();
      if (seenUrls.has(normalizedPath)) return;

      const ov = overrideMap.get(urlPath);
      if (ov?.isExcluded) return;

      seenUrls.add(normalizedPath);
      allUrls.push({
        url: `${baseUrl}${urlPath}`,
        lastmod: (lastmod || new Date()).toISOString().split('T')[0],
        changefreq: ov?.changeFreq || changefreq,
        priority: ov?.priority ?? priority,
        type,
        title: title || urlPath
      });
    };

    // Static pages
    for (const sp of staticPaths) {
      addUrl(sp.path || '/', new Date(), sp.changefreq, sp.priority, 'Static Page', sp.path || 'Home');
    }

    // Categories
    for (const cat of categories) {
      addUrl(`/${cat.slug}`, cat.updatedAt, 'weekly', 0.7, 'Category', cat.name);
    }

    // Products (DB)
    for (const prod of products) {
      addUrl(`/${prod.slug}`, prod.updatedAt, 'weekly', 0.6, 'Product', prod.title);
    }

    // Products (JSON legacy)
    for (const jp of jsonProducts) {
      addUrl(`/${jp.slug}`, jp.updatedAt, 'monthly', 0.5, 'Legacy Product', jp.slug);
    }

    // Blogs
    for (const blog of blogs) {
      addUrl(`/blog/${blog.slug}`, blog.updatedAt, 'weekly', 0.5, 'Blog', blog.title);
    }

    // Check format param
    const format = req.nextUrl.searchParams.get('format') || 'json';

    if (format === 'xml') {
      // Generate XML sitemap
      const xmlEntries = allUrls.map(entry =>
        `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`
      ).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`;

      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="sitemap.xml"'
        }
      });
    }

    // Default: JSON response for admin preview
    return NextResponse.json({
      success: true,
      data: {
        totalUrls: allUrls.length,
        urls: allUrls,
        generatedAt: new Date().toISOString(),
        stats: {
          static: allUrls.filter(u => u.type === 'Static Page').length,
          categories: allUrls.filter(u => u.type === 'Category').length,
          products: allUrls.filter(u => u.type === 'Product').length,
          legacyProducts: allUrls.filter(u => u.type === 'Legacy Product').length,
          blogs: allUrls.filter(u => u.type === 'Blog').length,
        }
      }
    });
  } catch (error: any) {
    console.error('Sitemap generate error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
