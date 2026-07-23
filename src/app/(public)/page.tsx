import React from 'react';
import type { Metadata } from 'next';
import BannerSlider from '@/components/BannerSlider';
import LazyHydrate from '@/components/LazyHydrate';
import { FIRST_BANNER, BANNER_TRANSFORM } from '@/lib/hero-banner';
import { cld } from '@/lib/cloudinary';
import IndustriesSlider from '@/components/IndustriesSlider';
import WhyChooseUs from '@/components/WhyChooseUs';
import HomeContactForm from '@/components/HomeContactForm';
import HomeAchievements from '@/components/HomeAchievements';
import SplitText from '@/components/SplitText';
import SchemaInjector from '@/components/SchemaInjector';
import PromoPopup from '@/components/PromoPopup';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';
import { Building2, Award, HeartHandshake } from 'lucide-react';
import HomeCategoryExplorer from '@/components/HomeCategoryExplorer';
import { buildExplorerArms } from '@/lib/home-explorer';

export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function generateMetadata(): Promise<Metadata> {
  // Prefer a homepage-specific SEO row; otherwise fall back to the global site
  // settings (seo_title / seo_description) so the homepage always has a proper
  // title and description even before an admin fills the SEO panel.
  const [seoMeta, settings] = await Promise.all([
    prisma.seoMeta.findUnique({ where: { page: '/' } }).catch(() => null),
    prisma.setting
      .findMany({ where: { key: { in: ['seo_title', 'seo_description'] } }, select: { key: true, value: true } })
      .catch(() => [] as { key: string; value: string }[]),
  ]);

  const s = Object.fromEntries(settings.map((x) => [x.key, x.value]));
  const title = seoMeta?.title || s.seo_title || undefined;
  const description = seoMeta?.description || s.seo_description || undefined;

  return {
    title,
    description,
    keywords: seoMeta?.keywords ? seoMeta.keywords.split(',').map((k) => k.trim()) : undefined,
    robots: seoMeta ? { index: !seoMeta.noIndex, follow: !seoMeta.noFollow } : undefined,
    // Always self-referencing canonical — without it the homepage shipped no
    // canonical at all whenever the admin SEO row was absent.
    alternates: { canonical: seoMeta?.canonicalUrl || SITE_URL },
    openGraph: {
      title: seoMeta?.ogTitle || title,
      description,
      url: SITE_URL,
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
      images: seoMeta?.ogImage ? [seoMeta.ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMeta?.ogTitle || title,
      description,
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
  imageUrl: 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/about/authorized-distributor.png',
};

export default async function Page() {
  const cmsAbout = await prisma.cmsSection.findUnique({
    where: { page_section: { page: 'homepage', section: 'content' } },
  }).catch(() => null);

  // Consumer / Industries card explorers for the "Our Products" area.
  const { cables, consumer, industries, dowells } = await buildExplorerArms().catch(() => ({ cables: null, consumer: null, industries: null, dowells: null }));

  let aboutData = FALLBACK_ABOUT;
  if (cmsAbout?.content) {
    try {
      const parsed = JSON.parse(cmsAbout.content);
      if (parsed.title || parsed.subtitle || parsed.content || parsed.imageUrl) {
        aboutData = {
          title: parsed.title || FALLBACK_ABOUT.title,
          subtitle: parsed.subtitle || FALLBACK_ABOUT.subtitle,
          paragraphs: parsed.content
            ? parsed.content.split('\n').map((p: string) => p.trim()).filter(Boolean)
            : FALLBACK_ABOUT.paragraphs,
          imageUrl: parsed.imageUrl || FALLBACK_ABOUT.imageUrl,
        };
      }
    } catch {}
  }

  // Distribute the CMS paragraphs across the three titled feature rows, so an
  // admin editing the content still drives everything here. The third
  // paragraph keeps only its first sentence — its tail used to feed the
  // pull-quote card, which was removed by request.
  const [aboutP1 = '', aboutP2 = '', aboutP3raw = ''] = aboutData.paragraphs;
  const quoteSplit = aboutP3raw.indexOf('. ');
  const aboutP3 = quoteSplit > -1 ? aboutP3raw.slice(0, quoteSplit + 1) : aboutP3raw;
  const aboutFeatures = [
    { title: 'Established Legacy', body: aboutP1, icon: <Building2 /> },
    { title: 'Authorized Excellence', body: aboutP2, icon: <Award /> },
    { title: 'Driven by Commitment', body: aboutP3, icon: <HeartHandshake /> },
  ].filter((f) => f.body);

  return (
    <>
    <SchemaInjector page="/" />
    <main>
      {/* Accessible page title (visually hidden) — gives the homepage a single
          top-level h1 for screen readers + SEO without altering the design. */}
      <h1 className="sr-only">Mohit Sales Corporation Pvt. Ltd. — Authorized Polycab &amp; Dowells Distributor in Indore</h1>

      {/* Preload the first hero slide: it is painted as a CSS background from a
          client component, so without this hint the browser only discovers the
          LCP image after hydration. Raw HTML (not JSX links) because React
          hoists JSX preloads and drops the media attribute — these must stay
          media-split so only one variant downloads per device. */}
      <div
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{
          __html:
            `<link rel="preload" as="image" href="${cld(FIRST_BANNER.mobile, BANNER_TRANSFORM.mobile)}" media="(max-width: 991px)" fetchpriority="high">` +
            `<link rel="preload" as="image" href="${cld(FIRST_BANNER.desktop, BANNER_TRANSFORM.desktop)}" media="(min-width: 992px)" fetchpriority="high">`,
        }}
      />

      {/* Banner slider area */}
      <BannerSlider />

      {/* About Us — centred heading, then a media card + trust chips on the
          left and titled feature rows + a pull-quote on the right. All copy
          stays CMS-driven (see the paragraph mapping above the return). */}
      <section className="image-box-section about-us pt-100 pb-50">
        <div className="container">
          <div className="rs-section-title-wrapper text-center about-head scroll-reveal" data-delay="0">
            <span className="rs-section-subtitle has-theme-orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E"></path>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#1E2E5E"></path>
              </svg>
              {aboutData.title}
            </span>
            <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text={aboutData.subtitle} /></h2>
            <span className="about-head-underline" aria-hidden="true"></span>
          </div>

          {/* Each block reveals on its own staggered delay (media card first,
              then the strip; feature rows cascade down the right column). */}
          {/* 5/7 split: the media column hugs the (square-ish) graphic so the
              card doesn't carry wide white margins beside it. */}
          <div className="row g-4 g-lg-5 about-v2">
            <div className="col-lg-5 w-full">
              <div className="about-media-card scroll-reveal" data-direction="left" data-delay="0">
                <img
                  src={aboutData.imageUrl}
                  alt="Authorized Distributor of Polycab and Dowells"
                  className="img-fluid"
                  fetchPriority="high"
                  loading="eager"
                />
              </div>
            </div>

            <div className="col-lg-7 w-full">
              <div className="about-features">
                {aboutFeatures.map((f, i) => (
                  <div
                    key={f.title}
                    className="about-feature scroll-reveal"
                    data-direction="right"
                    data-delay={`${100 + i * 140}`}
                  >
                    <span className={`about-feature-icon${i === 1 ? ' is-red' : ''}`} aria-hidden="true">
                      {f.icon}
                    </span>
                    <div>
                      <h3 className="about-feature-title">{f.title}</h3>
                      <p>{f.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Polycab Cables — the seven cable types as a card grid, each linking
          straight to its listing page (no drill-down: each type holds hundreds
          of SKUs, browsed on the listing page). */}
      {/* The explorers and everything below hydrate lazily (LazyHydrate): the
          server HTML paints and is crawlable immediately, but their React
          hydration cost is paid only as each block nears the viewport — the
          marquee is pure CSS and card links are plain anchors, so nothing a
          visitor can reach is dead in the meantime. */}
      {cables && (
        <LazyHydrate>
          <HomeCategoryExplorer arm={cables} heading="Polycab Cables" brandMark="polycab" flat />
        </LazyHydrate>
      )}

      {/* Polycab Consumer & Industries — filterable card explorers so a visitor
          can drill from the homepage to any range without opening the menu. */}
      {consumer && (
        <LazyHydrate>
          <HomeCategoryExplorer arm={consumer} heading="Polycab Consumer" brandMark="polycab" />
        </LazyHydrate>
      )}
      {industries && (
        <LazyHydrate>
          <HomeCategoryExplorer arm={industries} heading="Polycab Industries" brandMark="polycab" />
        </LazyHydrate>
      )}

      {/* Dowells Products — same filterable card explorer, so visitors can drill
          from the homepage into every Dowells range without opening the menu. */}
      {dowells && (
        <LazyHydrate>
          <HomeCategoryExplorer arm={dowells} heading="Dowells Products" brandMark="dowells" />
        </LazyHydrate>
      )}

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
            <LazyHydrate>
              <IndustriesSlider />
            </LazyHydrate>
          </div>
        </div>
      </section>

      {/* Why Choose Us — trust / value section, placed after the products and
          social proof, right before the contact CTA. */}
      <div className="scroll-reveal" data-delay="0">
        <WhyChooseUs />
      </div>

      {/* Get in Touch - Contact Form Section */}
      <div className="scroll-reveal" data-delay="100">
        <LazyHydrate>
          <HomeContactForm />
        </LazyHydrate>
      </div>

      {/* Achievements / Counter Section */}
      <LazyHydrate>
        <HomeAchievements />
      </LazyHydrate>
      <PromoPopup />
    </main>
    </>
  );
}
