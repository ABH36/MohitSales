import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import ProductPageWrapper from '@/components/ProductPageWrapper';
import SchemaInjector from '@/components/SchemaInjector';
import { sanitizeHtml } from '@/lib/utils';
import { renderDbProduct, renderDbCategory, renderProductLayout } from './render';
import { cld } from '@/lib/cloudinary';

export const revalidate = 3600; // ISR: revalidate every 1 hour (admin edits trigger instant revalidation via API)
export const dynamicParams = true; // Allow on-demand generation for pages not generated at build time

interface ProductPageProps {
  params: {
    slug: string[];
  } | Promise<{
    slug: string[];
  }>;
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

// content-export.json removed — the database (products + pageContent) is now
// authoritative and fully covers every slug. Kept as a no-op so the handful of
// call sites stay untouched; `product` is always null and handled by the
// null-safe rendering paths (verified: identical output).
async function getProductData(_slugPath: string): Promise<any> {
  return null;
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

  // Product-specific admin-managed SEO meta takes next priority
  if (dbProduct && (dbProduct.metaTitle || dbProduct.metaDescription || dbProduct.metaKeywords)) {
    const title = dbProduct.metaTitle || `${dbProduct.title || product?.heading || product?.title || 'Product'} - ${SITE_SUFFIX}`;
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
    const title = `${dbProduct.title} - ${SITE_SUFFIX}`;
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

// ── DB lookup for page content (PageContent table; 4,339 pages) ──────────
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
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join('/');

  // Runtime is always DB-driven (build-cache removed). Redirect checks are
  // handled upstream by middleware (/api/public/redirect).
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
      let dbCategory = null;
      if (hasLegacyCards) {
        dbCategory = await prisma.category.findUnique({
          where: { slug: slugPath },
          include: { products: true }
        });
      }

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
                img.attr('src', prod.imageSrc || 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png');
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
              <div className="rs-breadcrumb-bg" style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')` }}></div>
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
  // PRIORITY 6: 404
  // ══════════════════════════════════════════════════════════════════════
  notFound();
}

// ── DB Product Detail Page ────────────────────────────────────────────
export async function generateStaticParams() {
  console.log('[generateStaticParams] Fetching database contents for pre-rendering...');

  try {
    // 1. Fetch all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // 2. Fetch all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true
              }
            }
          }
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            products: {
              where: { isActive: true, stock: { gt: 0 } },
              orderBy: { sortOrder: 'asc' },
              take: 4
            },
            _count: {
              select: { products: true }
            }
          }
        },
        products: {
          where: { isActive: true, stock: { gt: 0 } },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    // 3. Fetch all active page contents
    const pageContents = await prisma.pageContent.findMany({
      where: { isActive: true }
    });

    // 4. Fetch all seoMeta
    const seoMetas = await prisma.seoMeta.findMany();

    // Create mappings
    const productMap: Record<string, any> = {};
    for (const p of products) {
      productMap[p.slug] = p;
    }

    const categoryMap: Record<string, any> = {};
    for (const c of categories) {
      categoryMap[c.slug] = c;
    }

    const pageContentMap: Record<string, any> = {};
    const legacyPageContentMap: Record<string, any> = {};
    for (const pc of pageContents) {
      pageContentMap[pc.slug] = pc;
      if (pc.legacyPath) {
        legacyPageContentMap[pc.legacyPath] = pc;
      }
    }

    const seoMetaMap: Record<string, any> = {};
    for (const sm of seoMetas) {
      seoMetaMap[sm.page] = sm;
    }

    // Also build name to slug map for categories (used for breadcrumbs lookup)
    const categoryNameMap: Record<string, string> = {};
    for (const c of categories) {
      categoryNameMap[c.name.trim().toLowerCase()] = c.slug;
    }

    // (Removed: build-cache.json write — runtime now always queries the DB,
    //  which is serverless-safe and avoids per-build filesystem writes.)

    // Collect all unique active slugs
    const allSlugs = new Set<string>();

    // Add PageContent slugs
    for (const pc of pageContents) {
      if (pc.slug) allSlugs.add(pc.slug);
    }

    // Add Product slugs
    for (const p of products) {
      if (p.slug) allSlugs.add(p.slug);
    }

    // Add Category slugs
    for (const c of categories) {
      if (c.slug) allSlugs.add(c.slug);
    }

    // Format as Next.js params: [{ slug: ['polycab', 'fans'] }, ...]
    const paramsList = Array.from(allSlugs).map(slug => ({
      slug: slug.split('/').filter(Boolean)
    }));

    console.log(`[generateStaticParams] Generated ${paramsList.length} slugs for pre-rendering.`);
    return paramsList;
  } catch (error) {
    console.error('[generateStaticParams] Database connection failed (expected during docker build):', error);
    return [];
  }
}
