import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
  description: 'Browse the complete Polycab fans catalogue — ceiling fans, table fans, wall fans, exhaust fans, and BLDC energy-saving fans. Download product brochures.',
  openGraph: {
    title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
    description: 'Browse the complete Polycab fans catalogue — ceiling fans, table fans, wall fans, exhaust fans, and BLDC energy-saving fans.',
    url: 'https://mohit.bdm.co.in/fans-catalogue',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
    description: 'Browse the complete Polycab fans catalogue — ceiling, table, wall, exhaust, and BLDC fans.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/fans-catalogue' },
};

export default async function FansCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'Polycab Fans Range Catalogue',
      category: 'Fan',
      image: '/assets/images/catalogue/fans/Fans-Range-Catalogue.png',
      pdf: '/assets/images/catalogue/fans/pdf/Fans-Range-Catalogue-2024.pdf'
    },
    {
      title: 'Silencio Mini Catalogue',
      category: 'Fan',
      image: '/assets/images/catalogue/fans/Updated_Silencio_Mini.jpg',
      pdf: '/assets/images/catalogue/fans/pdf/A5_SIZE-Silencio_Mini.pdf'
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
                  <h1 className="rs-breadcrumb-title">Fans</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/catalogue')}>Catalogue</Link></span></li>
                      <li><span>Fans Catalogue</span></li>
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
            <h2>Fans</h2>
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
