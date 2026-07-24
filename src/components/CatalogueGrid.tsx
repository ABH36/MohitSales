import React from 'react';
import BreadcrumbBanner, { BANNER } from '@/components/BreadcrumbBanner';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { ArrowRight } from 'lucide-react';

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

          {/* Same card design as the homepage explorers (.hce-card); each card
              opens its catalogue PDF in a new tab. */}
          <div className="hce-grid">
            {items.map((cat, idx) => (
              <a
                key={cat.title + idx}
                href={cat.pdf}
                className="hce-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={`hce-card-img hce-tint-${idx % 4}`}>
                  <img src={cld(cat.image, 'f_auto,q_auto,w_500')} alt={cat.title} loading="lazy" decoding="async" />
                </span>
                <span className="hce-card-body">
                  <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                    {categoryIcon(cat.category || cat.title)}
                  </span>
                  <span className="hce-card-name">{cat.title}</span>
                  <span className="hce-card-cta">
                    View Catalogue <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
