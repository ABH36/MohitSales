import React from 'react';



export default async function ConduitAccessoriesPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'UPVC Conduit',
      image: '/assets/images/our_products/conduit_accessories/CONDUITS.png',
      link: l('/conduit-accessories/upvc-conduit')
    },
    {
      title: 'Concealed Box',
      image: '/assets/images/our_products/conduit_accessories/Concealed-Box.png',
      link: l('/conduit-accessories/concealed-box')
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
                  <h1 className="rs-breadcrumb-title">Conduit & Accessories</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/polycab')}>Polycab</a></span></li>
                      <li><span>Conduit & Accessories</span></li>
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
            <h2>Conduit & Accessories</h2>
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
