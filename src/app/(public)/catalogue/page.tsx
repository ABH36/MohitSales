import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import { cld } from '@/lib/cloudinary';

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
      link: '#'
    },
    {
      title: 'Gland',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167870/mohit/catalogue/gland.png',
      link: '#'
    },
    {
      title: 'Crimping Tool',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167866/mohit/catalogue/crimping-tool.png',
      link: '#'
    }
  ];

  return (
    <main>

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

          <div className="row">
            {catalogs.map((cat, idx) => (
              <div key={idx} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <Link href={cat.link} className="catalogue-card">
                  <img src={cld(cat.image)} alt={cat.title} />
                  <h5>{cat.title}</h5>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}
