import React from 'react';



export default async function HomeAppliancesPage() {
    
  const l = (path: string) => path;

  const products = [
    {
      title: 'Water Heaters',
      image: '/assets/images/our_products/home_appliances/1.png',
      link: l('/home-appliances/water-heaters')
    },
    {
      title: 'Irons',
      image: '/assets/images/our_products/home_appliances/2.png',
      link: l('/home-appliances/irons')
    },
    {
      title: 'Coolers',
      image: '/assets/images/our_products/home_appliances/3.png',
      link: l('/home-appliances/coolers')
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
                  <h1 className="rs-breadcrumb-title">Home Appliances</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/polycab')}>Polycab</a></span></li>
                      <li><span>Home Appliances</span></li>
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
            <h2>Home Appliances</h2>
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
