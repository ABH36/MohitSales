import React from 'react';



export default async function FansPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Ceiling Fans',
      image: '/assets/images/our_products/fans/ceiling_fan.png',
      link: l('/fans/ceiling-fans')
    },
    {
      title: 'Table Fans',
      image: '/assets/images/our_products/fans/table-fan.png',
      link: l('/fans/table-fans')
    },
    {
      title: 'Pedestal Fans',
      image: '/assets/images/our_products/fans/pedestal-fan.png',
      link: l('/fans/pedestal-fans')
    },
    {
      title: 'Wall Fans',
      image: '/assets/images/our_products/fans/Wall-Fan.png',
      link: l('/fans/wall-fans')
    },
    {
      title: 'Exhaust Fans',
      image: '/assets/images/our_products/fans/EXHAUST-FAN.png',
      link: l('/fans/exhaust-fans')
    },
    {
      title: 'Farrata Fans',
      image: '/assets/images/our_products/fans/Farrata-Fan.png',
      link: l('/fans/farrata-fans')
    },
    {
      title: 'Air Circulator Fans',
      image: '/assets/images/our_products/fans/Air-Circulator.png',
      link: l('/fans/air-circulator')
    }
  ];

  return (
    <main>
      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}
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
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/polycab')}>Polycab</a></span></li>
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
                    <a href={prod.link}>
                      <img
                        src={prod.image}
                        alt={prod.title}
                      />
                      <h3>{prod.title}</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </a>
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

export const metadata = {
  title: 'Fans - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Polycab Fans - Ceiling, Table, Pedestal, Wall, Exhaust, Farrata, Air Circulator Fans - Mohit Sales Corporation Pvt. Ltd.',
};
