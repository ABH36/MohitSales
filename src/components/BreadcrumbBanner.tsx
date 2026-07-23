import React from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com';

export interface Crumb {
  label: string;
  href?: string; // the current (last) crumb omits href
}

/** Well-known inner-banner background images (Cloudinary). */
export const BANNER = {
  products: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png',
  pricelist: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167905/mohit/inner-banner/pricelist.png',
} as const;

/**
 * Shared page-header banner: full-width background image, an <h1> title, and a
 * breadcrumb trail. Previously this ~25-line block was copy-pasted into every
 * landing/catalogue/bespoke page; it now lives in one place.
 */
export default function BreadcrumbBanner({
  title,
  crumbs,
  bannerImage = BANNER.products,
}: {
  title: string;
  crumbs: Crumb[];
  bannerImage?: string;
}) {
  // BreadcrumbList structured data built from the SAME crumbs as the visual
  // trail, so the two can never drift apart. `item` is omitted for crumbs
  // without an href (the current page) — valid per Google's guidelines.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href && c.href !== '#'
        ? { item: c.href.startsWith('http') ? c.href : `${SITE_URL}${c.href}` }
        : {}),
    })),
  };

  return (
    <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
      <JsonLd data={breadcrumbLd} />
      <div className="rs-breadcrumb-bg" style={{ backgroundImage: `url('${cld(bannerImage)}')` }}></div>
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
                    {crumbs.map((crumb, i) => (
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
  );
}
