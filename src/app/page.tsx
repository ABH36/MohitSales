import React from 'react';
import type { Metadata } from 'next';
import BannerSlider from '../components/BannerSlider';
import ProductSlider from '../components/ProductSlider';
import IndustriesSlider from '../components/IndustriesSlider';
import HomeContactForm from '../components/HomeContactForm';
import HomeAchievements from '../components/HomeAchievements';
import ClienteleSlider from '../components/ClienteleSlider';
import SplitText from '../components/SplitText';
import SchemaInjector from '../components/SchemaInjector';
import PromoPopup from '../components/PromoPopup';
import prisma from '@/lib/prisma';

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateMetadata(): Promise<Metadata> {
  const seoMeta = await prisma.seoMeta.findUnique({ where: { page: '/' } }).catch(() => null);
  if (!seoMeta) return {};
  return {
    title: seoMeta.title || undefined,
    description: seoMeta.description || undefined,
    keywords: seoMeta.keywords ? seoMeta.keywords.split(',').map(k => k.trim()) : undefined,
    robots: { index: !seoMeta.noIndex, follow: !seoMeta.noFollow },
    alternates: seoMeta.canonicalUrl ? { canonical: seoMeta.canonicalUrl } : undefined,
    openGraph: {
      title: seoMeta.ogTitle || seoMeta.title || undefined,
      description: seoMeta.description || undefined,
      images: seoMeta.ogImage ? [seoMeta.ogImage] : undefined,
    },
  };
}

const FALLBACK_ABOUT = {
  title: 'About Us',
  subtitle: 'Mohit Sales Corporation Pvt. Ltd.',
  paragraphs: [
    'Established in 1997, Mohit Sales Corporation Pvt. Ltd. has built a strong reputation as a trusted leader in the electrical distribution industry. With over 27+ years of experience, we deliver reliable, high-quality electrical products and customized solutions to diverse sectors.',
    'We are a proud Authorised Distributor of Polycab and Dowells, ensuring our customers receive only genuine, certified products that meet the highest industry standards.',
    'Our success is driven by a customer-first approach, technical expertise, timely delivery, and dependable after-sales support. Today, we proudly serve contractors, industries, retailers, and large-scale infrastructure projects, helping power growth and innovation across the region.',
  ],
  imageUrl: '/assets/images/about/authorized distributor.png',
};

