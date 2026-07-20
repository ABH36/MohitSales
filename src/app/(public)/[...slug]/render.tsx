import React from 'react';
import { sanitizeHtml } from '@/lib/utils';
import { cld } from '@/lib/cloudinary';

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

  // If it is a multi-product page (contains nested product card items)
  if (isMultiProduct) {
    const hasCardBoxStyle = parsedFeatures.some((card: any) => card.features && card.features.length > 0);

    return (
      <main>
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
                    return (
                      <div key={idx} className="col-md-4 mt-4 d-flex align-items-stretch">
                        <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent overflow-hidden flex flex-col flex-grow h-full w-full transition-transform duration-300 hover:-translate-y-1.5 group">
                          <div className="p-[15px] bg-white d-flex justify-content-center align-items-center">
                            {card.image && (
                              <img
                                src={cld(card.image)}
                                alt={card.title || 'Product'}
                                className="w-full h-[250px] object-contain rounded-[10px] shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="flex flex-col flex-grow p-[18px] text-center">
                            {card.title && <div className="text-[#c1272d] text-[22px] font-semibold mb-[10px]">{card.title}</div>}
                            {detailsToHtml(card.details) && (
                              <div
                                className="text-[#555] text-[18px] leading-[1.6] mb-[18px] [&>span]:font-semibold [&>span]:text-[#333]"
                                dangerouslySetInnerHTML={{ __html: detailsToHtml(card.details) as string }}
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

  return (
    <main>
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
              <div className="row mt-4 mb-5">
                {cat.children.map((child: any) => (
                  <div key={child.id} className="col-lg-3 col-md-4 col-sm-6 mt-4">
                    <a href={`/${child.slug}`} className="db-subcategory-card">
                      {child.image ? (
                        <img src={cld(child.image)} alt={child.name} className="db-subcategory-img" />
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
                              <div className="w-full h-[250px] flex items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f9 100%)' }}>
                                <img src={cld('https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png')} alt={prod.title} className="max-w-[65%] max-h-[130px] object-contain opacity-85" loading="lazy" />
                              </div>
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
                      src={cld(cat.image)}
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

export function renderProductLayout(isMultiProduct: boolean, product: any, cleanLink: (url: string) => string) {
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
                  return (
                    <div key={idx} className="col-md-4 mt-4 d-flex align-items-stretch">
                      <div className="bg-white rounded-[14px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] border border-transparent overflow-hidden flex flex-col flex-grow h-full w-full transition-transform duration-300 hover:-translate-y-1.5 group">
                        <div className="p-[15px] bg-white d-flex justify-content-center align-items-center">
                          {card.image && (
                            <img
                              src={cld(card.image)}
                              alt={card.title || 'Product'}
                              className="w-full h-[250px] object-contain rounded-[10px] shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="flex flex-col flex-grow p-[18px] text-center">
                          {card.title && <div className="text-[#c1272d] text-[22px] font-semibold mb-[10px]">{card.title}</div>}
                          {detailsToHtml(card.details) && (
                            <div
                              className="text-[#555] text-[18px] leading-[1.6] mb-[18px] [&>span]:font-semibold [&>span]:text-[#333]"
                              dangerouslySetInnerHTML={{ __html: detailsToHtml(card.details) as string }}
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

// ── Build-time Static Parameter Generation & Caching ──────────────────
