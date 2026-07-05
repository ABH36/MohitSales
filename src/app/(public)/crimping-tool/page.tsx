'use client';

import React from 'react';
import BreadcrumbBanner from '@/components/BreadcrumbBanner';
import { cld } from '@/lib/cloudinary';

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

  return (
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

          <div className="row mt-4">
            {products.map((prod, idx) => (
              <div key={idx} className="col-md-4 mt-4">
                <h5 className="mb-4">{prod.subtitle}</h5>
                <div className="product-card">
                  <div className="product-img">
                    <img 
                      src={cld(prod.image)} 
                      alt={prod.title} 
                      className="img-fluid" 
                    />
                  </div>

                  <div className="product-content">
                    <div className="product-title">{prod.title}</div>

                    <div className="product-details">
                      <span>Material:</span> --<br />
                      <span>Finishing:</span> --<br />
                      <span>Size:</span> {prod.size}
                    </div>

                    <a href="/contact-us" className="enquiry-btn">Send Enquiry</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
