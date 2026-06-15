import React from 'react';



export default async function GlandPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Single Compression Gland',
      image: '/assets/images/our_products/gland/1.jpg',
      link: l('/gland/single-compression-gland')
    },
    {
      title: 'Double Compression Gland',
      image: '/assets/images/our_products/gland/2.jpg',
      link: l('/gland/double-compression-gland')
    },
    {
      title: 'Flang Type Gland',
      image: '/assets/images/our_products/gland/3.jpg',
      link: l('/gland/flang-type-gland')
    },
    {
      title: 'Shrouds',
      image: '/assets/images/our_products/gland/4.jpg',
      link: l('/gland/shrouds')
    },
    {
      title: 'Earthing Tag',
      image: '/assets/images/our_products/gland/5.jpg',
      link: l('/gland/earthing-tag')
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
                  <h1 className="rs-breadcrumb-title">Gland</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/dowells')}>Dowells</a></span></li>
                      <li><span>Gland</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="catalogue-section">
        <div className="container">
          <div className="section-title text-center mb-5">
            <h2>Gland</h2>
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
                        <span className="pricelist-btn">
                          Explore More
                        </span>
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
