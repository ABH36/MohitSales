import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
  description: 'Authorized distributor of Polycab solar DC cables, solar wires, and solar power accessories in Indore. High-efficiency solar products for residential and commercial installations.',
  openGraph: {
    title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab solar DC cables, solar wires, and solar power accessories in Indore.',
    url: 'https://mohit.bdm.co.in/solar',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Products | Polycab Solar DC Cables & Systems | Mohit Sales Corporation',
    description: 'Authorized distributor of Polycab solar DC cables and solar accessories in Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/solar' },
};



export default async function SolarPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Solar Grid Tie Inverter',
      image: '/assets/images/our_products/solar/solar-grid-tie-inverter.png',
      link: l('/solar/solar-grid-tie-inverter')
    },
    {
      title: 'DC MCB',
      image: '/assets/images/our_products/solar/DC-MCB-2.png',
      link: l('/solar/dc-mcb')
    },
    {
      title: 'Solar DC Cable',
      image: '/assets/images/our_products/solar/solar-dc-cable.png',
      link: l('/solar/solar-dc-cable')
    },
    {
      title: 'Solar Panel',
      image: '/assets/images/our_products/solar/Mono_Crystalline.png',
      link: l('/solar/solar-panel')
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
                  <h1 className="rs-breadcrumb-title">Solar</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/polycab')}>Polycab</Link></span></li>
                      <li><span>Solar</span></li>
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
            <h2>Solar</h2>
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
