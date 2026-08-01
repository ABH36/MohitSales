import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';
import { breadcrumbBgStyle } from '@/lib/page-banner';
import { SITE_URL } from '@/lib/seo';

/**
 * Pages that must never get an auto-injected enquiry button — they are company
 * or index pages, not something a customer enquires about. Matched against the
 * full slug and against its first segment, so /resources and /resources/x are
 * both covered. Anything ending in "-catalogue" is excluded separately.
 */
const INFORMATIONAL_SLUGS = new Set([
  'about-us', 'achievements', 'certificates', 'resources', 'catalogue',
  'pricelist', 'contact-us', 'feedback', 'blog', 'company-profile',
  'index', 'index-old',
]);

export interface LegacyHtmlContext {
  slugPath: string;
  /** PageContent.heading — used to correct banners that carry the section name. */
  pageHeading: string | null;
  /** The matched DB product's title, if any — names the injected enquiry CTA. */
  dbProductTitle: string | null;
  /** Whether the HTML has card slots worth topping up from the DB category. */
  hasLegacyCards: boolean;
}

/**
 * Takes a stored legacy page's HTML and returns the render-ready HTML plus the
 * BreadcrumbList JSON-LD extracted from its (fixed-up) trail. All the cheerio
 * fix-ups that used to live inline in the catch-all page happen here:
 *   - correct the banner heading, features-title nesting and tab triggers,
 *   - make breadcrumb links clickable (or plain text if they resolve nowhere),
 *   - inject an enquiry CTA when the markup has none,
 *   - restyle legacy grid cards to the shared .hce-card design,
 *   - swap in a category-relevant breadcrumb banner, and
 *   - reconcile the card grid against the DB category's products.
 */
