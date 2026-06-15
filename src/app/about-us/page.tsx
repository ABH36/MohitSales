import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | Mohit Sales Corporation Pvt. Ltd.',
  description: 'About Mohit Sales Corporation Pvt. Ltd. - Authorised Distributor of Polycab and Dowells',
};

export default function AboutUsPage() {
  return (
    <main>
      {/* breadcrumb area start */}
      <section className="rs-breadcrumb-area rs-breadcrumb-one p-relative">
        <div 
          className="rs-breadcrumb-bg"
          style={{ backgroundImage: "url('/assets/images/inner-banner/about-us.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="w-full">
              <div className="rs-breadcrumb-content-wrapper">
                <div className="rs-breadcrumb-title-wrapper">
                  <h1 className="rs-breadcrumb-title">About Us</h1>
                </div>
                <div className="rs-breadcrumb-menu">
                  <nav>
                    <ul>
                      <li><span><Link href="/">Home</Link></span></li>
                      <li><span>About Us</span></li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* breadcrumb area end */}

      <section className="about-inner">
        <div className="container">
          <div className="row">
            <div className="about-heading">
              <h2>About Us</h2>
            </div>
            <div className="about-inner-content"></div>
            
            <div className="prabhat-about" id="prabhat-wire-llp">
              <h3>About Mohit Sales Corporation Pvt. Ltd.</h3>
              <p>Founded in <strong>1997</strong>, Mohit Sales Corporation Pvt. Ltd. has grown into a trusted and leading name in the electrical distribution industry. With <strong> 27+ years of experience</strong>, we specialize in delivering high-quality electrical products and solutions across multiple sectors.</p>

              <p>As an <strong>Authorised Distributor of Polycab and Dowells</strong> we ensure our customers receive genuine products backed by technical expertise, timely supply, and reliable after-sales support. Our strong industry presence, expert team, and customer-centric approach have enabled us to consistently meet the evolving needs of contractors, industries, retailers, and infrastructure projects.</p>
              
              <p>Mohit Sales Corporation continues to build a reputation for trust, quality, and professionalism—values that form the foundation of our long-standing success.</p>

              <div className="core-values llp">
                <h4>Our Authorised Brands & Product Portfolio</h4>
                <div className="brand-table-wrapper">
                  <table className="brand-table">
                    <thead>
                      <tr>
                        <th>Brand</th>
                        <th>Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="brand-name polycab">Polycab</td>
                        <td>
                          <ul>
                            <li>Cables</li>
                            <li>Switchgears</li>
                            <li>Fans</li>
                            <li>Solar Products</li>
                            <li>Conduits & Accessories</li>
                            <li>Home Appliances</li>
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="brand-name dowells">Dowells</td>
                        <td>
                          <ul>
                            <li>Cable Terminals</li>
                            <li>Cable Glands</li>
                            <li>Crimping Tools</li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="core-values llp">
                <h4>Vision</h4>
                <p>To be the most trusted and preferred electrical distribution company in India by delivering innovative, reliable, and sustainable electrical solutions that empower industries, infrastructure, and homes.</p>
              </div>

              <div className="core-values">
                <h4>Mission</h4>
                <ul>
                  <li><i className="fa-solid fa-arrow-right-long"></i>To provide <strong>top-quality electrical products</strong> through strong partnerships with leading brands.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>To ensure <strong>unmatched customer satisfaction</strong> with timely delivery, expert guidance, and professional service.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>To strengthen our network and deliver <strong>cost-effective, safe, and energy-efficient solutions.</strong></li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>To embrace new technologies and market trends to support the nation's <strong>electrical and infrastructure growth.</strong> </li>
                </ul>
              </div>

              <div className="core-values mt-3">
                <h4>Core Values</h4>
                <ul>
                  <li><i className="fa-solid fa-arrow-right-long"></i> <strong>Integrity</strong>- We commit to transparency and ethical business practices. </li>
                  <li><i className="fa-solid fa-arrow-right-long"></i><strong>Quality</strong>- We deliver only genuine and reliable products from top global brands.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i><strong>Customer Focus </strong>- Your requirements drive our actions.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i><strong>Reliability</strong>- On-time supply and trustworthy service, always.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i><strong>Innovation </strong>- Adapting to new technologies and market needs.</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i><strong>Long-Term Relationships </strong>- Building partnerships backed by trust and performance.</li>
                </ul>
              </div>

              <div className="core-values mt-3">
                <h4>Why Choose Us?</h4>
                <ul>
                  <li><i className="fa-solid fa-arrow-right-long"></i> 27+ years of industry expertise </li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Authorised distributor for leading global brands</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Wide product range with strong inventory and fast delivery</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Technical product knowledge and support</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Trusted by contractors, industries, and infrastructure developers</li>
                </ul>
              </div>

              <div className="core-values mt-3">
                <h4>Industries We Serve</h4>
                <ul>
                  <li><i className="fa-solid fa-arrow-right-long"></i> Residential & Commercial Projects</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Industrial Manufacturing</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Infrastructure & Construction</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Renewable Energy Projects</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Oil & Gas</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>OEMs</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>EPC Contractors</li>
                  <li><i className="fa-solid fa-arrow-right-long"></i>Retail Electrical Markets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
