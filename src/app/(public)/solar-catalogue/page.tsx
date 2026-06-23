import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
  description: 'Download the complete Polycab solar products catalogue — solar DC cables, solar panels, grid-tie inverters, and DC MCBs for residential and commercial solar installations.',
  openGraph: {
    title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
    description: 'Download the complete Polycab solar products catalogue — solar DC cables, solar panels, grid-tie inverters, and DC MCBs.',
    url: 'https://mohitscpl.com/solar-catalogue',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
    description: 'Download the complete Polycab solar products catalogue.',
  },
  alternates: { canonical: 'https://mohitscpl.com/solar-catalogue' },
};

export default async function SolarCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'Solar Grid Tie Inverter 2kw_6kw',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/SOLAR-GRID-TIE-INVERTER-2KW-6KW-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-GRID-TIE-INVERTER-2KW-6KW.pdf'
    },
    {
      title: 'Solar Grid Tie String Inverter 3 Phase 5kw_30kw',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/SOLAR-GRID-TIE-INVERTER-3-PHASE-5KW-30KW-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-GRID-TIE-INVERTER-3-PHASE-5KW-30KW.pdf'
    },
    {
      title: 'Solar Grid Tie String Inverter 25kw_40kw-5g',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/Solar-grid-three-phase-tie-25kw-1-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/Solar-Catalogue_PSIT-25KW-40KW-5G.pdf'
    },
    {
      title: 'Solar Grid Tie String Inverter 50kw_60kw',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/Solar-grid-three-phase-tie-50kw-60KW-string-inverter-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/string-inverter_50KW-60KW.pdf'
    },
    {
      title: 'Solar Grid Tie String Inverter 80kw_110kw-5g',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/Solar-grid-three-phase-tie-80kw-110KW-5G-string-inverter-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/Final-Solar-Leaflet-80kw-110kw-5G.pdf'
    },
    {
      title: 'Solar Grid Tie String Inverter 255k-ehv-5g',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/06-Grid-Tie-Solar-Inverter_3-Phase_-255K-EHV-5G-2-2-294x420.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/Final-Solar-Leaflet-80kw-110kw-5G.pdf'
    },
    {
      title: 'Solar Cable',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/08-Solar-Cable-Brochure-2-211x300-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/SOLAR-CABLE.pdf'
    },
    {
      title: 'Polycrystalline Solar Module',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/Solar-grid-three-phase-tie-50kw-60KW-string-inverter-1.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/string-inverter_50KW-60KW.pdf'
    },
    {
      title: 'Polycab Solar Catalogue',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/first_page.jpg',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/Polycab-Solar-Catalogue.pdf'
    },
    {
      title: 'Solar Catalogue(Grid Tie Inverter, PV Module, Solar DC Cables)',
      category: 'Solar',
      image: '/assets/images/catalogue/solar_catalogue/solar_catalogue.png',
      pdf: '/assets/images/catalogue/solar_catalogue/pdf/REI-Cat-oct3-2023.pdf'
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
                  <h1 className="rs-breadcrumb-title">Solar</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/catalogue')}>Catalogue</Link></span></li>
                      <li><span>Solar Catalogue</span></li>
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
