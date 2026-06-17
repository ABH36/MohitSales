import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
  description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
  openGraph: {
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
    url: 'https://mohitscpl.com/cable-terminal',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/cable-terminal' },
};



export default async function CableTerminalPage() {
    
  const linkPath = (url: string) => url;

  const cards = [
    {
      title: 'Aluminium',
      image: '/assets/images/our_products/dowells/cable_terminal/1.jpg',
      link: '/cable-terminal/aluminium'
    },
    {
      title: 'Bimetallic',
      image: '/assets/images/our_products/dowells/cable_terminal/2.jpg',
      link: '/cable-terminal/bimetallic'
    },
    {
      title: 'Copper',
      image: '/assets/images/our_products/dowells/cable_terminal/3.jpg',
      link: '/cable-terminal/copper'
    }
  ];

  return (
    <main>
      {/* Breadcrumbs */}
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
                  <h1 className="rs-breadcrumb-title">Cable Terminal</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href="/">Home</a></span></li>
                      <li><span><a href="/dowells">Dowells</a></span></li>
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
                    <a href={linkPath(card.link)}>
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
                    </a>
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
