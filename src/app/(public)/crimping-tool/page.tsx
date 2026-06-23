'use client';

import React from 'react';
import Link from 'next/link';

export default function CrimpingToolPage() {
  const products = [
    {
      subtitle: 'Hand Manual Crimping Tool',
      title: '12 Type Different Tool',
      image: '/assets/images/our_products/dowells/crimping_tool/hand-manual-crimping-tool.jpg',
      size: 'CAP:0.5 to 400 sq.mm'
    },
    {
      subtitle: 'Hand Hydroulic Crimping Tool',
      title: '5 Type Different Jack',
      image: '/assets/images/our_products/dowells/crimping_tool/hand-hydrolic-crimping-tool.jpg',
      size: 'CAP:10 to 1000 sq.mm'
    },
    {
      subtitle: 'Foot Hydroulic Crimping Tool',
      title: 'Foot Hydroulic Crimping Tool',
      image: '/assets/images/our_products/dowells/crimping_tool/foot-hydrolic-crimping-tool.jpg',
      size: 'CAP:50 to 630 sq.mm'
    }
  ];

  return (
    <main>
      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Crimping Tool</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span><Link href="/dowells">Dowells</Link></span></li>
                      <li><span>Crimping Tool</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

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
                      src={prod.image} 
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
