import React from 'react';
import SplitText from '@/components/SplitText';

export const metadata = {
  title: 'Dowells - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Dowells Cable Terminals, Glands, and Crimping Tools - Mohit Sales Corporation Pvt. Ltd.',
};

export default function DowellsPage() {

  const products = [
    {
      title: 'Cable Terminal',
      image: '/assets/images/our_products/dowells/cable_terminal_dowells.png',
      link: '/cable-terminal'
    },
    {
      title: 'Gland',
      image: '/assets/images/our_products/dowells/gland_dowells.png',
      link: '/gland'
    },
    {
      title: 'Crimping Tool',
      image: '/assets/images/our_products/dowells/crimping_tool_dowells.png',
      link: '/crimping-tool'
    }
  ];

  return (
    <main>
      <style dangerouslySetInnerHTML={{__html: `
        .products-section {
          padding: 80px 20px;
          background: #f8f9fb;
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
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          text-align: center;
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .product-card:hover {
          transform: translateY(-10px);
        }
        .product-card a {
          display: block;
          text-decoration: none;
          color: inherit;
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
        .product-card p {
          font-size: 14px;
          color: #555;
          margin-bottom: 15px;
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
                  <h1 className="rs-breadcrumb-title">Dowells</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><a href="/">Home</a></span></li>
                      <li><span>Dowells</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="catalogue-section">
        <div className="container">

          <div className="section-title text-center mb-5">
            <h2>Dowells</h2>
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
