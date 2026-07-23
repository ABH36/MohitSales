import React from 'react';
import { sanitizeHtml } from '@/lib/utils';
import { cld } from '@/lib/cloudinary';
import { deriveSpecs, splitDescription, type Spec } from '@/lib/product-specs';
import StickyProductActions from '@/components/StickyProductActions';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/json-ld';
import { categoryIcon } from '@/lib/category-icons';
import { brandFromSlug } from '@/lib/brand';
import { ArrowRight } from 'lucide-react';

/**
 * A card's `details` is sometimes a string and sometimes an array of lines —
 * e.g. the Dowells crimping tools store ["Material: --", "Size: CAP:10 …"].
 * Calling .replace() straight on it threw "details.replace is not a function"
 * and took the whole page down with a 500. Normalise to HTML either way.
 */
function detailsToHtml(details: unknown): string | null {
  if (details === null || details === undefined) return null;
  const text = Array.isArray(details)
    ? details.filter(Boolean).map(String).join('\n')
    : String(details);
  if (!text.trim()) return null;
  return sanitizeHtml(text.replace(/\n/g, '<br>'));
}

export function renderDbProduct(dbProduct: any, productJson: any = null, legacyImage: string | null = null, legacyFeatures: string[] = []) {
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

  // Fallback to json cards if DB has no features
  if (parsedFeatures.length === 0 && productJson && productJson.cards && productJson.cards.length > 0) {
    parsedFeatures = productJson.cards;
    isMultiProduct = true;
  }

  // Fallback to extracted legacy features if still empty
  if (parsedFeatures.length === 0 && legacyFeatures && legacyFeatures.length > 0) {
    parsedFeatures = legacyFeatures;
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

  // Structured data — Product + a BreadcrumbList that mirrors the visual trail.
  // Emitted by both render branches below.
  const currentPath = `/${dbProduct.slug}`;
  const productLd = productJsonLd({
    title: dbProduct.title,
    slug: dbProduct.slug,
    description:
      parsedDescription.filter((d: any) => typeof d === 'string').join(' ') || null,
    imageSrc: dbProduct.imageSrc || legacyImage,
    categoryName: dbProduct.category?.name?.trim() || null,
  });
  const crumbsLd = breadcrumbJsonLd(
    [
      ...breadcrumbs.map((b: any) => ({ name: b.label, path: b.href })),
      { name: dbProduct.title },
    ],
    currentPath,
  );

  // If it is a multi-product page (contains nested product card items)
  if (isMultiProduct) {
    const hasCardBoxStyle = parsedFeatures.some((card: any) => card.features && card.features.length > 0);

    return (
      <main>
        {/* Range/listing page — BreadcrumbList only; Product schema belongs on
            the single-product branch below. */}
        <JsonLd data={crumbsLd} />
        <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
          <div className="rs-breadcrumb-bg" style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')` }}></div>
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
                                  src={cld(card.image)}
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
                    // Grid product card — same design as the homepage explorers.
                    const cardHref = card.link
                      ? cleanLink(card.link)
                      : `/contact-us?product=${encodeURIComponent(card.title || dbProduct.title)}`;
                    const isExplore =
                      card.link && card.link !== '/contact-us' && card.link !== '/contact-us.php';
                    return (
                      <div key={idx} className="col-lg-3 col-md-4 mt-4 d-flex align-items-stretch">
                        <a href={cardHref} className="hce-card hce-card-fluid">
                          <span className="hce-card-brand">{brandFromSlug(dbProduct.slug)}</span>
                          <span className={`hce-card-img hce-tint-${idx % 4}`}>
                            {card.image && (
                              <img src={cld(card.image)} alt={card.title || 'Product'} loading="lazy" />
                            )}
                          </span>
                          <span className="hce-card-body">
                            <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                              {categoryIcon(card.title || dbProduct.title)}
                            </span>
                            {card.title && <span className="hce-card-name">{card.title}</span>}
                            {detailsToHtml(card.details) && (
                              <span
                                className="hce-card-details"
                                dangerouslySetInnerHTML={{ __html: detailsToHtml(card.details) as string }}
                              />
                            )}
                            <span className="hce-card-cta">
                              {isExplore ? 'Explore More' : 'Send Enquiry'} <ArrowRight aria-hidden="true" />
                            </span>
                          </span>
                        </a>
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
      <JsonLd data={productLd} />
      <JsonLd data={crumbsLd} />
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div className="rs-breadcrumb-bg" style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')` }}></div>
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
                  const imgSrc = dbProduct.imageSrc || productJson?.imageSrc || legacyImage || dbProduct.category?.image || null;
                  return imgSrc ? (
                    <img src={imgSrc} alt={dbProduct.title} className="img-fluid w-full h-auto object-contain" />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center rounded" style={{ minHeight: 260, background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f9 100%)', border: '1px solid rgba(30,46,94,0.08)' }}>
                      <img
                        src={cld('https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png')}
                        alt={dbProduct.title}
                        style={{ maxWidth: '70%', maxHeight: 150, objectFit: 'contain', opacity: 0.85 }}
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Specifications sit under the image, in the left column, so the
                  empty space below a short product photo is filled and the page
                  balances left-to-right instead of stacking everything on the
                  right. Skipped for titles that carry no designation. */}
              {(() => {
                const titleSpecs = deriveSpecs(dbProduct.title);
                const { specs: descSpecs } = splitDescription(parsedDescription);
                const seen = new Set(titleSpecs.map((s) => s.label.toLowerCase()));
                const merged: Spec[] = [
                  ...titleSpecs,
                  ...descSpecs.filter((s) => !seen.has(s.label.toLowerCase())),
                ];
                if (!merged.length) return null;
                return (
                  <div className="product-specs product-specs-aside">
                    <h4 aria-level={3}>Specifications</h4>
                    <div className="separator1"></div>
                    <dl className="product-spec-grid">
                      {merged.map((s) => (
                        <div key={s.label} className="product-spec-row">
                          <dt>{s.label}</dt>
                          <dd>{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })()}

            </div>

            <div className="col-lg-7">
              <div className="wires-title">
                {/* Visual size comes from the tag; aria-level keeps the outline
                    unbroken (h1 → 2 → 3) for screen readers. */}
                <h3 aria-level={2}>{dbProduct.title}</h3>
                <div className="separator1"></div>
              </div>



              {/* Description keeps only real prose paragraphs. Construction
                  comma-runs ("Copper conductor, PVC insulated, …") used to
                  render as a bullet list here, but those info points are
                  dropped by request — the spec table below already carries the
                  factual details. */}
              {(() => {
                const { blocks } = splitDescription(parsedDescription);
                const paragraphs = blocks.filter(
                  (block): block is Extract<typeof block, { type: 'p' }> => block.type === 'p',
                );
                return (
                  <div className="wires-desc">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((block, idx) => (
                        <p key={idx} className="mb-3">{block.text}</p>
                      ))
                    ) : (
                      <p>Contact us for more information about this product.</p>
                    )}
                  </div>
                );
              })()}

              {parsedFeatures.length > 0 && (
                <div className="features">
                  <h4 aria-level={3}>Key Features</h4>
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

      <StickyProductActions
        productTitle={dbProduct.title}
        datasheetLink={dbProduct.datasheetLink}
      />
    </main>
  );
}

// ── DB Category Listing Page ──────────────────────────────────────────
export function renderDbCategory(cat: any) {
  const hasSubCategories = cat.children && cat.children.length > 0;
  const hasDirectProducts = cat.products && cat.products.length > 0;

  // Build recursive parent breadcrumbs path
  const breadcrumbs = [];
  let currentParent = cat.parent;
  while (currentParent) {
    breadcrumbs.unshift({ name: currentParent.name.trim(), slug: currentParent.slug });
    currentParent = currentParent.parent;
  }

  // BreadcrumbList structured data mirroring the visual trail above.
  const crumbsLd = breadcrumbJsonLd(
    [
      ...breadcrumbs.map((b: any) => ({ name: b.name, path: `/${b.slug}` })),
      { name: cat.name.trim() },
    ],
    `/${cat.slug}`,
  );

  return (
    <main>
      <JsonLd data={crumbsLd} />
      {/* Breadcrumb */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')` }}
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
              {/* Same card design as the homepage explorers (.hce-card). */}
              <div className="hce-grid mt-4 mb-5">
                {cat.children.map((child: any, idx: number) => (
                  <a key={child.id} href={`/${child.slug}`} className="hce-card">
                    <span className="hce-card-brand">{brandFromSlug(child.slug)}</span>
                    <span className={`hce-card-img hce-tint-${idx % 4}`}>
                      <img
                        src={child.image ? cld(child.image) : cld('https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png')}
                        alt={child.name}
                        loading="lazy"
                      />
                    </span>
                    <span className="hce-card-body">
                      <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                        {categoryIcon(child.name)}
                      </span>
                      <span className="hce-card-name">{child.name}</span>
                      <span className="hce-card-cta">
                        View Products ({child._count?.products || 0}) <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </a>
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
              {/* Product cards share the homepage explorer design (.hce-card);
                  the whole card opens the product page, which carries the
                  description, features and datasheet. */}
              <div className="products-section">
                <div className="hce-grid mt-4">
                  {cat.products.map((prod: any, idx: number) => (
                    <a key={prod.id} href={`/${prod.slug}`} className="hce-card">
                      <span className="hce-card-brand">{brandFromSlug(prod.slug)}</span>
                      <span className={`hce-card-img hce-tint-${idx % 4}`}>
                        <img
                          src={prod.imageSrc || cld('https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png')}
                          alt={prod.title}
                          loading="lazy"
                        />
                      </span>
                      <span className="hce-card-body">
                        <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                          {categoryIcon(prod.title)}
                        </span>
                        <span className="hce-card-name">{prod.title}</span>
                        <span className="hce-card-cta">
                          Explore More <ArrowRight aria-hidden="true" />
                        </span>
                      </span>
                    </a>
                  ))}
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
                      src={cld(cat.image)}
                      alt={cat.name}
                      style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                  </div>
                )}
                <div className={cat.image ? "col-lg-7 col-md-6" : "col-lg-8 text-center"}>
                  <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent p-5">
                    <h3 className="text-[#1e2e5e] text-[28px] font-semibold mb-3" style={{ borderBottom: '2px solid #c1272d', paddingBottom: '8px', display: 'inline-block' }}>
                      Enquire About {cat.name.trim()}
                    </h3>
                    <p className="text-[#555] text-[18px] leading-[1.6] mt-3 mb-4">
                      {cat.description || `Interested in our ${cat.name.trim()} range? Contact us today to get the latest catalogue, pricelist, and customized quotations.`}
                    </p>
                    <a
                      href={`/contact-us?product=${encodeURIComponent(cat.name.trim())}`}
                      className="bg-gradient-to-br from-[#e8434a] to-[#c1272d] text-white rounded-[4px] px-[32px] py-[12px] font-medium text-[16px] border-none inline-flex items-center justify-center transition-all duration-300 hover:bg-[#1e2e5e] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(30,46,94,0.25)]"
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

export function renderProductLayout(isMultiProduct: boolean, product: any, cleanLink: (url: string) => string, brand: 'polycab' | 'dowells' = 'polycab') {
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
                                src={cld(card.image)}
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
                  // Grid product card — same design as the homepage explorers.
                  const cardHref = card.link
                    ? cleanLink(card.link)
                    : `/contact-us?product=${encodeURIComponent(card.title || product.heading || product.title)}`;
                  const isExplore =
                    card.link && card.link !== '/contact-us' && card.link !== '/contact-us.php';
                  return (
                    <div key={idx} className="col-lg-3 col-md-4 mt-4 d-flex align-items-stretch">
                      <a href={cardHref} className="hce-card hce-card-fluid">
                        <span className="hce-card-brand">{brand}</span>
                        <span className={`hce-card-img hce-tint-${idx % 4}`}>
                          {card.image && (
                            <img src={cld(card.image)} alt={card.title || 'Product'} loading="lazy" />
                          )}
                        </span>
                        <span className="hce-card-body">
                          <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                            {categoryIcon(card.title || product.heading || product.title)}
                          </span>
                          {card.title && <span className="hce-card-name">{card.title}</span>}
                          {detailsToHtml(card.details) && (
                            <span
                              className="hce-card-details"
                              dangerouslySetInnerHTML={{ __html: detailsToHtml(card.details) as string }}
                            />
                          )}
                          <span className="hce-card-cta">
                            {isExplore ? 'Explore More' : 'Send Enquiry'} <ArrowRight aria-hidden="true" />
                          </span>
                        </span>
                      </a>
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
                <h3 aria-level={2}>{product.heading || product.title}</h3>
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
                  <h4 aria-level={3}>Features</h4>
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

// ── Build-time Static Parameter Generation & Caching ──────────────────
