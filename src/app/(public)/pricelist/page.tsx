'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { categoryIcon } from '@/lib/category-icons';
import { ArrowRight } from 'lucide-react';

export default function PricelistPage() {
  const [activeTab, setActiveTab] = useState<'polycab' | 'dowells'>('polycab');

  const polycabItems = [
    {
      title: 'Cables',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167845/mohit/catalogue/cables.png',
      link: '/cables-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Switchgears',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167886/mohit/catalogue/switchgear.png',
      link: '/switchgear-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167867/mohit/catalogue/fans.png',
      link: '/fans-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Solar',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167875/mohit/catalogue/solar.png',
      link: '/solar-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Conduit & Accessories',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167864/mohit/catalogue/conduit.png',
      link: '/conduit-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Home Appliances',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167871/mohit/catalogue/home-appliances.png',
      link: '/home-appliances-catalogue',
      label: 'View Catalogue'
    },
  ];

  // Each of these pointed at /catalogue, which lists only the six Polycab
  // catalogues — so a visitor after cable terminals landed on a page with
  // nothing about them. They now go to their own product pages, which exist
  // and carry the actual content.
  const dowellsItems = [
    {
      title: 'Cable Terminal',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167844/mohit/catalogue/cable-terminal.png',
      link: '/cable-terminal',
      label: 'View Products'
    },
    {
      title: 'Gland',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167870/mohit/catalogue/gland.png',
      link: '/gland',
      label: 'View Products'
    },
    {
      title: 'Crimping Tool',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167866/mohit/catalogue/crimping-tool.png',
      link: '/crimping-tool',
      label: 'View Products'
    },
  ];


  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Pricelist' }], '/pricelist')} />

      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167905/mohit/inner-banner/pricelist.png')}')` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Product Catalogues</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Catalogues</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricelist Section */}
      <section className="pricelist-inner">
        <div className="container pricelist">


          {/* Tabs */}
          <ul className="pricelist-tabs">
            <li
              className={activeTab === 'polycab' ? 'active' : ''}
              onClick={() => setActiveTab('polycab')}
              data-tab="polycab"
            >
              Polycab
            </li>
            <li
              className={activeTab === 'dowells' ? 'active' : ''}
              onClick={() => setActiveTab('dowells')}
              data-tab="dowells"
            >
              Dowells
            </li>
          </ul>

          {/* Tab Content — cards share the homepage explorer design (.hce-card). */}
          <div className="pricelist-tab-content">
            <div className={`tab-pane ${activeTab === 'polycab' ? 'active' : ''}`} id="polycab">
              <div className="hce-grid">
                {polycabItems.map((item, idx) => (
                  <Link key={item.title} href={item.link} className="hce-card">
                    <span className={`hce-card-img hce-tint-${idx % 4}`}>
                      <img src={cld(item.image)} alt={item.title} loading="lazy" />
                    </span>
                    <span className="hce-card-body">
                      <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                        {categoryIcon(item.title)}
                      </span>
                      <span className="hce-card-name">{item.title}</span>
                      <span className="hce-card-cta">
                        {item.label} <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'dowells' ? 'active' : ''}`} id="dowells">
              <div className="hce-grid">
                {dowellsItems.map((item, idx) => (
                  <Link key={item.title} href={item.link} className="hce-card">
                    <span className={`hce-card-img hce-tint-${idx % 4}`}>
                      <img src={cld(item.image)} alt={item.title} loading="lazy" />
                    </span>
                    <span className="hce-card-body">
                      <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                        {categoryIcon(item.title)}
                      </span>
                      <span className="hce-card-name">{item.title}</span>
                      <span className="hce-card-cta">
                        {item.label} <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
