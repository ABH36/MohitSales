import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { LRUCache } from 'lru-cache';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import ProductPageWrapper from '@/components/ProductPageWrapper';
import SchemaInjector from '@/components/SchemaInjector';
import { sanitizeHtml } from '@/lib/utils';

export const revalidate = 3600; // ISR: revalidate every 1 hour (admin edits trigger instant revalidation via API)

// Module-level LRU cache: holds parsed content-export.json for 1 hour
const contentCache = new LRUCache<string, any[]>({
  max: 1,
  ttl: 60 * 60 * 1000,
});

interface ProductPageProps {
  params: {
    slug: string[];
  };
}

// Function to read and cache JSON content
function getLegacyPath(slugPath: string): string {
  let clean = slugPath.toLowerCase();

  if (clean.startsWith('polycab/cables-by-')) {
    clean = clean.replace('polycab/cables-by-', 'industries/cables-by-');
  } else if (clean.startsWith('polycab/')) {
    clean = clean.substring('polycab/'.length);
  } else if (clean.startsWith('dowells/')) {
    clean = clean.substring('dowells/'.length);
  }

  // Handle nested cables-by-application segment removals
  clean = clean.replace('cables-by-application/building-infrastructure/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/energy-and-power-grid/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/exploration-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/manufacturing-industries/', 'cables-by-application/');
  clean = clean.replace('cables-by-application/mobility-infrastructure/', 'cables-by-application/');

  // Handle conduit-and-accessories mapping
  clean = clean.replace('conduit-and-accessories', 'conduit-accessories');

  // Handle air-circulator-fans mapping
  clean = clean.replace('fans/air-circulator-fans', 'fans/air-circulator');

  return clean;
}

