'use client';

import React from 'react';
import BreadcrumbBanner from '@/components/BreadcrumbBanner';
import ProductPageWrapper from '@/components/ProductPageWrapper';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { ArrowRight } from 'lucide-react';

export default function CrimpingToolPage() {
  const products = [
    {
      subtitle: 'Hand Manual Crimping Tool',
      title: '12 Type Different Tool',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166541/mohit/our_products/dowells/crimping_tool/hand-manual-crimping-tool.jpg',
      size: 'CAP:0.5 to 400 sq.mm'
    },
    {
      subtitle: 'Hand Hydroulic Crimping Tool',
      title: '5 Type Different Jack',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166542/mohit/our_products/dowells/crimping_tool/hand-hydrolic-crimping-tool.jpg',
      size: 'CAP:10 to 1000 sq.mm'
    },
    {
      subtitle: 'Foot Hydroulic Crimping Tool',
      title: 'Foot Hydroulic Crimping Tool',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783166544/mohit/our_products/dowells/crimping_tool/foot-hydrolic-crimping-tool.jpg',
      size: 'CAP:50 to 630 sq.mm'
    }
  ];

  // Wrapped so its "Send Enquiry" buttons open the enquiry modal like every
  // other product page. Without this they navigated away to /contact-us, which
  // is why the same button behaved differently here than elsewhere.
  return (
    <ProductPageWrapper>
    <main>
      <BreadcrumbBanner
        title="Crimping Tool"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells', href: '/dowells' }, { label: 'Crimping Tool' }]}
      />

      <section className="catalogue-section">
        <div className="container">
          <div className="section-title position-relative text-center mb-5">
            <h2>Crimping Tool</h2>
          </div>

          {/* Same card design as the homepage explorers (.hce-card); the whole
              card is the enquiry link, intercepted by ProductPageWrapper. */}
          <div className="hce-grid">
            {products.map((prod, idx) => (
              <a
                key={idx}
                href={`/contact-us?product=${encodeURIComponent(prod.subtitle)}`}
                className="hce-card"
              >
                <span className="hce-card-brand">dowells</span>
                <span className={`hce-card-img hce-tint-${idx % 4}`}>
                  <img src={cld(prod.image)} alt={prod.title} loading="lazy" />
                </span>
                <span className="hce-card-body">
                  <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                    {categoryIcon('crimping tool')}
                  </span>
                  <span className="hce-card-name">{prod.subtitle}</span>
                  <span className="hce-card-details">
                    <span>Type:</span> {prod.title}<br />
                    <span>Size:</span> {prod.size}
                  </span>
                  <span className="hce-card-cta">
                    Send Enquiry <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
    </ProductPageWrapper>
  );
}
