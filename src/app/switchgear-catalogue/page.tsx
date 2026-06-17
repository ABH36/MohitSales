import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
  description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs, distribution boards, and protection devices for residential, commercial, and industrial use.',
  openGraph: {
    title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
    description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs, distribution boards, and protection devices.',
    url: 'https://mohitscpl.com/switchgear-catalogue',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
    description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs and distribution boards.',
  },
  alternates: { canonical: 'https://mohitscpl.com/switchgear-catalogue' },
};

export default async function SwitchgearCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'Mini MCB',
      category: 'Switchgear',
      image: '/assets/images/catalogue/switchgear_catalogue/Mini-MCB.jpg',
      pdf: '/assets/images/catalogue/switchgear_catalogue/pdf/Small_PC012-Polycab-mini-MCB.pdf'
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
                  <h1 className="rs-breadcrumb-title">Switchgear</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/catalogue')}>Catalogue</a></span></li>
                      <li><span>Switchgear Catalogue</span></li>
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
            <h2>Switchgear</h2>
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