async function getProductData(slugPath: string) {
  try {
    const CACHE_KEY = 'content-export';
    let dataList = contentCache.get(CACHE_KEY);

    if (!dataList) {
      const jsonPath = path.join(process.cwd(), 'content-export.json');
      const jsonExists = await fs.promises.access(jsonPath).then(() => true).catch(() => false);
      if (!jsonExists) return null;
      dataList = JSON.parse(await fs.promises.readFile(jsonPath, 'utf-8'));
      contentCache.set(CACHE_KEY, dataList!);
    }

    // Try 1: Exact match
    const matchPath = slugPath.endsWith('.php') ? slugPath : `${slugPath}.php`;
    let found = dataList!.find((item: any) => item.path.toLowerCase() === matchPath.toLowerCase());
    if (found) return found;

    // Try 2: Map using legacy path helper
    const legacyPath = getLegacyPath(slugPath);
    const matchLegacyPath = legacyPath.endsWith('.php') ? legacyPath : `${legacyPath}.php`;
    found = dataList!.find((item: any) => item.path.toLowerCase() === matchLegacyPath.toLowerCase());
    if (found) return found;

    // Try 3: Match by final filename + parent directory (prevents cross-category false matches)
    const slugParts = slugPath.split('/');
    const lastPart = slugParts[slugParts.length - 1].toLowerCase();
    const parentPart = slugParts.length >= 2 ? slugParts[slugParts.length - 2].toLowerCase() : '';

    found = dataList!.find((item: any) => {
      const itemParts = item.path.replace(/\.php$/, '').split('/');
      const itemLastPart = itemParts[itemParts.length - 1].toLowerCase();
      if (itemLastPart !== lastPart) return false;
      if (parentPart && itemParts.length >= 2) {
        const itemParent = itemParts[itemParts.length - 2].toLowerCase();
        return itemParent === parentPart;
      }
      return true;
    });

    return found || null;
  } catch (error) {
    console.error('Error reading product data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  const [product, seoMeta] = await Promise.all([
    getProductData(slugPath),
    prisma.seoMeta.findUnique({ where: { page: `/${slugPath}` } }).catch(() => null),
  ]);

  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com'}/${slugPath}`;

  // Admin-managed SEO meta takes top priority
  if (seoMeta) {
    return {
      title: seoMeta.title || undefined,
      description: seoMeta.description || undefined,
      keywords: seoMeta.keywords ? seoMeta.keywords.split(',').map(k => k.trim()) : undefined,
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

  const parts = params.slug;
  const lastPart = parts[parts.length - 1];
  const formattedTitle = lastPart
    .replace(/-/g, ' ')
    .replace(/\.php$/i, '')
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `${formattedTitle} - Mohit Sales Corporation Pvt. Ltd.`,
    description: 'Authorized Polycab & Dowells Distributor',
  };
}

// ── DB lookup for page content (replaces PHP file reading) ──────────
async function getPageContentHtml(slugPath: string): Promise<string | null> {
  try {
    let pageContent = await prisma.pageContent.findUnique({
      where: { slug: slugPath }
    });
    if (!pageContent) {
      const legacyPath = getLegacyPath(slugPath);
      pageContent = await prisma.pageContent.findFirst({
        where: { legacyPath: legacyPath }
      });
    }
    if (!pageContent || !pageContent.isActive) return null;
    return pageContent.htmlContent;
  } catch (e) {
    console.error('[getPageContentHtml] Error:', e);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const slugPath = params.slug.join('/');

  // Fetch DB product early and local state in parallel
  // Note: redirect check is handled by middleware (/api/public/redirect). This is the fallback.
  const [dbProductEarlyRaw, product, dbCategoryEarly] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: slugPath },
      include: { category: { include: { parent: { include: { parent: { include: { parent: true } } } } } } }
    }).catch((e) => {
      console.error('[slug:dbProductEarly] Error fetching product early:', e);
      return null;
    }),
    getProductData(slugPath),
    prisma.category.findUnique({
      where: { slug: slugPath }
    }).catch((e) => {
      console.error('[slug:dbCategoryEarly] Error fetching category early:', e);
      return null;
    })
  ]);

  const dbProductEarly = (dbCategoryEarly || (dbProductEarlyRaw && (!dbProductEarlyRaw.isActive || dbProductEarlyRaw.stock <= 0))) ? null : dbProductEarlyRaw;
  const legacyHtml = await getPageContentHtml(slugPath);

  const hasLegacyCards = legacyHtml && (
    legacyHtml.includes('class="cables-card"') ||
    legacyHtml.includes('class="card_box"') ||
    legacyHtml.includes('class="fan_card_box"') ||
    legacyHtml.includes('class="product-card"') ||
    legacyHtml.includes('class="industries-card"')
  );

  const isIndexPage = (product && product.cards && product.cards.length > 0) || hasLegacyCards;

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 1: DB product always takes priority over legacy PHP.
  // If product exists in DB and this is not a category index page,
  // always render the DB React template — no more isModified check.
  // PHP fallback (Priority 2) only runs when DB has NO product for this slug.
  // ══════════════════════════════════════════════════════════════════════
  if (dbProductEarly && !isIndexPage) {
    return (
      <ProductPageWrapper>


        <SchemaInjector page={`/${slugPath}`} />
        {renderDbProduct(dbProductEarly)}
      </ProductPageWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PRIORITY 2: Legacy PHP Content (original site UI for all 2170+ pages)
  // ══════════════════════════════════════════════════════════════════════
  // Falls through here only when PRIORITY 1 (DB product) did not match.
  if (legacyHtml) {
    let finalHtml = legacyHtml;

    try {
      // ── Dynamic Breadcrumbs Clickable Link Fix ──────────────────────────
      const $ = cheerio.load(finalHtml, null, false);

      // Fix legacy features title nesting inside ul
      $('ul.product-features h3, ul.product-features h4, ul.product-features .product-title').each((i, el) => {
        const titleEl = $(el);
        const text = titleEl.text().trim().toUpperCase();
        if (text === 'FEATURES') {
          const ul = titleEl.closest('ul.product-features');
          if (ul.length > 0) {
            titleEl.removeClass('product-title').addClass('features-title');
            ul.before(titleEl);
          }
        }
      });

      const breadcrumbLis = $('.rs-breadcrumb-menu nav ul li');
      if (breadcrumbLis.length > 0) {
        const length = breadcrumbLis.length;
        const pendingNames: string[] = [];

        for (let i = 0; i < length - 1; i++) {
          const li = $(breadcrumbLis[i]);
          const a = li.find('a');
          if (a.length === 0 || a.attr('href') === '#') {
            const text = li.text().trim();
            if (text) pendingNames.push(text);
          }
        }

        if (pendingNames.length > 0) {
          const dbCats = await prisma.category.findMany({
            where: {
              name: {
                in: pendingNames,
                mode: 'insensitive'
              }
            },
            select: { name: true, slug: true }
          });

          const catMap = new Map<string, string>();
          dbCats.forEach(c => catMap.set(c.name.toLowerCase(), c.slug));

          for (let i = 0; i < length - 1; i++) {
            const li = $(breadcrumbLis[i]);
            const a = li.find('a');
            const text = li.text().trim();
            const slug = catMap.get(text.toLowerCase());
            if (slug) {
              if (a.length > 0) {
                a.attr('href', `/${slug}`);
              } else {
                li.empty().append(`<span><a href="/${slug}">${text}</a></span>`);
              }
            }
          }
        }
      }

      // Convert legacy inline tab switch triggers to data-tab-target
      $('button[onclick*="openTab"]').each((_, elem) => {
        const btn = $(elem);
        const onclick = btn.attr('onclick') || '';
        const match = onclick.match(/openTab\s*\(\s*event\s*,\s*['"]([^'"]+)['"]\)/);
        if (match) {
          btn.attr('data-tab-target', match[1]);
        }
      });

      finalHtml = $.html();

      // Only query DB for category products if the HTML actually has card slots to fill
      const dbCategory = hasLegacyCards ? await prisma.category.findUnique({
        where: { slug: slugPath },
        include: { products: true }
      }) : null;

      if (dbCategory && dbCategory.products.length > 0) {
        const $ = cheerio.load(finalHtml, null, false);
        let htmlModified = false;

        // Find the template card to use for appending new products
        const legacyCard = $('.cables-card, .card_box, .fan_card_box, .product-card').last();
        const colWrapper = legacyCard.length > 0 ? legacyCard.closest('[class*="col-"]') : null;
        const gridContainer = colWrapper && colWrapper.length > 0 ? colWrapper.parent() : null;

        for (const prod of dbCategory.products) {
          let existingCard: any = null;

          // Try to match by checking if any card contains the product title exactly or contains a link matching the product slug suffix
          $('.cables-card, .card_box, .fan_card_box, .product-card').each((i, el) => {
            const cardHtml = $(el).html() || '';
            const cardText = $(el).text();

            const cleanTitle = prod.title.trim().toLowerCase();
            const slugParts = prod.slug.split('/');
            const lastPart = slugParts[slugParts.length - 1].toLowerCase();

            const matchesTitle = cardText.toLowerCase().includes(cleanTitle);
            const matchesSlug = cardHtml.toLowerCase().includes(lastPart);

            if (matchesTitle || matchesSlug) {
              existingCard = $(el);
              return false; // break loop
            }
          });

          if (existingCard) {
            if (!prod.isActive || prod.stock <= 0) {
              // Remove the product card if it is deactivated or out of stock
              const wrapper = existingCard.closest('[class*="col-"]');
              if (wrapper.length > 0) {
                wrapper.remove();
              } else {
                existingCard.remove();
              }
              htmlModified = true;
            } else {
              // Update image if custom one is set in the DB
              if (prod.imageSrc) {
                const img = existingCard.find('img');
                if (img.length && img.attr('src') !== prod.imageSrc) {
                  img.attr('src', prod.imageSrc);
                  htmlModified = true;
                }
              }
              // Update title if modified
              const titleEl = existingCard.find('h4, h3, h5, .cables-name a, .product-details span').not('.product-features h3, .product-features h4, .product-features h5, :contains("FEATURES")');
              if (titleEl.length && titleEl.text().trim() !== prod.title) {
                titleEl.text(prod.title);
                htmlModified = true;
              }
            }
          } else if (prod.isActive && prod.stock > 0) {
            // New product: Clone the template card and append it to the grid container
            if (gridContainer && colWrapper) {
              const newCol = colWrapper.clone();

              // Update image
              const img = newCol.find('img');
              if (img.length) {
                img.attr('src', prod.imageSrc || '/assets/images/no-image.png');
                img.attr('alt', prod.title);
              }

              // Update title
              const titleEl = newCol.find('h4, h3, h5, .cables-name a, .product-details span').not('.product-features h3, .product-features h4, .product-features h5, :contains("FEATURES")');
              if (titleEl.length) {
                titleEl.text(prod.title);
              }

              // Update links
              newCol.find('a').each((i: number, el: any) => {
                const href = $(el).attr('href');
                if (href && href.includes('contact-us')) {
                  $(el).attr('href', `/contact-us?product=${encodeURIComponent(prod.title)}`);
                } else {
                  $(el).attr('href', `/${prod.slug}`);
                }
              });

              gridContainer.append(newCol);
              htmlModified = true;
            }
          }
        }

        if (htmlModified) {
          finalHtml = $.html();
        }
      }
    } catch (e) {
      console.error('Error injecting DB products into legacy HTML:', e);
    }

    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        <main className="legacy-php-content">
          <div className="legacy-php-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(finalHtml) }} />
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
            <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
              <div className="rs-breadcrumb-bg" style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}></div>
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
  if (dbProductEarly) {
    return (
      <ProductPageWrapper>
        <SchemaInjector page={`/${slugPath}`} />
        {renderDbProduct(dbProductEarly)}
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
  // PRIORITY 6: 404
  // ══════════════════════════════════════════════════════════════════════
  notFound();
}

// ── DB Product Detail Page ────────────────────────────────────────────
function renderDbProduct(dbProduct: any) {
  const breadcrumbs = [];
  let currentCat = dbProduct.category;
  while (currentCat) {
    breadcrumbs.unshift({ label: currentCat.name.trim(), href: `/${currentCat.slug}` });
    currentCat = currentCat.parent;
  }

  // Safe description parsing (handles stringified JSON arrays from seeds)
  let parsedDescription: string[] = [];
  if (dbProduct.description) {
    try {
      const parsed = JSON.parse(dbProduct.description);
      if (Array.isArray(parsed)) {
        parsedDescription = parsed;
      } else {
        parsedDescription = [String(parsed)];
      }
    } catch (e) {
      parsedDescription = dbProduct.description.split('\n\n').filter(Boolean);
    }
  }

  // Safe features/cards parsing
  let parsedFeatures: any[] = [];
  let isMultiProduct = false;
  if (dbProduct.features) {
    try {
      const parsed = JSON.parse(dbProduct.features);
      if (Array.isArray(parsed)) {
        parsedFeatures = parsed;
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          isMultiProduct = true;
        }
      } else {
        parsedFeatures = [String(parsed)];
      }
    } catch (e) {
      parsedFeatures = dbProduct.features.split(/\r?\n|,/).map((feat: string) => feat.trim()).filter(Boolean);
    }
  }

  const cleanLink = (url: string) => {
    if (!url) return '';
    let clean = url;
    if (clean.endsWith('.php')) clean = clean.substring(0, clean.length - 4);
    if (!clean.startsWith('/') && !clean.startsWith('http') && !clean.startsWith('mailto:')) {
      clean = '/' + clean;
    }
    return clean;
  };

  // If it is a multi-product page (contains nested product card items)
  if (isMultiProduct) {
    const hasCardBoxStyle = parsedFeatures.some((card: any) => card.features && card.features.length > 0);

    return (
      <main>
        <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
          <div className="rs-breadcrumb-bg" style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}></div>
          <div className="container">
            <div className="row">
              <div className="w-full">
                <div className="rs-breadcrumb-content-wrapper">
                  <div className="rs-breadcrumb-title-wrapper">
                    <h1 className="rs-breadcrumb-title">{dbProduct.title}</h1>
                  </div>
                  <div className="rs-breadcrumb-menu">
                    <nav><ul>
                      <li><span><a href="/">Home</a></span></li>
                      {breadcrumbs.map((b, i) => (
                        <li key={i}><span><a href={b.href}>{b.label}</a></span></li>
                      ))}
                      <li><span>{dbProduct.title}</span></li>
                    </ul></nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="catalogue-section">
          <div className="container">
            {parsedDescription.length > 0 && (
              <div className="wires-desc text-center mb-5" style={{ maxWidth: 700, margin: '0 auto 32px' }}>
                {parsedDescription.map((desc: string, idx: number) => (
                  <p key={idx} className="mb-3">{desc}</p>
                ))}
              </div>
            )}

            <div className="products-section">
              <div className={hasCardBoxStyle ? "row product-wrapper" : "row mt-4"}>
                {parsedFeatures.map((card: any, idx: number) => {
                  const isCardBox = card.features && card.features.length > 0;

                  if (isCardBox) {
                    return (
                      <div key={idx} className="w-full">
                        <div className="card_box">
                          <div className="row align-items-center product-card">
                            <div className="col-md-6 text-center">
                              {card.image && (
                                <img
                                  src={card.image}
                                  alt={card.title || 'Product'}
                                  className="product-img img-fluid"
                                  loading="lazy"
                                />
                              )}
                              {card.title && <h3 className="product-title mt-4">{card.title}</h3>}
                            </div>
                            <div className="col-md-6">
                              <div className="features-container">
                                <h3 className="features-title mb-4">FEATURES</h3>
                                <ul className="product-features">
                                  {card.features.map((feat: string, fIdx: number) => (
                                    <li key={fIdx}>{feat}</li>
                                  ))}
                                </ul>
                              </div>
                              <a
                                href={card.link ? cleanLink(card.link) : `/contact-us?product=${encodeURIComponent(card.title || dbProduct.title)}`}
                                className="enquiry-btn"
                              >
                                Send Enquiry &rarr;
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={idx} className="col-md-4 mt-4 d-flex align-items-stretch">
                        <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent overflow-hidden flex flex-col flex-grow h-full w-full transition-transform duration-300 hover:-translate-y-1.5 group">
                          <div className="p-[15px] bg-white d-flex justify-content-center align-items-center">
                            {card.image && (
                              <img
                                src={card.image}
                                alt={card.title || 'Product'}
                                className="w-full h-[250px] object-contain rounded-[10px] shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="flex flex-col flex-grow p-[18px] text-center">
                            {card.title && <div className="text-[#c1272d] text-[22px] font-semibold mb-[10px]">{card.title}</div>}
                            {card.details && (
                              <div
                                className="text-[#555] text-[18px] leading-[1.6] mb-[18px] [&>span]:font-semibold [&>span]:text-[#333]"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.details.replace(/\n/g, '<br>')) }}
                              />
                            )}
                            <a
                              href={card.link ? cleanLink(card.link) : `/contact-us?product=${encodeURIComponent(card.title || dbProduct.title)}`}
                              className="bg-gradient-to-br from-[#f7931e] to-[#c1272d] text-white rounded-[4px] px-[24px] py-[10px] font-medium text-[15px] border-none inline-flex items-center justify-center transition-all duration-300 w-auto min-w-[140px] h-[45px] self-center mt-auto mb-0 whitespace-nowrap hover:bg-none hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]"
                            >
                              {card.link && card.link !== '/contact-us' && card.link !== '/contact-us.php' ? 'Explore More' : 'Send Enquiry'}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Single Product Detailed View Layout (Layout A)
  return (
    <main>
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div className="rs-breadcrumb-bg" style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">{dbProduct.title}</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav><ul>
                    <li><span><a href="/">Home</a></span></li>
                    {breadcrumbs.map((b, i) => (
                      <li key={i}><span><a href={b.href}>{b.label}</a></span></li>
                    ))}
                    <li><span>{dbProduct.title}</span></li>
                  </ul></nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wires_inner">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="product-img">
                {(() => {
                  const imgSrc = dbProduct.imageSrc || dbProduct.category?.image || null;
                  return imgSrc ? (
                    <img src={imgSrc} alt={dbProduct.title} className="img-fluid w-full h-auto object-contain" />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ minHeight: 260, color: '#aaa' }}>
                      <div style={{ textAlign: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: 8 }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        <div>No Image</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            <div className="col-lg-7">
              <div className="wires-title">
                <h3>{dbProduct.title}</h3>
                <div className="separator1"></div>
              </div>



              <div className="wires-desc">
                {parsedDescription.length > 0 ? (
                  parsedDescription.map((desc: string, idx: number) => (
                    <p key={idx} className="mb-3">{desc}</p>
                  ))
                ) : (
                  <p>Contact us for more information about this product.</p>
                )}
              </div>

              {parsedFeatures.length > 0 && (
                <div className="features">
                  <h4>Key Features</h4>
                  <div className="separator1"></div>
                  <ul className="animated-list">
                    {parsedFeatures.map((feat: any, idx: number) => {
                      const text = typeof feat === 'string' ? feat : (feat.title || '');
                      if (!text.trim()) return null;
                      return (
                        <li key={idx}>
                          <i className="fa-solid fa-angle-right"></i>
                          <span>{text.trim()}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="enquiry-btn-container mt-4" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                <div className="rs-banner-btn">
                  <a
                    className="rs-btn has-theme-orange has-icon has-bg"
                    href={`/contact-us?product=${encodeURIComponent(dbProduct.title)}`}
                  >
                    Send Enquiry
                    <span className="icon-box">
                      <svg className="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                      </svg>
                      <svg className="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                      </svg>
                    </span>
                  </a>
                </div>
                {dbProduct.datasheetLink && (
                  <div className="rs-banner-btn">
                    <a
                      className="rs-btn has-theme-orange has-icon has-bg"
                      href={dbProduct.datasheetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Datasheet
                      <span className="icon-box">
                        <svg className="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                          <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                        </svg>
                        <svg className="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                          <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                        </svg>
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── DB Category Listing Page ──────────────────────────────────────────
function renderDbCategory(cat: any) {
  const hasSubCategories = cat.children && cat.children.length > 0;
  const hasDirectProducts = cat.products && cat.products.length > 0;

  // Build recursive parent breadcrumbs path
  const breadcrumbs = [];
  let currentParent = cat.parent;
  while (currentParent) {
    breadcrumbs.unshift({ name: currentParent.name.trim(), slug: currentParent.slug });
    currentParent = currentParent.parent;
  }

  return (
    <main>
      {/* Breadcrumb */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">{cat.name.trim()}</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav><ul>
                    <li><span><a href="/">Home</a></span></li>
                    {breadcrumbs.map((crumb, idx) => (
                      <li key={idx}><span><a href={`/${crumb.slug}`}>{crumb.name}</a></span></li>
                    ))}
                    <li><span>{cat.name.trim()}</span></li>
                  </ul></nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="catalogue-section">
        <div className="container">
          {cat.description && (
            <div className="wires-desc text-center mb-5" style={{ maxWidth: 700, margin: '0 auto 32px' }}>
              <p>{cat.description}</p>
            </div>
          )}

          {/* Sub-categories as folder cards */}
          {hasSubCategories && (
            <>
              <div className="section-title">
                <h2>Product Lines</h2>
              </div>
              <div className="row mt-4 mb-5">
                {cat.children.map((child: any) => (
                  <div key={child.id} className="col-lg-3 col-md-4 col-sm-6 mt-4">
                    <a href={`/${child.slug}`} className="db-subcategory-card">
                      {child.image ? (
                        <img src={child.image} alt={child.name} className="db-subcategory-img" />
                      ) : (
                        <div className="db-subcategory-icon">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f7931e" strokeWidth="1.5">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="db-subcategory-name">{child.name}</div>
                      <div className="db-subcategory-count">{child._count?.products || 0} products</div>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Direct products in this category */}
          {hasDirectProducts && (
            <>
              {hasSubCategories && (
                <div className="section-title mt-4">
                  <h2>All Products</h2>
                </div>
              )}
              <div className="products-section">
                <div className="row mt-4">
                  {cat.products.map((prod: any) => {
                    let displayDesc = prod.description || '';
                    if (prod.description) {
                      try {
                        const parsed = JSON.parse(prod.description);
                        if (Array.isArray(parsed)) {
                          displayDesc = parsed.join(' ');
                        } else {
                          displayDesc = String(parsed);
                        }
                      } catch (e) {
                        displayDesc = prod.description;
                      }
                    }

                    return (
                      <div key={prod.id} className="col-md-4 mt-4 d-flex align-items-stretch">
                        <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent overflow-hidden flex flex-col flex-grow h-full w-full transition-transform duration-300 hover:-translate-y-1.5 group">
                          <div className="p-[15px] bg-white d-flex justify-content-center align-items-center">
                            {prod.imageSrc ? (
                              <img src={prod.imageSrc} alt={prod.title} className="w-full h-[250px] object-contain rounded-[10px] shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                            ) : (
                              <div className="w-full h-[250px] flex items-center justify-center text-slate-300 text-sm">No Image</div>
                            )}
                          </div>
                          <div className="flex flex-col flex-grow p-[18px] text-center">
                            <div className="text-[#c1272d] text-[22px] font-semibold mb-[10px]">{prod.title}</div>
                            {displayDesc && (
                              <div className="text-[#555] text-[16px] leading-[1.6] mb-[18px]">{displayDesc}</div>
                            )}
                            <a href={`/contact-us?product=${encodeURIComponent(prod.title)}`} className="bg-gradient-to-br from-[#f7931e] to-[#c1272d] text-white rounded-[4px] px-[24px] py-[10px] font-medium text-[15px] border-none inline-flex items-center justify-center transition-all duration-300 w-auto min-w-[140px] h-[45px] self-center mt-auto mb-0 whitespace-nowrap hover:bg-none hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]">
                              Send Enquiry
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!hasSubCategories && !hasDirectProducts && (
            <div className="py-5">
              <div className="row align-items-center justify-content-center">
                {cat.image && (
                  <div className="col-lg-5 col-md-6 mb-4 mb-md-0 text-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>
                )}
                <div className={cat.image ? "col-lg-7 col-md-6" : "col-lg-8 text-center"}>
                  <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent p-5">
                    <h3 className="text-[#1e2e5e] text-[28px] font-semibold mb-3" style={{ borderBottom: '2px solid #f7931e', paddingBottom: '8px', display: 'inline-block' }}>
                      Enquire About {cat.name.trim()}
                    </h3>
                    <p className="text-[#555] text-[18px] leading-[1.6] mt-3 mb-4">
                      {cat.description || `Interested in our ${cat.name.trim()} range? Contact us today to get the latest catalogue, pricelist, and customized quotations.`}
                    </p>
                    <a
                      href={`/contact-us?product=${encodeURIComponent(cat.name.trim())}`}
                      className="bg-gradient-to-br from-[#f7931e] to-[#c1272d] text-white rounded-[4px] px-[32px] py-[12px] font-medium text-[16px] border-none inline-flex items-center justify-center transition-all duration-300 hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]"
                    >
                      Send Enquiry &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function renderProductLayout(isMultiProduct: boolean, product: any, cleanLink: (url: string) => string) {
  if (isMultiProduct) {
    // Layout B: Category Catalog with Product Cards
    const hasCardBoxStyle = product.cards.some((card: any) => card.features && card.features.length > 0);

    return (
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title">
            <h2>{product.heading || product.title}</h2>
          </div>

          <div className="products-section">
            <div className={hasCardBoxStyle ? "row product-wrapper" : "row mt-4"}>
              {product.cards.map((card: any, idx: number) => {
                const isCardBox = card.features && card.features.length > 0;

                if (isCardBox) {
                  return (
                    <div key={idx} className="w-full">
                      <div className="card_box">
                        <div className="row align-items-center product-card">
                          <div className="col-md-6 text-center">
                            {card.image && (
                              <img
                                src={card.image}
                                alt={card.title || 'Product'}
                                className="product-img img-fluid"
                                loading="lazy"
                              />
                            )}
                            {card.title && <h3 className="product-title mt-4">{card.title}</h3>}
                          </div>
                          <div className="col-md-6">
                            <div className="features-container">
                              <h3 className="features-title mb-4">FEATURES</h3>
                              <ul className="product-features">
                                {card.features.map((feat: string, fIdx: number) => (
                                  <li key={fIdx}>{feat}</li>
                                ))}
                              </ul>
                            </div>
                            <a
                              href={card.link ? cleanLink(card.link) : `/contact-us?product=${encodeURIComponent(card.title || product.heading || product.title)}`}
                              className="enquiry-btn"
                            >
                              Send Enquiry &rarr;
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="col-md-4 mt-4 d-flex align-items-stretch">
                      <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent overflow-hidden flex flex-col flex-grow h-full w-full transition-transform duration-300 hover:-translate-y-1.5 group">
                        <div className="p-[15px] bg-white d-flex justify-content-center align-items-center">
                          {card.image && (
                            <img
                              src={card.image}
                              alt={card.title || 'Product'}
                              className="w-full h-[250px] object-contain rounded-[10px] shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="flex flex-col flex-grow p-[18px] text-center">
                          {card.title && <div className="text-[#c1272d] text-[22px] font-semibold mb-[10px]">{card.title}</div>}
                          {card.details && (
                            <div
                              className="text-[#555] text-[18px] leading-[1.6] mb-[18px] [&>span]:font-semibold [&>span]:text-[#333]"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(card.details.replace(/\n/g, '<br>')) }}
                            />
                          )}
                          <a
                            href={card.link ? cleanLink(card.link) : `/contact-us?product=${encodeURIComponent(card.title || product.heading || product.title)}`}
                            className="bg-gradient-to-br from-[#f7931e] to-[#c1272d] text-white rounded-[4px] px-[24px] py-[10px] font-medium text-[15px] border-none inline-flex items-center justify-center transition-all duration-300 w-auto min-w-[140px] h-[45px] self-center mt-auto mb-0 whitespace-nowrap hover:bg-none hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]"
                          >
                            {card.link && card.link !== '/contact-us' && card.link !== '/contact-us.php' ? 'Explore More' : 'Send Enquiry'}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </section>
    );
  } else {
    // Layout A: Single Product Detailed View
    return (
      <section className="wires_inner">
        <div className="container">
          <div className="row">
            {/* Product Image Column */}
            <div className="col-lg-4">
              <div className="product-img">
                {product.imageSrc ? (
                  <img
                    src={product.imageSrc}
                    alt={product.heading || 'Product'}
                    className="img-fluid"
                  />
                ) : (
                  <div className="text-gray-400 font-medium">No Image Available</div>
                )}
              </div>
            </div>

            {/* Product Details Column */}
            <div className="col-lg-8">
              <div className="wires-title">
                <h3>{product.heading || product.title}</h3>
                <div className="separator1"></div>
              </div>

              <div className="wires-desc">
                {product.description && product.description.map((desc: string, idx: number) => (
                  <p key={idx} className="mb-3">{desc}</p>
                ))}
              </div>

              {/* Features list */}
              {product.features && product.features.length > 0 && (
                <div className="features">
                  <h4>Features</h4>
                  <div className="separator1"></div>
                  <ul className="animated-list">
                    {product.features.map((feat: string, idx: number) => (
                      <li key={idx}>
                        <i className="fa-solid fa-angle-right"></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-actions mt-4 flex gap-3">
                <a
                  className="enquiry-btn"
                  href={`/contact-us?product=${encodeURIComponent(product.heading || product.title)}`}
                >
                  Send Enquiry
                </a>

                {product.datasheet && (
                  <div className="rs-banner-btn">
                    <a
                      className="rs-btn has-theme-orange has-icon has-bg"
                      href={product.datasheet}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Datasheet
                      <span className="icon-box">
                        <svg className="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                          <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                        </svg>
                        <svg className="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                          <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                        </svg>
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
