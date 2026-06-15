import React from 'react';
import Link from 'next/link';
import SplitText from '@/components/SplitText';

export const metadata = {
  title: 'Polycab - Mohit Sales Corporation Pvt. Ltd.',
  description: 'Authorised Distributor of Polycab Cables, Wires, Switchgears, Fans, Solar, Conduit & Home Appliances',
};

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
            style={{ backgroundImage: "url('/assets/images/inner-banner/products.png')" }}
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

                  <div className="product-card">
                    <Link href="/industries/cables-by-application/building-infrastructure">
                      <img src="/assets/images/our_products/polycab/polycab_cable.png" alt="Cables By Application" />
                      <h3>Cables By Application</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/industries/cables-by-standards/indian-standards">
                      <img src="/assets/images/our_products/polycab/polycab_wires.png" alt="Cables By Standards" />
                      <h3>Cables By Standards</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/industries/cables-by-type/lv-power-cable">
                      <img src="/assets/images/our_products/polycab/polycab_wires.png" alt="Cables By Type" />
                      <h3>Cables By Type</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/switchgears">
                      <img src="/assets/images/our_products/polycab/polycab_switchgears.png" alt="Switchgears" />
                      <h3>Switchgears</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/fans">
                      <img src="/assets/images/our_products/polycab/polycab_fans.png" alt="Fans" />
                      <h3>Fans</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/solar">
                      <img src="/assets/images/our_products/polycab/polycab_solar.png" alt="Solar" />
                      <h3>Solar</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/conduit-accessories">
                      <img src="/assets/images/our_products/polycab/polycab_conduit_and_accessories.png" alt="Conduit & Accessories" />
                      <h3>Conduit & Accessories</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                  <div className="product-card">
                    <Link href="/home-appliances">
                      <img src="/assets/images/our_products/polycab/home_appliances.png" alt="Home Appliances" />
                      <h3>Home Appliances</h3>
                      <div className="pricelist-button">
                        <span className="pricelist-btn">Explore More</span>
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
