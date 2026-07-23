import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { cld } from '@/lib/cloudinary';
import { FileText, ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/resources', {
  title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
  description: 'Download product brochures, technical specifications, and installation guides for Polycab cables, wires, switchgears, fans, and Dowells cable terminals.',
  openGraph: {
    title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Download product brochures, technical specifications, and installation guides for Polycab cables, wires, switchgears, fans, and Dowells cable terminals.',
    url: 'https://mohitscpl.com/resources',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources & Downloads | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Download product brochures, technical specifications, and installation guides for Polycab and Dowells products.',
  },
  alternates: { canonical: 'https://mohitscpl.com/resources' },
});
};



export default async function ResourcesPage() {
    
  const l = (path: string) => path;

  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167900/mohit/inner-banner/about-us.png')}')` }}
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
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span>Resources</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download cards — same design as the homepage explorers (.hce-card).
          The old "Company Profile" card was removed: its PDF never existed in
          this repo and the filename referenced another company entirely
          (prabhat-wires…, a template leftover). */}
      <section className="catalogue-section">
        <div className="container">
          <div className="hce-grid">
            <a
              href="/assets/images/catalogue/Cable Laying catalogue_Ord 17709.pdf"
              className="hce-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hce-card-brand">polycab</span>
              <span className="hce-card-img hce-tint-0">
                <FileText className="hce-card-doc-icon" aria-hidden="true" />
              </span>
              <span className="hce-card-body">
                <span className="hce-card-badge hce-badge-0" aria-hidden="true">
                  <FileText />
                </span>
                <span className="hce-card-name">Cable Laying Catalogue</span>
                <span className="hce-card-cta">
                  View Catalogue <ArrowRight aria-hidden="true" />
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
