'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricelistPage() {
  const [activeTab, setActiveTab] = useState<'polycab' | 'dowells'>('polycab');

  const polycabItems = [
    {
      title: 'Cables',
      image: '/assets/images/catalogue/cables.png',
      link: '/cables-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Switchgears',
      image: '/assets/images/catalogue/switchgear.png',
      link: '/switchgear-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Fans',
      image: '/assets/images/catalogue/fans.png',
      link: '/fans-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Solar',
      image: '/assets/images/catalogue/solar.png',
      link: '/solar-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Conduit & Accessories',
      image: '/assets/images/catalogue/conduit.png',
      link: '/conduit-catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Home Appliances',
      image: '/assets/images/catalogue/home-appliances.png',
      link: '/home-appliances-catalogue',
      label: 'View Catalogue'
    },
  ];

  const dowellsItems = [
    {
      title: 'Cable Terminal',
      image: '/assets/images/catalogue/cable-terminal.png',
      link: '/catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Gland',
      image: '/assets/images/catalogue/gland.png',
      link: '/catalogue',
      label: 'View Catalogue'
    },
    {
      title: 'Crimping Tool',
      image: '/assets/images/catalogue/crimping-tool.png',
      link: '/catalogue',
      label: 'View Catalogue'
    },
  ];

  const activeItems = activeTab === 'polycab' ? polycabItems : dowellsItems;

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

          {/* Info Banner */}
          <div className="pricelist-info-banner">
            <p>
              Browse our complete product catalogues below. For current pricing, please
              <a href="/contact-us"> contact us directly</a> or send an enquiry.
            </p>
          </div>

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

          {/* Tab Content */}
          <div className="pricelist-tab-content">
            <div className={`tab-pane ${activeTab === 'polycab' ? 'active' : ''}`} id="polycab">
              <div className="row">
                {polycabItems.map((item, idx) => (
                  <div key={idx} className="col-lg-4 col-md-6 mb-4">
                    <div className="pricelist-card">
                      <div className="pricelist-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="pricelist-title">
                        <p>{item.title}</p>
                      </div>
                      <div className="pricelist-button">
                        <Link href={item.link} className="pricelist-btn">{item.label}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'dowells' ? 'active' : ''}`} id="dowells">
              <div className="row">
                {dowellsItems.map((item, idx) => (
                  <div key={idx} className="col-lg-4 col-md-6 mb-4">
                    <div className="pricelist-card">
                      <div className="pricelist-image">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="pricelist-title">
                        <p>{item.title}</p>
                      </div>
                      <div className="pricelist-button">
                        <Link href={item.link} className="pricelist-btn">{item.label}</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}
