import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/home-appliances', {
  title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
  description: 'Authorized dealer of Polycab home appliances in Indore. Ceiling fans, wires, switches, modular accessories, and electrical fittings for home and office.',
  openGraph: {
    title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
    description: 'Authorized dealer of Polycab home appliances in Indore. Ceiling fans, wires, switches, modular accessories, and electrical fittings for home and office.',
    url: 'https://mohit.bdm.co.in/home-appliances',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home Appliances | Polycab Fans, Wires & Switches | Mohit Sales Corporation',
    description: 'Authorized dealer of Polycab home appliances in Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/home-appliances' },
});
};



export default async function HomeAppliancesPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Water Heaters',
      image: '/assets/images/our_products/home_appliances/1.png',
      link: l('/home-appliances/water-heaters')
    },
    {
      title: 'Irons',
      image: '/assets/images/our_products/home_appliances/2.png',
      link: l('/home-appliances/irons')
    },
    {
      title: 'Coolers',
      image: '/assets/images/our_products/home_appliances/3.png',
      link: l('/home-appliances/coolers')
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
                  <h1 className="rs-breadcrumb-title">Home Appliances</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/polycab')}>Polycab</Link></span></li>
                      <li><span>Home Appliances</span></li>
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
            <h2>Home Appliances</h2>
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
