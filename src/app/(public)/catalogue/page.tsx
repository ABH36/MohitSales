import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { categoryIcon } from '@/lib/category-icons';
import { brandFromSlug } from '@/lib/brand';
import { ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/catalogue', {
  title: 'Catalogue - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Product Catalogues - Cables, Switchgears, Fans, Solar, Conduit & Accessories, Home Appliances - Mohit Sales Corporation Pvt. Ltd.',
});
};

export default function CataloguePage() {

  const catalogs = [
    {
      title: 'Cables',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167845/mohit/catalogue/cables.png',
      link: '/cables-catalogue'
    },
    {
      title: 'Switchgears',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167886/mohit/catalogue/switchgear.png',
      link: '/switchgear-catalogue'
    },
    {
      title: 'Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167867/mohit/catalogue/fans.png',
      link: '/fans-catalogue'
    },
    {
      title: 'Solar',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167875/mohit/catalogue/solar.png',
      link: '/solar-catalogue'
    },
    {
      title: 'Conduit & Accessories',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167864/mohit/catalogue/conduit.png',
      link: '/conduit-catalogue'
    },
    {
      title: 'Home Appliances',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167871/mohit/catalogue/home-appliances.png',
      link: '/home-appliances-catalogue'
    },
    {
      title: 'Cable Terminal',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167844/mohit/catalogue/cable-terminal.png',
      // No standalone catalogue PDF yet — link to the product page so the card
      // isn't a dead end.
      link: '/dowells/cable-terminal'
    },
    {
      title: 'Gland',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167870/mohit/catalogue/gland.png',
      link: '/dowells/gland'
    },
    {
      title: 'Crimping Tool',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167866/mohit/catalogue/crimping-tool.png',
      link: '/dowells/crimping-tool'
    }
  ];

  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Catalogue' }], '/catalogue')} />

      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167902/mohit/inner-banner/catalogue.png')}')` }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Catalogue</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>Catalogue</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Grid Section */}
      <section className="catalogue-section">
        <div className="container">

          <div className="section-title text-center mb-5">
            <h2>Product Catalogue</h2>
            <p>Explore our wide range of electrical products across trusted categories</p>
          </div>

          {/* Same card design as the homepage explorers (.hce-card). */}
          <div className="hce-grid">
            {catalogs.map((cat, idx) => (
              <Link key={cat.title} href={cat.link} className="hce-card">
                <span className="hce-card-brand">{brandFromSlug(cat.link)}</span>
                <span className={`hce-card-img hce-tint-${idx % 4}`}>
                  <img src={cld(cat.image)} alt={cat.title} loading="lazy" />
                </span>
                <span className="hce-card-body">
                  <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                    {categoryIcon(cat.title)}
                  </span>
                  <span className="hce-card-name">{cat.title}</span>
                  <span className="hce-card-cta">
                    {cat.link.startsWith('/dowells') ? 'View Products' : 'View Catalogue'}
                    <ArrowRight aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}
