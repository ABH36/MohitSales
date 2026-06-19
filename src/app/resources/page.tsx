import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
  description: 'Download product brochures, technical specifications, and installation guides for Polycab cables, wires, switchgears, fans, and Dowells cable terminals.',
  openGraph: {
    title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Download product brochures, technical specifications, and installation guides for Polycab cables, wires, switchgears, fans, and Dowells cable terminals.',
    url: 'https://mohit.bdm.co.in/resources',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Download product brochures, technical specifications, and installation guides for Polycab and Dowells products.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/resources' },
};



export default async function ResourcesPage() {
    
  const l = (path: string) => path;

  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/about-us.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Resources</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span>Resources</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="resources_sec">
        <div className="container pricelist">
          <div className="row">
            <div className="col-lg-4">
              <a href="/assets/images/resources/prabhat-wires-ak-pvt-ltd-company-profile.pdf">
                <div className="resources-card">
                  <span style={{ display: 'block' }}>
                    <h4>Company Profile</h4>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="resources_sec">
        <div className="container catalogue">
          <div className="row d-flex justify-content-center">
            <div className="col-lg-4">
              <div className="catalogue-card">
                <a href="/assets/images/catalogue/Cable Laying catalogue_Ord 17709.pdf" target="_blank" rel="noopener noreferrer">
                  <div className="catalogue-icon-box">
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                </a>
                <div className="catalogue-content">
                  <h3>Cable Laying Catalogue</h3>
                  <a href="/assets/images/catalogue/Cable Laying catalogue_Ord 17709.pdf" className="catalogue-btn" target="_blank" rel="noopener noreferrer">
                    View Catalogue
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
