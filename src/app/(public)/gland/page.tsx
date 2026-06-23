import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
  description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
  openGraph: {
    title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
    description: 'Authorized distributor of Dowells cable glands in Indore. Industrial grade metal and nylon cable glands for safe cable entry, IP rating, and strain relief.',
    url: 'https://mohitscpl.com/gland',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cable Glands | Dowells Metal & Nylon Glands | Mohit Sales Corporation',
    description: 'Authorized distributor of Dowells cable glands in Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/gland' },
};



export default async function GlandPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Single Compression Gland',
      image: '/assets/images/our_products/gland/1.jpg',
      link: l('/gland/single-compression-gland')
    },
    {
      title: 'Double Compression Gland',
      image: '/assets/images/our_products/gland/2.jpg',
      link: l('/gland/double-compression-gland')
    },
    {
      title: 'Flang Type Gland',
      image: '/assets/images/our_products/gland/3.jpg',
      link: l('/gland/flang-type-gland')
    },
    {
      title: 'Shrouds',
      image: '/assets/images/our_products/gland/4.jpg',
      link: l('/gland/shrouds')
    },
    {
      title: 'Earthing Tag',
      image: '/assets/images/our_products/gland/5.jpg',
      link: l('/gland/earthing-tag')
    }
  ];

  return (
    <main>
      {/* Breadcrumb Area */}
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
                  <h1 className="rs-breadcrumb-title">Gland</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/dowells')}>Dowells</Link></span></li>
                      <li><span>Gland</span></li>
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
            <h2>Gland</h2>
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
