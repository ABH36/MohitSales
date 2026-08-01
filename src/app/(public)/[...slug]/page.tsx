import React from 'react';
import { notFound } from 'next/navigation';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import ProductPageWrapper from '@/components/ProductPageWrapper';
import CategoryFilter from '@/components/CategoryFilter';
import SchemaInjector from '@/components/SchemaInjector';
import { sanitizeHtml } from '@/lib/utils';
import { renderDbProduct, renderDbCategory, renderProductLayout, renderHubLanding } from './render';
import { getHubChildren, type HubChild } from '@/lib/landing';
import { breadcrumbBgStyle } from '@/lib/page-banner';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { getProductData, getPageContent } from './data';
import { transformLegacyHtml } from './legacy-html';

// generateMetadata / generateStaticParams live in their own modules to keep
// this route file focused on request-time rendering; re-exported here so Next
// still sees them as named exports of the page.
export { generateMetadata } from './metadata';
export { generateStaticParams } from './static-params';

export const revalidate = 3600; // ISR: revalidate every 1 hour (admin edits trigger instant revalidation via API)
export const dynamicParams = true; // Allow on-demand generation for pages not generated at build time

interface ProductPageProps {
  params: {
    slug: string[];
  } | Promise<{
    slug: string[];
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');

  // Runtime is always DB-driven (build-cache removed). Redirect checks are
  // handled upstream by middleware (/api/public/redirect).
  // Transient DB failures must never look like "page not found": if a read
  // throws, we flag it and (should we otherwise reach the 404) throw instead of
  // calling notFound(), because ISR caches a 404 for the whole revalidate window
  // but does not cache a 500 — so a blip self-heals on the next request rather
  // than pinning a valid page to "Page Not Found" for an hour.
  let dbErrored = false;

  const [dbProductEarlyRaw, product, dbCategoryEarly] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: slugPath },
      include: { category: { include: { parent: { include: { parent: { include: { parent: true } } } } } } }
    }).catch((e) => {
      console.error('[slug:dbProductEarly] Error fetching product early:', e);
      dbErrored = true;
      return null;
    }),
    getProductData(slugPath),
    prisma.category.findUnique({
      where: { slug: slugPath }
    }).catch((e) => {
      console.error('[slug:dbCategoryEarly] Error fetching category early:', e);
      dbErrored = true;
      return null;
    })
  ]);

  const dbProductEarly = (dbCategoryEarly || (dbProductEarlyRaw && (!dbProductEarlyRaw.isActive || dbProductEarlyRaw.stock <= 0))) ? null : dbProductEarlyRaw;
  // getPageContent throws on a transient DB error (vs. returning null for a
  // genuinely absent page); catch it into the same flag so we don't 404.
  let legacyPage: { html: string; heading: string | null } | null = null;
  try {
    legacyPage = await getPageContent(slugPath);
  } catch (e) {
    console.error('[slug:getPageContent] DB error:', e);
    dbErrored = true;
  }
  const legacyHtml = legacyPage?.html ?? null;

  const hasLegacyCards = legacyHtml && (
    legacyHtml.includes('class="cables-card"') ||
    legacyHtml.includes('class="card_box"') ||
    legacyHtml.includes('class="fan_card_box"') ||
    legacyHtml.includes('class="product-card"') ||
    legacyHtml.includes('class="industries-card"') ||
    legacyHtml.includes('class="standard-card"')
  );

  const isIndexPage = (product && product.cards && product.cards.length > 0) || hasLegacyCards;

  // ══════════════════════════════════════════════════════════════════════
  // Extract legacy image & features fallback from HTML if DB/JSON is missing
  // ══════════════════════════════════════════════════════════════════════
  let legacyImage = null;
  let legacyFeatures: string[] = [];
  let hasComplexLegacyHtml = false;
  if (legacyHtml) {
    hasComplexLegacyHtml = legacyHtml.includes('class="feature-card"') || 
                           legacyHtml.includes('class="features-grid"') || 
                           legacyHtml.includes('class="technical-table"');
                           
    try {
      const $ = cheerio.load(legacyHtml, null, false);
      if (dbProductEarly && !dbProductEarly.imageSrc && !product?.imageSrc) {
        legacyImage = $('.product-img img, .single-product-image img, .wires_inner img, img.img-fluid, .feature-image img').first().attr('src') || null;
      }
      
      const dbHasFeatures = dbProductEarly?.features && dbProductEarly.features !== '[]' && dbProductEarly.features !== 'null';
      if (!dbHasFeatures) {
         $('.animated-list li, .features ul li, .features li').each((_, el) => {
             const text = $(el).text().replace(/\s+/g, ' ').trim();
             if (text) legacyFeatures.push(text);
         });
      }
    } catch (e) {}
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 1: DB product always takes priority over legacy PHP.
  // If product exists in DB and this is not a category index page,
  // always render the DB React template — no more isModified check.
  // Exception: If the legacy HTML is a complex custom layout and the DB product
  // has no features (was just auto-seeded), skip to Priority 2 to preserve the layout.
  // ══════════════════════════════════════════════════════════════════════
  const dbHasFeatures = dbProductEarly?.features && dbProductEarly.features !== '[]' && dbProductEarly.features !== 'null';
  const dbHasDescription = dbProductEarly?.description && dbProductEarly.description !== '[]' && dbProductEarly.description !== 'null';
  const dbHasImage = !!(dbProductEarly?.imageSrc && String(dbProductEarly.imageSrc).trim());
  // An auto-seeded "empty shell" product (no image, no features, no description)
  // must NOT hijack a real legacy listing page. e.g. `.../indian-standards` is a
  // standards-index page (a grid of "IS 694 / IS 7098 …" links) that never had a
  // product image — but a blank seeded product row was rendering the single-product
  // "No Image" layout on top of it. When such a shell coincides with legacy HTML,
  // fall through to PRIORITY 2 so the original listing renders instead.
  const dbProductIsEmptyShell = !!dbProductEarly && !dbHasImage && !dbHasFeatures && !dbHasDescription;
  const skipDbTemplate = (hasComplexLegacyHtml && !dbHasFeatures) || (dbProductIsEmptyShell && !!legacyHtml);

  if (dbProductEarly && !isIndexPage && !skipDbTemplate) {
    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        {renderDbProduct(dbProductEarly, product, legacyImage, legacyFeatures)}
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Legacy PHP Content (original site UI for all 2170+ pages)
  // ══════════════════════════════════════════════════════════════════════
  // Falls through here only when PRIORITY 1 (DB product) did not match.
  if (legacyHtml) {
    const { html: finalHtml, crumbsLd: legacyCrumbsLd } = await transformLegacyHtml(legacyHtml, {
      slugPath,
      pageHeading: legacyPage?.heading ?? null,
      dbProductTitle: dbProductEarly?.title ?? null,
      hasLegacyCards: !!hasLegacyCards,
    });

    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        <main className="legacy-php-content">
          {legacyCrumbsLd && <JsonLd data={legacyCrumbsLd} />}
          <div className="legacy-php-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(finalHtml) }} />
          {/* Reads the cards this HTML just rendered and adds filter/sort over
              them. Renders nothing on pages with only a handful of products. */}
          <CategoryFilter />
        </main>
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 3: JSON fallback — PHP file missing/unrenderable but JSON has data
  // ══════════════════════════════════════════════════════════════════════
  if (product) {
    const hasContent = product.heading || product.title ||
      (product.description && product.description.length > 0) ||
      (product.cards && product.cards.length > 0);

    if (hasContent) {
      const cleanLink = (url: string) => {
        let clean = url;
        if (clean.endsWith('.php')) clean = clean.substring(0, clean.length - 4);
        if (!clean.startsWith('/') && !clean.startsWith('http') && !clean.startsWith('mailto:')) {
          clean = '/' + clean;
        }
        return clean;
      };
      const isMultiProduct = product.cards && product.cards.length > 0;
      return (
        <ProductPageWrapper>
          <SchemaInjector page={`/${slugPath}`} />
          <main>
            {/* Legacy JSON layouts carry name-only crumbs, so the schema keeps
                to the compliant two entries: Home + this page. */}
            <JsonLd data={breadcrumbJsonLd([{ name: product.heading || product.title }], `/${slugPath}`)} />
            <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
              <div className="rs-breadcrumb-bg" style={{ backgroundImage: breadcrumbBgStyle(slugPath) }}></div>
              <div className="container">
                <div className="row">
                  <div className="w-full">
                    <div className="rs-breadcrumb-content-wrapper">
                      <div className="rs-breadcrumb-title-wrapper">
                        <h1 className="rs-breadcrumb-title">{product.heading || product.title}</h1>
                      </div>
                      <div className="rs-breadcrumb-menu">
                        <nav><ul>
                          {product.breadcrumbs.map((crumb: string, index: number) => {
                            const isHome = crumb.toLowerCase() === 'home';
                            const isLast = index === product.breadcrumbs.length - 1;
                            return (
                              <li key={index}>
                                <span>
                                  {isHome ? <a href="/">Home</a> : isLast ? crumb : crumb}
                                </span>
                              </li>
                            );
                          })}
                        </ul></nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {renderProductLayout(isMultiProduct, product, cleanLink)}
          </main>
        </ProductPageWrapper>
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 4: DB Product fallback (seeded products with no PHP page)
  // These were auto-seeded; they only show when no PHP/JSON exists for the slug.
  // ══════════════════════════════════════════════════════════════════════
  if (dbProductEarly && !skipDbTemplate) {
    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        {renderDbProduct(dbProductEarly, product, legacyImage, legacyFeatures)}
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 5: Admin Panel Category (Prisma DB exact slug match)
  // Renders a full product listing page for admin-created categories.
  // ══════════════════════════════════════════════════════════════════════
  const dbCategory = await prisma.category.findUnique({
      where: { slug: slugPath },
      include: {
        parent: { include: { parent: { include: { parent: true } } } },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            products: { where: { isActive: true, stock: { gt: 0 } }, orderBy: { sortOrder: 'asc' }, take: 4 },
            _count: { select: { products: true } }
          }
        },
        products: {
          where: { isActive: true, stock: { gt: 0 } },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

  if (dbCategory && dbCategory.isActive) {
    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        {renderDbCategory(dbCategory)}
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 5.5: Hub landing — no row of its own, but it has children.
  // Parent "hub" pages (e.g. /industries/cables-by-application) were never
  // migrated as their own product/category/pageContent row, yet their
  // descendants exist. Render a card grid of the immediate children instead of
  // 404-ing on a page that clearly should exist.
  // ══════════════════════════════════════════════════════════════════════
  const hubChildren = await getHubChildren(slugPath).catch((e): HubChild[] => {
    console.error('[slug:getHubChildren] DB error:', e);
    dbErrored = true;
    return [];
  });
  if (hubChildren.length > 0) {
    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        {renderHubLanding(slugPath, hubChildren)}
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 6: 404
  // ══════════════════════════════════════════════════════════════════════
  // Only reach here having found nothing. If a DB read threw along the way, the
  // "nothing" is untrustworthy — throw a 500 (uncached, retries next request)
  // instead of caching a 404 on what may be a perfectly valid page.
  if (dbErrored) {
    throw new Error(`Transient DB error while resolving /${slugPath}; refusing to cache a 404.`);
  }
  notFound();
}
