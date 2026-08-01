import React from 'react';
import BreadcrumbBanner, { type Crumb } from '@/components/BreadcrumbBanner';
import LandingCardGrid from '@/components/LandingCardGrid';
import { productCountsBySlug } from '@/lib/product-counts';

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
  const cards = items.map((item) => {
    const n = counts[item.link.replace(/^\//, '')];
    return { title: item.title, image: item.image, link: item.link, cta: n ? `View Products (${n})` : buttonLabel };
  });

  return (
    <main>
      <BreadcrumbBanner title={title} crumbs={breadcrumbs} />

      {/* Grid Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>{title}</h2>
          </div>

          <LandingCardGrid cards={cards} />
        </div>
      </section>
    </main>
  );
}
