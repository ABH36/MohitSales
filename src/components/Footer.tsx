'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePublicSettings } from './PublicSettingsContext';


export default function Footer() {
  const pathname = usePathname();
  const { getSetting } = usePublicSettings();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const replay = () => {
      [wrapperRef.current, titleRef.current, btnRef.current].forEach(el => el?.classList.remove('is-visible'));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapperRef.current?.classList.add('is-visible');
          setTimeout(() => titleRef.current?.classList.add('is-visible'), 120);
          setTimeout(() => btnRef.current?.classList.add('is-visible'), 300);
        });
      });
    };

    const id = setInterval(replay, 15000);
    return () => clearInterval(id);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* CTA Section */}
      <section className="rs-cta-area rs-cta-two has-theme-orange-two">
        <div className="container">
          <div ref={wrapperRef} className="rs-cta-wrapper footer scroll-reveal" data-direction="left">
            <div
              className="rs-cta-bg-thumb"
              style={{ backgroundImage: "url('/assets/images/bg/footer-top-bg.png')" }}
            ></div>
            <div className="row">
              <div className="w-full">
                <div className="rs-cta-content-wrapper update">
                  <h3
                    ref={titleRef}
                    className="rs-cta-title scroll-reveal"
                    data-direction="left"
                  >
                    For bulk enquiries or custom orders, get in touch with us today!
                  </h3>
                  <div ref={btnRef} className="contact-btn scroll-reveal" data-direction="left" data-delay="180">
                    <div className="rs-banner-btn">
                      <a
                        className="rs-btn has-theme-orange has-icon has-bg"
                        href="/contact-us#contact-us-form"
                      >
                        Get a Quote
                        <span className="icon-box">
                          <svg className="icon-first" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                          </svg>
                          <svg className="icon-second" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                            <path d="M31.71,15.29l-10-10L20.29,6.71,28.59,15H0v2H28.59l-8.29,8.29,1.41,1.41,10-10A1,1,0,0,0,31.71,15.29Z"></path>
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Widget Area */}
      <footer>
        <div className="rs-footer-area rs-footer-two has-space has-theme-orange footer-new">
          <div
            className="rs-footer-bg-thumb"
            style={{ backgroundImage: "url('/assets/images/bg/footer-bg.webp')" }}
          ></div>
          <div className="rs-footer-top">
            <div className="container">
              <div className="row g-5">
                <div className="col-xxl-4 col-lg-4 col-md-4 col-sm-6">
                  <div className="rs-footer-widget footer-2-col-1">
                    <div className="rs-footer-widget-logo mb-25">
                      <Link href="/">
                        <img
                          src="/assets/images/logo/msc_logo_without_bg.png"
                          alt="logo"
                          width={280}
                          height={83}
                          style={{ maxWidth: '100%', height: 'auto' }}
                        />
                      </Link>
                    </div>
                    <div className="rs-footer-widget-content">
                      <p className="rs-footer-widget-description">
                        Founded in 1997, Mohit Sales Corporation Pvt. Ltd. has grown into a trusted and leading name in the electrical distribution industry. With 27+ years of experience, we specialize in delivering high-quality electrical products and solutions across multiple sectors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-xxl-4 col-lg-4 col-md-4 col-sm-6">
                  <div className="rs-footer-widget footer-2-col-2">
                    <h5 className="rs-footer-widget-title">Our Products</h5>
                    <div className="rs-footer-widget-content">
                      <div className="product-columns">
                        <div className="product-col">
                          <h6>Polycab</h6>
                          <ul className="list-unstyled">
                            <li><Link href="/switchgears">Switchgears</Link></li>
                            <li><Link href="/fans">Fans</Link></li>
                            <li><Link href="/solar">Solar</Link></li>
                            <li><Link href="/conduit-accessories">Conduit & Accessories</Link></li>
                            <li><Link href="/home-appliances">Home Appliances</Link></li>
                          </ul>
                        </div>
                        <div className="product-col">
                          <h6>Dowells</h6>
                          <ul className="list-unstyled">
                            <li><Link href="/cable-terminal">Cable Terminal</Link></li>
                            <li><Link href="/gland">Gland</Link></li>
                            <li><Link href="/crimping-tool">Crimping Tool</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xxl-4 col-lg-4 col-md-4 col-sm-6">
                  <div className="rs-footer-widget footer-2-col-3">
                    <div className="rs-footer-widget-content">
                      <div className="rs-footer-widget-meta">
                        <div className="mobile-address">
                          <h5 className="rs-footer-widget-title get-in-touch address">Address</h5>
                          <div className="rs-footer-widget-address">
                            <a target="_blank" rel="noopener noreferrer" href={getSetting('google_maps_embed') || "https://www.google.co.in/maps/place/Siddharth+Farms/@22.7822609,75.9059646,17z/data=!3m1!4b1!4m6!3m5!1s0x39631da62f44dfe1:0xb76224f845182eed!8m2!3d22.7822609!4d75.9085395!16s%2Fg%2F11rw8_q8gf?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D"}>
                              <span 
                                style={{ whiteSpace: 'pre-line' }}
                                dangerouslySetInnerHTML={{ 
                                  __html: getSetting('contact_address', '') 
                                }}
                              />
                            </a>
                          </div>
                        </div>

                        <div className="email mt-3">
                          <h5 className="rs-footer-widget-title get-in-touch">Email Address</h5>
                          <div className="rs-footer-widget-email">
                            <a href={`mailto:${getSetting('contact_email', 'info@mohitscpl.com')}`}>{getSetting('contact_email', 'info@mohitscpl.com')}</a>
                          </div>
                        </div>

                        <div className="mobile-no mt-3">
                          <h5 className="rs-footer-widget-title get-in-touch">Contact</h5>
                          <div className="rs-footer-widget-email mobile">
                            <a href={`tel:${getSetting('contact_phone_1', '+919522952267').replace(/[^+\d]/g, '')}`}>{getSetting('contact_phone_1', '+91 9522952267')}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <ul className="footer-menu">
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/about-us">About Us</Link></li>
                  <li><Link href="/catalogue">Catalogue</Link></li>
                  <li><Link href="/pricelist">Pricelist</Link></li>
                  <li><Link href="/contact-us">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rs-footer-copyright-area rs-copyright-one">
            <div className="container">
              <div className="row justify-content-center">
                <div className="w-full">
                  <div className="rs-footer-copyright has-theme-orange text-center">
                    <p>
                      © <span>2026</span> Mohit Sales Corporation Pvt. Ltd. Designed by{' '}
                      <a href="https://www.bdminfotech.com/" target="_blank" rel="noopener noreferrer">
                        <img
                          src="/assets/images/logo/bdm_cloudtech_white.png"
                          className="bdm-footer-logo inline-block align-middle ml-1"
                          alt="BDM Cloudtech"
                          style={{ display: 'inline-block', verticalAlign: 'middle', height: '28px', width: 'auto' }}
                        />
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
