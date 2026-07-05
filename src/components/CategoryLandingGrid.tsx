import React from 'react';
import Link from 'next/link';

export interface LandingCrumb {
  label: string;
  href?: string; // last crumb (current page) omits href
}
export interface LandingItem {
  title: string;
  image: string;
  link: string;
}

/**
 * Shared layout for the brand/category landing pages (gland, cable-terminal,
 * fans, solar, …). Renders the breadcrumb banner + product-card grid — the
 * markup that was previously duplicated across ~9 near-identical pages.
 */
export default function CategoryLandingGrid({
  title,
  breadcrumbs,
  items,
  buttonLabel = 'Explore More',
}: {
  title: string;
  breadcrumbs: LandingCrumb[];
  items: LandingItem[];
  buttonLabel?: string;
}) {
  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">{title}</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      {breadcrumbs.map((crumb, i) => (
                        <li key={i}>
                          <span>{crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}</span>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>{title}</h2>
          </div>

          <section className="products-section">
            <div className="container">
              <div className="products-grid">
                {items.map((item, idx) => (
                  <div key={idx} className="product-card">
                    <Link href={item.link}>
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                      <h3>{item.title}</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">{buttonLabel}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
