import prisma from '@/lib/prisma';

/**
 * Pre-render params are the union of active slugs across the three content
 * tables (pageContent, product, category). Only the slug is used, so we select
 * just that — the previous version fetched deep category/product includes and
 * built half a dozen lookup maps that nothing here ever read.
 *
 * With `dynamicParams = true` everything is generated on demand anyway, so this
 * list is only a pre-render hint.
 */
export async function generateStaticParams() {
  try {
    const [pageContents, products, categories] = await Promise.all([
      prisma.pageContent.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { slug: true } }),
    ]);

    const allSlugs = new Set<string>();
    for (const { slug } of [...pageContents, ...products, ...categories]) {
      if (slug) allSlugs.add(slug);
    }

    return Array.from(allSlugs).map((slug) => ({ slug: slug.split('/').filter(Boolean) }));
  } catch (error) {
    console.error('[generateStaticParams] Database connection failed (expected during docker build):', error);
    return [];
  }
}
