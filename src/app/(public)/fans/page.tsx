import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import React from 'react';
import Link from 'next/link';



export default async function FansPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Ceiling Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167933/mohit/our_products/fans/ceiling_fan.png',
      link: l('/polycab/fans/ceiling-fans')
    },
    {
      title: 'Table Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167935/mohit/our_products/fans/table-fan.png',
      link: l('/polycab/fans/table-fans')
    },
    {
      title: 'Pedestal Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167934/mohit/our_products/fans/pedestal-fan.png',
      link: l('/polycab/fans/pedestal-fans')
    },
    {
      title: 'Wall Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167932/mohit/our_products/fans/Wall-Fan.png',
      link: l('/polycab/fans/wall-fans')
    },
    {
      title: 'Exhaust Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167929/mohit/our_products/fans/EXHAUST-FAN.png',
      link: l('/polycab/fans/exhaust-fans')
    },
    {
      title: 'Farrata Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167931/mohit/our_products/fans/Farrata-Fan.png',
      link: l('/polycab/fans/farrata-fans')
    },
    {
      title: 'Air Circulator Fans',
      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167928/mohit/our_products/fans/Air-Circulator.png',
      link: l('/polycab/fans/air-circulator-fans')
    }
  ];

  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167906/mohit/inner-banner/products.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">Fans</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href={l('/')}>Home</Link></span></li>
                      <li><span><Link href={l('/polycab')}>Polycab</Link></span></li>
                      <li><span>Fans</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section - Fans */}
      <section className="catalogue-section">
        <div className="container">

          <div className="section-title text-center mb-5">
            <h2>Fans</h2>
          </div>

          <section className="products-section">
            <div className="container">
              <div className="products-grid">
                {products.map((prod, idx) => (
                  <div key={idx} className="product-card">
                    <Link href={prod.link}>
                      <img
                        src={prod.image}
                        alt={prod.title}
                      />
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
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/fans', {
  title: 'Fans - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Polycab Fans - Ceiling, Table, Pedestal, Wall, Exhaust, Farrata, Air Circulator Fans - Mohit Sales Corporation Pvt. Ltd.',
});
};
