import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/cable-terminal', {
  title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
  description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
  openGraph: {
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
    url: 'https://mohit.bdm.co.in/cable-terminal',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/cable-terminal' },
});
};



export default async function CableTerminalPage() {
    
  const linkPath = (url: string) => url;

  const cards = [
    {
      title: 'Aluminium',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167916/mohit/our_products/dowells/cable_terminal/1.jpg',
      link: '/cable-terminal/aluminium'
    },
    {
      title: 'Bimetallic',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167917/mohit/our_products/dowells/cable_terminal/2.jpg',
      link: '/cable-terminal/bimetallic'
    },
    {
      title: 'Copper',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167918/mohit/our_products/dowells/cable_terminal/3.jpg',
      link: '/cable-terminal/copper'
    }
  ];

  return (
    <main>
      {/* Breadcrumbs */}
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
                  <h1 className="rs-breadcrumb-title">Cable Terminal</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span><Link href="/dowells">Dowells</Link></span></li>
                      <li><span>Cable Terminal</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>Cable Terminal</h2>
          </div>

          <section className="products-section">
            <div className="container">
              <div className="products-grid">
                {cards.map((card, idx) => (
                  <div key={idx} className="product-card">
                    <Link href={linkPath(card.link)}>
                      <img
                        src={card.image}
                        alt={card.title}
                      />
                      <h3>{card.title}</h3>
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
