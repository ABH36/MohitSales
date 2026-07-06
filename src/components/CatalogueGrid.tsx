import React from 'react';
import BreadcrumbBanner, { BANNER } from '@/components/BreadcrumbBanner';
import { cld } from '@/lib/cloudinary';

export interface CatalogueItem {
  title: string;
  category: string;
  image: string;
  pdf: string;
}

/**
 * Shared layout for the `*-catalogue` PDF-download pages (cables, solar, fans,
 * conduit, home-appliances, switchgear). Renders the pricelist breadcrumb banner
 * (Home › Catalogue › <crumbLabel>) plus the catalogue-card grid — the markup
 * that was byte-for-byte duplicated across all six pages. Each page now supplies
 * only its title, crumb label, and item list (see src/data/catalogues.ts).
 */
export default function CatalogueGrid({
  title,
  crumbLabel,
  items,
}: {
  title: string;
  crumbLabel: string;
  items: CatalogueItem[];
}) {
  return (
    <main>
      <BreadcrumbBanner
        title={title}
        bannerImage={BANNER.pricelist}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Catalogue', href: '/catalogue' }, { label: crumbLabel }]}
      />

      {/* Grid Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>{title}</h2>
          </div>

          <div className="row g-5">
            {items.map((cat, idx) => (
              <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                <div className="catalogue-card">
                  <a href={cat.pdf} className="catalogue-link" target="_blank" rel="noopener noreferrer">
                    <div className="catalogue-img">
                      <img src={cld(cat.image, 'f_auto,q_auto,w_500')} alt={cat.title} loading="lazy" decoding="async" />
                    </div>
                    <div className="catalogue-content">
                      <h3>{cat.title}</h3>
                      <p>{cat.category}</p>
                      <span className="view-btn">View Catalogue</span>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
