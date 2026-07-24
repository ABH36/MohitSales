import React from 'react';
import Link from 'next/link';
import BreadcrumbBanner, { type Crumb } from '@/components/BreadcrumbBanner';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { productCountsBySlug } from '@/lib/product-counts';
import { ArrowRight } from 'lucide-react';

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
 * Cards share the homepage explorer design (.hce-card).
 */
export default async function CategoryLandingGrid({
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
  // "View Products (N)" like every other category card; slugs carry a leading
  // slash here, the counter keys on the bare product slug.
  const counts = await productCountsBySlug(items.map((i) => i.link.replace(/^\//, '')));

  return (
    <main>
      <BreadcrumbBanner title={title} crumbs={breadcrumbs} />

      {/* Grid Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>{title}</h2>
          </div>

          <div className="hce-grid">
            {items.map((item, idx) => (
              <Link key={idx} href={item.link} className="hce-card">
                <span className={`hce-card-img hce-tint-${idx % 4}`}>
                  <img src={cld(item.image, 'f_auto,q_auto,w_600')} alt={item.title} loading="lazy" decoding="async" />
                </span>
                <span className="hce-card-body">
                  <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                    {categoryIcon(item.title)}
                  </span>
                  <span className="hce-card-name">{item.title}</span>
                  <span className="hce-card-cta">
                    {counts[item.link.replace(/^\//, '')]
                      ? `View Products (${counts[item.link.replace(/^\//, '')]})`
                      : buttonLabel}{' '}
                    <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
