import React from 'react';
import Link from 'next/link';
import BreadcrumbBanner, { type Crumb } from '@/components/BreadcrumbBanner';
import { cld } from '@/lib/cloudinary';

/** @deprecated use `Crumb` from BreadcrumbBanner — kept as an alias for callers. */
export type LandingCrumb = Crumb;
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
  breadcrumbs: Crumb[];
  items: LandingItem[];
  buttonLabel?: string;
}) {
  return (
    <main>
      <BreadcrumbBanner title={title} crumbs={breadcrumbs} />

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
                      <img src={cld(item.image)} alt={item.title} loading="lazy" decoding="async" />
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
