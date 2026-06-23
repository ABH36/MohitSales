import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
  description: 'Browse the complete Polycab cables catalogue — power cables, armoured cables, XLPE cables, control cables, and flexible cables. Download datasheets and specifications.',
  openGraph: {
    title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
    description: 'Browse the complete Polycab cables catalogue — power cables, armoured cables, XLPE cables, control cables, and flexible cables.',
    url: 'https://mohitscpl.com/cables-catalogue',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
    description: 'Browse the complete Polycab cables catalogue — power, armoured, XLPE, and control cables.',
  },
  alternates: { canonical: 'https://mohitscpl.com/cables-catalogue' },
};

export default async function CablesCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'Uninyvin Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/Uninyvin-Cable.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Uninyvin-cable.pdf'
    },
    {
      title: 'LT-Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/LT-Cable.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/LT-Cable-Catalog.pdf'
    },
    {
      title: 'HT-Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/HT-Cable.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/HT-Cable-Catalogue.pdf'
    },
    {
      title: 'Fire-Survival-Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/Fire-Survival-Cable.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Fire-Survival-Cable-Brochure-Artwork_2.pdf'
    },
    {
      title: 'EHV',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/EHV-Thumb.png',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-EHV.pdf'
    },
    {
      title: 'Cables & Wires Z',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/LDC-Img.png',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/CABLES_HANDBOOK_ORD-10061-V12_FOR-WEB.pdf'
    },
    {
      title: 'Rubber Cable Catalogue',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/Rubber-Cable.png',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Rubber-Cable-Catalogue.pdf'
    },
    {
      title: 'BMS Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/BMS-Cable.png',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/BMS-Cable-Brochure_v3.pdf'
    },
    {
      title: 'Telephone Wire',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/telephone_wire.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-Telephone-wire.pdf'
    },
    {
      title: 'Optical Fiber Cables (OFC)',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/OPTICAL-FIBER-CABLES.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/OPTICAL-FIBER-CABLES.pdf'
    },
    {
      title: 'Lan Cables',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/telephone_wires.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/LAN-Cable.pdf'
    },
    {
      title: 'Instrumentation Cable Catalogue',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/Instrumentation-Cable.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Instrumentation-Cable.pdf'
    },
    {
      title: 'Co-axial Wires',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/Coaxial.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-Coaxial-Cable.pdf'
    },
    {
      title: 'CCTV Cable',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/CCTV-CABLE.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/Polycab-CCTV.pdf'
    },
    {
      title: 'Submersible Cables (Flat)',
      category: 'Cable',
      image: '/assets/images/catalogue/cables_catalogue/SUBMERSIBLE-CABLE.jpg',
      pdf: '/assets/images/catalogue/cables_catalogue/pdf/SUBMERSIBLE-CABLE.pdf'
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
                  <h1 className="rs-breadcrumb-title">Cables</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/catalogue')}>Catalogue</Link></span></li>
                      <li><span>Cables Catalogue</span></li>
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
            <h2>Cables</h2>
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
