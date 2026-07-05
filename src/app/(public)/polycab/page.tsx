import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
﻿import React from 'react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';
import { cld } from '@/lib/cloudinary';

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
      <style dangerouslySetInnerHTML={{__html: `
        .products-section {
            padding: 80px 20px;
            background: #f8f9fb;
        }
        .custom-container {
            max-width: 1200px;
            margin: auto;
        }
        .section-title {
            text-align: center;
            margin-bottom: 50px;
        }
        .section-title h2 {
            font-size: 36px;
            font-weight: 700;
            color: #222;
            position: relative;
        }
        .section-title h2::after {
            content: "";
            width: 60px;
            height: 4px;
            background: #007bff;
            display: block;
            margin: 12px auto;
            border-radius: 2px;
        }
        .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
        }
        .product-card {
            background: #fff;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            text-align: center;
            display: block;
            text-decoration: none;
            color: inherit;
        }
        .product-card:hover {
            transform: translateY(-10px);
        }
        .product-card img {
            width: 100%;
            border-radius: 10px;
            margin-bottom: 15px;
        }

        .product-card h3 {
            font-size: 20px;
            margin-bottom: 10px;
        }
        @media (max-width: 992px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 576px) {
            .products-grid {
                grid-template-columns: 1fr;
            }
        }
      `}} />

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

            <section className="products-section">
              <div className="custom-container">
                {/* Products Grid */}
                <div className="products-grid">
                  {PRODUCTS.map((prod, idx) => (
                    <div key={idx} className="product-card">
                      <Link href={prod.link}>
                        <img src={cld(prod.image)} alt={prod.title} loading="lazy" decoding="async" />
                        <h3>{prod.title}</h3>
                        <div className="pricelist-button">
                          <span className="pricelist-btn">Explore More</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
