import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/conduit-accessories', {
  title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
  description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes, and saddles for residential and commercial wiring.',
  openGraph: {
    title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore. ISI-marked conduits, bends, junction boxes for residential and commercial wiring.',
    url: 'https://mohit.bdm.co.in/conduit-accessories',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conduit & Accessories | Polycab PVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab PVC conduit pipes and accessories in Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/conduit-accessories' },
});
};



export default async function ConduitAccessoriesPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'UPVC Conduit',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167913/mohit/our_products/conduit_accessories/CONDUITS.png',
      link: l('/conduit-accessories/upvc-conduit')
    },
    {
      title: 'Concealed Box',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167914/mohit/our_products/conduit_accessories/Concealed-Box.png',
      link: l('/conduit-accessories/concealed-box')
    }
  ];

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
                  <h1 className="rs-breadcrumb-title">Conduit & Accessories</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/polycab')}>Polycab</Link></span></li>
                      <li><span>Conduit & Accessories</span></li>
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
            <h2>Conduit & Accessories</h2>
          </div>

          <section className="products-section">
            <div className="container">
              <div className="products-grid">
                {products.map((prod, idx) => (
                  <div key={idx} className="product-card">
                    <Link href={prod.link}>
                      <img
                        src={prod.image}
                        alt={prod.title}
                      />
                      <h3>{prod.title}</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">
                          Explore More
                        </span>
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
