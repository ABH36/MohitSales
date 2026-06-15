import React from 'react';



export default async function HomeAppliancesCataloguePage() {
    
  const l = (path: string) => path;

  const catalogs = [
    {
      title: 'Water Heaters',
      category: 'Appliances',
      image: '/assets/images/catalogue/home_appliances_catalogue/water_heater.png',
      pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Water-Heater-Brochure-2023.pdf'
    },
    {
      title: 'Coolers',
      category: 'Appliances',
      image: '/assets/images/catalogue/home_appliances_catalogue/coolers.jpg',
      pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Cooler-Catalogue_2020.pdf'
    },
    {
      title: 'Irons',
      category: 'Appliances',
      image: '/assets/images/catalogue/home_appliances_catalogue/iron.png',
      pdf: '/assets/images/catalogue/home_appliances_catalogue/pdf/Polycab-Iron-Catalogue_2020.pdf'
    }
  ];

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
                  <h1 className="rs-breadcrumb-title">Home Appliances</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href={l('/')}>Home</a></span></li>
                      <li><span><a href={l('/catalogue')}>Catalogue</a></span></li>
                      <li><span>Home Appliances Catalogue</span></li>
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

          <div className="row g-5">
            {catalogs.map((cat, idx) => (
              <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                <div className="catalogue-card">
                  <a href={cat.pdf} className="catalogue-link" target="_blank" rel="noopener noreferrer">
                    <div className="catalogue-img">
                      <img 
                        src={cat.image} 
                        alt={cat.title} 
                      />
                    </div>
                    <div className="catalogue-content">
                      <h3>{cat.title}</h3>
                      <p>{cat.category}</p>
                      <span className="view-btn">View Catalogue</span>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
