import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Catalogue - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Product Catalogues - Cables, Switchgears, Fans, Solar, Conduit & Accessories, Home Appliances - Mohit Sales Corporation Pvt. Ltd.',
};

export default function CataloguePage() {

  const catalogs = [
    {
      title: 'Cables',
      image: '/assets/images/catalogue/cables.png',
      link: '/cables-catalogue'
    },
    {
      title: 'Switchgears',
      image: '/assets/images/catalogue/switchgear.png',
      link: '/switchgear-catalogue'
    },
    {
      title: 'Fans',
      image: '/assets/images/catalogue/fans.png',
      link: '/fans-catalogue'
    },
    {
      title: 'Solar',
      image: '/assets/images/catalogue/solar.png',
      link: '/solar-catalogue'
    },
    {
      title: 'Conduit & Accessories',
      image: '/assets/images/catalogue/conduit.png',
      link: '/conduit-catalogue'
    },
    {
      title: 'Home Appliances',
      image: '/assets/images/catalogue/home-appliances.png',
      link: '/home-appliances-catalogue'
    },
    {
      title: 'Cable Terminal',
      image: '/assets/images/catalogue/cable-terminal.png',
      link: '#'
    },
    {
      title: 'Gland',
      image: '/assets/images/catalogue/gland.png',
      link: '#'
    },
    {
      title: 'Crimping Tool',
      image: '/assets/images/catalogue/crimping-tool.png',
      link: '#'
    }
  ];

  return (
    <main>

      {/* Breadcrumb Area */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/catalogue.png')" }}
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
                  <img src={cat.image} alt={cat.title} />
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
