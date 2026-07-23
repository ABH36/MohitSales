import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import { cld } from '@/lib/cloudinary';
import { categoryIcon } from '@/lib/category-icons';
import { ArrowRight } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/polycab', {
  title: 'Polycab - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Authorised Distributor of Polycab Cables, Wires, Switchgears, Fans, Solar, Conduit & Home Appliances',
});
};

const PRODUCTS = [
  { title: 'Cables By Application', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167950/mohit/our_products/polycab/polycab_cable.png', link: '/industries/cables-by-application/building-infrastructure' },
  { title: 'Cables By Standards', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167956/mohit/our_products/polycab/polycab_wires.png', link: '/industries/cables-by-standards/indian-standards' },
  { title: 'Cables By Type', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167956/mohit/our_products/polycab/polycab_wires.png', link: '/industries/cables-by-type/lv-power-cable' },
  { title: 'Switchgears', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167955/mohit/our_products/polycab/polycab_switchgears.png', link: '/switchgears' },
  { title: 'Fans', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167953/mohit/our_products/polycab/polycab_fans.png', link: '/fans' },
  { title: 'Solar', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167953/mohit/our_products/polycab/polycab_solar.png', link: '/solar' },
  { title: 'Conduit & Accessories', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167951/mohit/our_products/polycab/polycab_conduit_and_accessories.png', link: '/conduit-accessories' },
  { title: 'Home Appliances', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167949/mohit/our_products/polycab/home_appliances.png', link: '/home-appliances' },
];

export default function PolycabPage() {
  return (
    <>
      <main>
        {/* breadcrumb area start */}
        <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
          <div 
            className="rs-breadcrumb-bg"
            style={{ backgroundImage: `url('${cld('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')}')` }}
          ></div>
          <div className="container">
            <div className="row">
              <div className="w-full">
                <div className="rs-breadcrumb-content-wrapper">
                  <div className="rs-breadcrumb-title-wrapper">
                    <h1 className="rs-breadcrumb-title">Polycab</h1>
                  </div>
                  <div className="rs-breadcrumb-menu">
                    <nav>
                      <ul>
                        <li><span><Link href="/">Home</Link></span></li>
                        <li><span>Polycab</span></li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* breadcrumb area end */}

        <section className="catalogue-section">
          <div className="container">
            <div className="section-title text-center mb-5">
              <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text="Polycab Cables" /></h2>
            </div>

            {/* Same card design as the homepage explorers (.hce-card). */}
            <div className="hce-grid">
              {PRODUCTS.map((prod, idx) => (
                <Link key={idx} href={prod.link} className="hce-card">
                  <span className="hce-card-brand">polycab</span>
                  <span className={`hce-card-img hce-tint-${idx % 4}`}>
                    <img src={cld(prod.image, 'f_auto,q_auto,w_600')} alt={prod.title} loading="lazy" decoding="async" />
                  </span>
                  <span className="hce-card-body">
                    <span className={`hce-card-badge hce-badge-${idx % 4}`} aria-hidden="true">
                      {categoryIcon(prod.title)}
                    </span>
                    <span className="hce-card-name">{prod.title}</span>
                    <span className="hce-card-cta">
                      Explore More <ArrowRight aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