export default async function Page() {
  const cmsAbout = await prisma.cmsSection.findUnique({
    where: { page_section: { page: 'homepage', section: 'content' } },
  }).catch(() => null);

  let aboutData = FALLBACK_ABOUT;
  if (cmsAbout?.content) {
    try {
      const parsed = JSON.parse(cmsAbout.content);
      if (parsed.title || parsed.content || parsed.imageUrl) {
        aboutData = {
          title: parsed.title || FALLBACK_ABOUT.title,
          subtitle: FALLBACK_ABOUT.subtitle,
          paragraphs: parsed.content
            ? parsed.content.split('\n').map((p: string) => p.trim()).filter(Boolean)
            : FALLBACK_ABOUT.paragraphs,
          imageUrl: parsed.imageUrl || FALLBACK_ABOUT.imageUrl,
        };
      }
    } catch {}
  }

  const polycabProducts = [
    {
      title: 'MV Power Cables',
      image: '/assets/images/our_products/polycab-mv-is-7098-ii-3c-a2xwy.png',
      link: '/industries/cables-by-type/mv-power-cable'
    },
    {
      title: 'LV Power Cables',
      image: '/assets/images/our_products/polycab-lv-is-7098-i-4c-a2xfy.png',
      link: '/industries/cables-by-type/lv-power-cable'
    },
    {
      title: 'EHV Power Cable',
      image: '/assets/images/our_products/polycab-ehv-cu-al-cor-132kv.png',
      link: '/industries/cables-by-type/ehv-power-cable'
    }
  ];

  const dowellsProducts = [
    {
      title: 'Crimping Tool',
      image: '/assets/images/our_products/dowells/crimping_tool.png',
      link: '/crimping-tool'
    },
    {
      title: 'Gland',
      image: '/assets/images/our_products/dowells/gland.png',
      link: '/gland'
    },
    {
      title: 'Cable Terminal',
      image: '/assets/images/our_products/dowells/cable_terminal.png',
      link: '/cable-terminal'
    }
  ];


  return (
    <>
    <SchemaInjector page="/" />
    <main>
      {/* Banner slider area */}
      <BannerSlider />

      {/* About Us section - matches original .image-box-section.about-us */}
      <section className="image-box-section about-us pt-100 pb-50">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 w-full mb-5 mb-lg-0 scroll-reveal" data-direction="left" data-delay="100">
              <div className="image_boxes style_three position-relative">
                <img
                  src={aboutData.imageUrl}
                  alt="Authorized Distributor of Polycab and Dowells"
                  className="img-fluid rounded shadow"
                />
              </div>
            </div>

            <div className="col-lg-6 w-full scroll-reveal" data-direction="right" data-delay="250">
              <div className="title_all_box style_one dark_color">
                <div className="title_sections">
                  <div className="about-heading mb-2">
                    <h2>{aboutData.title}</h2>
                  </div>
                  <h4 className="mb-3">{aboutData.subtitle}</h4>
                  {aboutData.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - matches original .rs-why-choose-area.rs-why-choose-three.wcu_sec */}
      <section className="rs-why-choose-area rs-why-choose-three wcu_sec">
        <span className="rs-why-choose-shape gsap-move down-200 start-61"></span>
        <div 
          className="rs-why-choose-bg-thumb" 
          data-background="/assets/images/bg/background.png"
          style={{ backgroundImage: "url('/assets/images/bg/background.png')" }}
        ></div>
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-6 col-md-10">
              <div className="rs-why-choose-content-wrapper section-space scroll-reveal" data-delay="100">
                <div className="rs-section-title-wrapper section-title-space">
                  <span className="justify-content-start rs-section-subtitle has-stroke">
                    Why Choose Us
                  </span>
                  <h2 className="rs-section-title rs-split-text-enable split-in-fade" suppressHydrationWarning={true}>
                    <SplitText text="Empowering Projects, Ensuring Reliability" />
                  </h2>
                </div>
                
                <div className="rs-why-choose-content-inner">
                  {/* Item 1 */}
                  <div className="rs-why-choose-content-item" data-wow-delay=".3s" data-wow-duration="1s">
                    <div className="rs-why-choose-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="39" viewBox="0 0 52 39" fill="none">
                        <path d="M47.7749 4.22461C47.7749 5.91816 46.7266 5.91816 46.7266 7.69235C46.7266 9.3859 47.7749 9.3859 47.7749 11.1601C47.7749 12.8536 46.7266 12.8536 46.7266 14.6278C46.7266 16.3214 47.7749 16.3214 47.7749 18.0956C47.7749 19.7891 46.7266 19.7891 46.7266 21.5633C46.7266 23.2569 47.7749 23.2569 47.7749 25.0311C47.7749 26.7246 46.7266 26.7246 46.7266 28.4988C46.7266 30.1923 47.7749 30.1924 47.7749 31.9665" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M26.0003 29.7916C30.3206 29.7916 33.8229 26.2894 33.8229 21.9691C33.8229 17.6488 30.3206 14.1465 26.0003 14.1465C21.68 14.1465 18.1777 17.6488 18.1777 21.9691C18.1777 26.2894 21.68 29.7916 26.0003 29.7916Z" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M30.3542 28.4199V38.0973L25.9994 34.4683L21.6445 38.0973V28.4199C22.9349 29.307 24.3865 29.7909 25.9994 29.7909C27.6123 29.7909 29.1445 29.307 30.3542 28.4199Z" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M26.0014 16.8086L27.5336 19.8731L30.9207 20.357L28.5014 22.7763L29.0659 26.2441L26.0014 24.6312L22.9369 26.2441L23.5014 22.7763L21.082 20.357L24.4691 19.8731L26.0014 16.8086Z" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M18.4194 35.0323H1V1H51V35.0323H33.5806" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M4.22656 4.22461C5.75882 4.22461 5.75882 5.273 7.37172 5.273C8.90398 5.273 8.90398 4.22461 10.5169 4.22461C12.0491 4.22461 12.0491 5.273 13.662 5.273C15.1943 5.273 15.1943 4.22461 16.8072 4.22461C18.3395 4.22461 18.3395 5.273 19.9524 5.273C21.4846 5.273 21.4846 4.22461 23.0975 4.22461C24.6298 4.22461 24.6298 5.273 26.2427 5.273C27.7749 5.273 27.7749 4.22461 29.3879 4.22461C30.9201 4.22461 30.9201 5.273 32.533 5.273C34.0653 5.273 34.0653 4.22461 35.6782 4.22461C37.2104 4.22461 37.2104 5.273 38.8233 5.273C40.4362 5.273 40.3556 4.22461 41.9685 4.22461C43.5008 4.22461 43.5008 5.273 45.1137 5.273C46.6459 5.273 46.6459 4.22461 48.2588 4.22461" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M4.22656 4.22461C4.22656 5.91816 5.27495 5.91816 5.27495 7.69235C5.27495 9.3859 4.22656 9.3859 4.22656 11.1601C4.22656 12.8536 5.27495 12.8536 5.27495 14.6278C5.27495 16.3214 4.22656 16.3214 4.22656 18.0149C4.22656 19.7085 5.27495 19.7085 5.27495 21.4827C5.27495 23.1762 4.22656 23.1762 4.22656 24.9504C4.22656 26.644 5.27495 26.644 5.27495 28.4182C5.27495 30.1117 4.22656 30.1117 4.22656 31.8859" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M33.582 31.1613C34.0659 31.4839 34.3885 31.8064 35.2756 31.8064C36.8078 31.8064 36.8078 30.7581 38.4207 30.7581C40.0336 30.7581 39.953 31.8064 41.5659 31.8064C43.1788 31.8064 43.0982 30.7581 44.7111 30.7581C46.2433 30.7581 46.2433 31.8064 47.8562 31.8064" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M4.22656 31.8062C5.75882 31.8062 5.75882 30.7578 7.37172 30.7578C8.98463 30.7578 8.90398 31.8062 10.5169 31.8062C12.1298 31.8062 12.0491 30.7578 13.662 30.7578C15.275 30.7578 15.1943 31.8062 16.8072 31.8062C17.6943 31.8062 18.0975 31.4836 18.5008 31.161" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M10.2754 9.95117H41.727" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M41.7259 12.8535H32.3711" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M19.6302 12.8535H10.2754" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M39.0663 15.8379H35.1953" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M16.8065 15.8379H12.9355" stroke="white" strokeWidth="1.7" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                    <div className="rs-why-choose-content">
                      <h6 className="rs-why-choose-title">Trusted Authorised Brands</h6>
                      <p className="descrip">
                        We supply only genuine products from authorised brands like Polycab and Dowells, ensuring reliability and long-term performance.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="rs-why-choose-content-item" data-wow-delay=".5s" data-wow-duration="1s">
                    <div className="rs-why-choose-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="44" viewBox="0 0 52 44" fill="none">
                        <path d="M1 35.972L11.8434 42.8999H41.6627L51 35.9721M1 35.972V29.6468L3.71084 28.442M1 35.972C2.13109 35.7807 3.23424 35.6004 4.31325 35.4312M51 35.9721V30.5504C50.367 28.7154 49.5632 28.2966 47.3855 28.442M51 35.9721C49.7161 35.7685 48.5209 35.5779 47.3855 35.4002M3.71084 28.442L4.31325 35.4312M3.71084 28.442C3.71295 17.0045 6.19652 11.6895 14.5542 6.45407L14.5643 6.75527M4.31325 35.4312C7.72785 34.8957 10.9007 34.4713 13.9518 34.1606M14.8554 15.4902C14.332 16.2806 14.1829 16.7992 14.253 17.8999L13.9518 34.1606M14.8554 15.4902C16.2976 13.0882 17.5835 11.4975 19.0723 10.4783M14.8554 15.4902L14.5643 6.75527M13.9518 34.1606C21.9015 33.3511 29.0249 33.3131 37.4458 34.0922M37.4458 34.0922C37.3505 27.4542 37.6415 23.4852 36.8081 17.2974M37.4458 34.0922C40.7709 34.3998 43.7753 34.8349 47.3855 35.4002M36.8081 17.2974C36.7298 16.716 36.6416 16.1149 36.5422 15.4902C35.2686 13.357 34.0887 11.8955 32.6265 10.8879M36.8081 17.2974V6.15284M32.6265 3.44202C32.8186 2.38671 34.1325 1.93599 34.4337 1.93599C34.7349 1.93599 36.3427 2.40407 36.8081 3.44202V6.15284M32.6265 3.44202V10.8879M32.6265 3.44202H29.012M32.6265 10.8879C31.603 10.1826 30.4411 9.69973 29.012 9.36462M29.012 3.44202V9.36462M29.012 3.44202C28.6022 1.27565 27.7684 0.898007 25.6988 1.03238C23.8847 0.867197 23.1108 1.28444 22.3855 3.44202V9.13869M29.012 9.36462C28.0437 9.13755 26.9527 8.97833 25.6988 8.86371C24.4485 8.86923 23.36 8.95033 22.3855 9.13869M22.3855 9.13869C21.1242 9.38253 20.0541 9.80613 19.0723 10.4783M22.0843 3.44202C20.7961 3.16488 20.1168 3.24563 19.0723 4.34563M19.0723 4.34563V10.4783M19.0723 4.34563C18.496 2.93306 17.9234 2.55188 16.6627 2.2372C15.1406 2.94065 14.8086 3.42516 14.5542 4.34563L14.5643 6.75527M47.3855 28.442V35.4002M47.3855 28.442V20.9119C45.6681 14.2309 44.1887 10.6804 36.8081 6.15284M17.2651 22.1167V31.454" stroke="white" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <div className="rs-why-choose-content">
                      <h6 className="rs-why-choose-title">Expert Technical Support</h6>
                      <p className="descrip">
                        Our experienced team provides technical guidance and product recommendations tailored to your project needs.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="rs-why-choose-content-item" data-wow-delay=".7s" data-wow-duration="1s">
                    <div className="rs-why-choose-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="49" viewBox="0 0 50 49" fill="none">
                        <path d="M46.9297 21.1611C46.7344 15.5954 44.4805 10.3908 40.5229 6.43317C36.3747 2.28418 30.8615 0 25 0C13.1613 0 3.48806 9.42294 3.07108 21.1611C1.26447 21.964 0 23.7722 0 25.8738V31.6636C0 34.5066 2.31288 36.8203 5.15674 36.8203C6.99684 36.8203 8.49332 35.3239 8.49332 33.4838V24.0528C8.49332 22.3252 7.16826 20.9164 5.48362 20.749C6.10549 10.5224 14.6187 2.39181 25 2.39181C30.2237 2.39181 35.1357 4.42804 38.8326 8.12498C42.2274 11.5198 44.2142 15.9446 44.5132 20.7498C42.8302 20.9188 41.5075 22.3268 41.5075 24.0528V33.483C41.5075 35.225 42.8533 36.6425 44.5578 36.79V39.1731C44.5578 41.8567 42.3741 44.0396 39.6905 44.0396H36.086C35.909 43.5341 35.6316 43.0669 35.2425 42.6795C34.5609 41.9946 33.652 41.6175 32.6841 41.6175H28.9688C28.4354 41.6175 27.9236 41.7307 27.4548 41.9492C26.176 42.5368 25.35 43.8267 25.35 45.2355C25.35 46.2034 25.7271 47.1123 26.4104 47.7924C27.0936 48.4772 28.0025 48.8543 28.9688 48.8543H32.6841C34.2244 48.8543 35.5822 47.8585 36.0884 46.4314H39.6905C43.6936 46.4314 46.9496 43.1754 46.9496 39.1731V36.3643C48.7451 35.5567 50 33.7548 50 31.662V25.8722C50 23.7722 48.7355 21.964 46.9297 21.1611Z" fill="white"></path>
                        <path d="M32.7427 32.0756C35.5372 32.0756 37.8102 29.8018 37.8102 27.0081V16.6827C37.8102 15.3321 37.2824 14.0597 36.3241 13.1013C35.3657 12.143 34.0941 11.6152 32.7427 11.6152H17.255C14.4605 11.6152 12.1875 13.8883 12.1875 16.6827V27.0081C12.1875 29.8026 14.4605 32.0756 17.255 32.0756H17.3498V34.7512C17.3498 35.7717 17.9581 36.6774 18.8989 37.0593C19.2027 37.1813 19.5184 37.2419 19.8309 37.2419C20.4823 37.2419 21.1169 36.9836 21.5817 36.5028L26.0329 32.0756H32.7427Z" fill="white"></path>
                      </svg>
                    </div>
                    <div className="rs-why-choose-content">
                      <h6 className="rs-why-choose-title">Wide Product Availability</h6>
                      <p className="descrip">
                        A comprehensive range of cables, accessories, and electrical solutions available under one roof for faster sourcing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
          className="rs-why-choose-btn-wrapper" 
          data-background="/assets/images/why-choose/why_choose.png"
          style={{ backgroundImage: "url('/assets/images/why-choose/why_choose.png')" }}
        ></div>
      </section>

      {/* Polycab Products */}
      <section className="rs-portfolio-area section-space rs-portfolio-one rs-swiper primary-bg our_products">
        <div className="container">
          <div className="row g-5 section-title-space align-items-end scroll-reveal" data-delay="0">
            <div className="col-xxl-7 col-lg-8">
              <div className="rs-section-title-wrapper">
                <span className="rs-section-subtitle has-theme-orange justify-content-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
                  </svg>
                  Our Products
                </span>
                <h2 className="rs-section-title rs-split-text-enable split-in-fade" style={{ perspective: '400px' }}>
                  <SplitText text="Polycab Cables" />
                </h2>
              </div>
            </div>
            <div className="col-xxl-5 col-lg-4 flex justify-content-lg-end justify-content-start mb-3">
              <div className="rs-portfolio-navigation">
                <button className="swiper-button-prev rs-swiper-btn has-bg-white hover-orange rs-nav-prev-polycab"><i className="fa-regular fa-arrow-left"></i></button>
                <button className="swiper-button-next rs-swiper-btn has-bg-white hover-orange rs-nav-next-polycab"><i className="fa-regular fa-arrow-right"></i></button>
              </div>
            </div>
          </div>
          <div className="scroll-reveal" data-delay="200">
            <ProductSlider 
              products={polycabProducts} 
              prevElSelector=".rs-nav-prev-polycab"
              nextElSelector=".rs-nav-next-polycab"
            />
          </div>
        </div>
      </section>

      {/* Dowells Products */}
      <section className="rs-portfolio-area section-space rs-portfolio-one rs-swiper primary-bg our_products">
        <div className="container">
          <div className="row g-5 section-title-space align-items-end scroll-reveal" data-delay="0">
            <div className="col-xxl-7 col-lg-8">
              <div className="rs-section-title-wrapper">
                <span className="rs-section-subtitle has-theme-orange justify-content-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                    <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
                  </svg>
                  Our Products
                </span>
                <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text="Dowells Products" /></h2>
              </div>
            </div>
            <div className="col-xxl-5 col-lg-4 flex justify-content-lg-end justify-content-start mb-3">
              <div className="rs-portfolio-navigation">
                <button className="swiper-button-prev rs-swiper-btn has-bg-white hover-orange rs-nav-prev-dowells"><i className="fa-regular fa-arrow-left"></i></button>
                <button className="swiper-button-next rs-swiper-btn has-bg-white hover-orange rs-nav-next-dowells"><i className="fa-regular fa-arrow-right"></i></button>
              </div>
            </div>
          </div>
          <div className="scroll-reveal" data-delay="200">
            <ProductSlider 
              products={dowellsProducts} 
              prevElSelector=".rs-nav-prev-dowells"
              nextElSelector=".rs-nav-next-dowells"
            />
          </div>
        </div>
      </section>

      {/* Clientele / Partners Section */}
      <div className="scroll-reveal" data-delay="100">
        <ClienteleSlider />
      </div>

      {/* Industries Served */}
      <section className="rs-portfolio-area section-space rs-portfolio-seven rs-swiper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xxl-6 col-xl-7 col-md-8 col-sm-10">
              <div className="rs-section-title-wrapper text-center section-title-space scroll-reveal" data-delay="0">
                <span className="rs-section-subtitle has-stroke">
                  Strengthening Businesses Worldwide
                </span>
                <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text="Industries We Serve" /></h2>
              </div>
            </div>
          </div>
          <div className="scroll-reveal" data-delay="200">
            <IndustriesSlider />
          </div>
        </div>
      </section>

      {/* Get in Touch - Contact Form Section */}
      <div className="scroll-reveal" data-delay="100">
        <HomeContactForm />
      </div>

      {/* Achievements / Counter Section */}
      <HomeAchievements />
      <PromoPopup />
    </main>
    </>
  );
}