export async function transformLegacyHtml(
  legacyHtml: string,
  ctx: LegacyHtmlContext,
): Promise<{ html: string; crumbsLd: object | null }> {
  const { slugPath, pageHeading, dbProductTitle, hasLegacyCards } = ctx;

  let finalHtml = legacyHtml;
  // BreadcrumbList JSON-LD extracted from the (fixed-up) legacy breadcrumb
  // trail; rendered as a React element because sanitizeHtml strips scripts.
  let legacyCrumbsLd: object | null = null;

  try {
    // ── Dynamic Breadcrumbs Clickable Link Fix ──────────────────────────
    const $ = cheerio.load(finalHtml, null, false);

    // ── Put the page's own name in the banner ──
    // 73 exported pages carry their parent section's name in the banner: the
    // Coolers page is headed "Home Appliances", every fan sub-range is headed
    // "Fans". The row's `heading` column holds the correct name, so it wins.
    // Punctuation-only differences are left alone — the export writes
    // "Conduit & Accessories" where the column says "Conduit Accessories",
    // and the ampersand version is the better title.
    if (pageHeading?.trim()) {
      const bannerEl = $('.rs-breadcrumb-title').first();
      const banner = bannerEl.text().replace(/\s+/g, ' ').trim();
      const heading = pageHeading.trim();
      const bare = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (bannerEl.length && bare(banner) !== bare(heading)) {
        bannerEl.text(heading);
      }
    }

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

        // Legacy hub levels (e.g. "Industries", "Cables By Type") are valid
        // pages but not category rows, so also resolve a crumb against the
        // current URL path when the DB lookup misses. If neither resolves, the
        // dead "#" link is replaced with plain text so no breadcrumb ever
        // points nowhere.
        const urlSegments = slugPath.split('/').filter(Boolean);
        const slugify = (t: string) =>
          t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        for (let i = 0; i < length - 1; i++) {
          const li = $(breadcrumbLis[i]);
          const a = li.find('a');
          const needsFix = a.length === 0 || a.attr('href') === '#';
          if (!needsFix) continue;

          const text = li.text().trim();
          const dbSlug = catMap.get(text.toLowerCase());
          let href = dbSlug ? `/${dbSlug}` : '';
          if (!href) {
            const segIdx = urlSegments.indexOf(slugify(text));
            if (segIdx >= 0) href = `/${urlSegments.slice(0, segIdx + 1).join('/')}`;
          }

          if (href) {
            if (a.length > 0) {
              a.attr('href', href);
            } else {
              li.empty().append(`<span><a href="${href}">${text}</a></span>`);
            }
          } else if (text) {
            li.empty().append(`<span>${text}</span>`);
          }
        }
      }
    }

    // ── BreadcrumbList structured data for legacy pages ──
    // Built from the SAME (post-fix-up) trail the visitor sees, so the schema
    // always matches the visual breadcrumb. Collected into a variable and
    // rendered as a React <JsonLd> beside the HTML — it cannot live INSIDE
    // finalHtml because sanitizeHtml strips every <script> tag at render.
    {
      const crumbEls = $('.rs-breadcrumb-menu nav ul li');
      if (crumbEls.length > 0) {
        const items: object[] = [];
        crumbEls.each((i, el) => {
          const li = $(el);
          const name = li.text().trim();
          if (!name) return;
          const href = li.find('a').attr('href');
          items.push({
            '@type': 'ListItem',
            position: items.length + 1,
            name,
            ...(href && href !== '#'
              ? { item: href.startsWith('http') ? href : `${SITE_URL}${href}` }
              : {}),
          });
        });
        if (items.length > 0) {
          legacyCrumbsLd = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items,
          };
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

    // ── Give product pages an enquiry CTA when the legacy markup has none ──
    // Roughly 250 legacy product and category pages were exported without one,
    // so a visitor browsing e.g. /fans/ceiling-fans had no way to enquire
    // except the footer. Informational pages are excluded — an enquiry button
    // does not belong on About Us or a catalogue index.
    if (!$('a[href*="contact-us"]').length) {
      const firstSegment = slugPath.split('/')[0];
      const isInformational =
        INFORMATIONAL_SLUGS.has(slugPath) ||
        INFORMATIONAL_SLUGS.has(firstSegment) ||
        /(^|\/)[a-z0-9-]*catalogue$/.test(slugPath);

      if (!isInformational) {
        // Name the enquiry after the product, so sales can tell what it is
        // about. The product row is the most precise source — several legacy
        // breadcrumbs carry the section name ("Home Appliances") rather than
        // the page's own ("Steam Iron"), which would reach sales as a useless
        // enquiry. Falls back to the heading only when there is no product row.
        const heading =
          dbProductTitle?.trim() ||
          $('.rs-breadcrumb-title').first().text().trim() ||
          $('h1').first().text().trim() ||
          '';
        const productParam = heading ? `?product=${encodeURIComponent(heading)}` : '';
        $.root().append(
          `<section class="enquiry-cta-section" style="padding:0 0 120px"><div class="container">` +
            `<div class="enquiry-btn-container" style="display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px">` +
            `<div class="rs-banner-btn"><a class="rs-btn has-theme-orange has-icon has-bg enquiry-btn" href="/contact-us${productParam}" style="padding: 16px 40px; font-size: 18px;">Send Enquiry` +
            `<span class="icon-box">` +
            `<svg class="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path></svg>` +
            `<svg class="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path></svg>` +
            `</span></a></div></div></div></section>`
        );
      }
    }

    // ── Restyle legacy grid product cards to the shared .hce-card design ──
    // The stored export carries two grid shapes: the landing grid
    // (.products-grid > .product-card > a > img+h3+.pricelist-button, e.g.
    // the cable-terminal index) and the listing card (.product-card >
    // .product-img/.product-content, e.g. water-heaters). Swapping their
    // classes for the homepage-card ones makes the same CSS apply, so these
    // pages match every React-rendered grid — and detaches them from the
    // old .product-card/.pricelist-btn rules in custom.css. The horizontal
    // spec rows (.card_box "row product-card") are a different layout and
    // keep their classes. Icon badges are skipped: sanitizeHtml strips
    // <svg>, so the CTA arrow comes from CSS instead.
    $('.products-grid').removeClass('products-grid').addClass('hce-grid');
    $('.product-card').each((i, el) => {
      const card = $(el);
      if (card.hasClass('row') || card.closest('.card_box').length) return;
      const link = card.children('a').first();
      if (link.length && link.children('img').length) {
        // Landing-grid variant — rebuild the anchor's children into the
        // image stage + body structure the hce CSS expects.
        card.removeClass('product-card').addClass('hce-card');
        link.children('img').first().wrap(`<span class="hce-card-img hce-tint-${i % 4}"></span>`);
        const body = $('<span class="hce-card-body"></span>');
        const h3 = link.children('h3').first();
        const ctaText = link.find('.pricelist-btn').first().text().trim() || 'Explore More';
        link.children('.pricelist-button').remove();
        if (h3.length) {
          h3.addClass('hce-card-name');
          body.append(h3);
        }
        body.append(`<span class="hce-card-cta">${ctaText}</span>`);
        link.append(body);
      } else {
        // Listing variant — a straight class swap.
        card.removeClass('product-card').addClass('hce-card hce-card-fluid');
        card.find('.product-img').first().removeClass('product-img').addClass(`hce-card-img hce-tint-${i % 4}`);
        card.find('.product-content').first().removeClass('product-content').addClass('hce-card-body');
        card.find('.product-title').first().removeClass('product-title').addClass('hce-card-name');
        card.find('.product-details').first().removeClass('product-details').addClass('hce-card-details');
        // Text stays "Send Enquiry", so ProductPageWrapper still opens the modal.
        card.find('a.enquiry-btn').first().removeClass('enquiry-btn').addClass('hce-card-cta');
      }
    });

    // ── Category-relevant breadcrumb banner ──
    // Legacy pages carry a baked-in generic "products" banner in their inline
    // style. Swap it for one that matches this page's category (cables/wires
    // keep the wire-spool strip; fans/lighting/switchgear/etc. get their own).
    // The theme's JS re-applies `data-background` over the inline style on
    // load, so that attribute is removed — otherwise it would clobber the swap.
    $('.rs-breadcrumb-bg')
      .removeAttr('data-background')
      .attr('style', `background-image: ${breadcrumbBgStyle(slugPath)}`);

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
      // (.hce-card covers legacy product cards restyled by the pass above)
      const legacyCard = $('.cables-card, .card_box, .fan_card_box, .product-card, .hce-card').last();
      const colWrapper = legacyCard.length > 0 ? legacyCard.closest('[class*="col-"]') : null;
      const gridContainer = colWrapper && colWrapper.length > 0 ? colWrapper.parent() : null;

      for (const prod of dbCategory.products) {
        let existingCard: any = null;

        // Try to match by checking if any card contains the product title exactly or contains a link matching the product slug suffix
        $('.cables-card, .card_box, .fan_card_box, .product-card, .hce-card').each((i, el) => {
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
            const titleEl = existingCard.find('h4, h3, h5, .cables-name a, .hce-card-name, .product-details span').not('.product-features h3, .product-features h4, .product-features h5, :contains("FEATURES")');
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
            const titleEl = newCol.find('h4, h3, h5, .cables-name a, .hce-card-name, .product-details span').not('.product-features h3, .product-features h4, .product-features h5, :contains("FEATURES")');
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

  return { html: finalHtml, crumbsLd: legacyCrumbsLd };
}
