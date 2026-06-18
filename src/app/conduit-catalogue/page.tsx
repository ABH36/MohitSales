import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
  description: 'Browse the complete Polycab conduit catalogue — UPVC conduit pipes, fittings, and accessories. Download product specifications and datasheets.',
  openGraph: {
    title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Browse the complete Polycab conduit catalogue — UPVC conduit pipes, fittings, and accessories.',
    url: 'https://mohitscpl.com/conduit-catalogue',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Browse the complete Polycab conduit catalogue.',
  },
  alternates: { canonical: 'https://mohitscpl.com/conduit-catalogue' },
};

export default async function ConduitCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'UPVC Conduits And Fittings',
      category: 'Conduits And Accessories',
      image: '/assets/images/catalogue/conduit_catalogue/upvc-conduit.png',
      pdf: '/assets/images/catalogue/conduit_catalogue/pdf/upvc-conduits-and-fittings.pdf'
    }
  ];

  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/pricelist.png')" }}
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
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/catalogue')}>Catalogue</a></span></li>
                      <li><span>Conduit & Accessories Catalogue</span></li>
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

          <div className="row g-5">
            {catalogs.map((cat, idx) => (
              <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                <div className="catalogue-card">
                  <a href={cat.pdf} className="catalogue-link" target="_blank" rel="noopener noreferrer">
                    <div className="catalogue-img">
                      <img 
                        src={cat.image} 
                        alt={cat.title} 
                      />
                    </div>
                    <div className="catalogue-content">
                      <h3>{cat.title}</h3>
                      <p>{cat.category}</p>
                      <span className="view-btn">View Catalogue</span>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
