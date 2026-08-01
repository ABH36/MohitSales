import React from 'react';
import SplitText from '@/components/SplitText';
import { cld } from '@/lib/cloudinary';

/**
 * "Why Choose Us" — the trust / value-proposition section, styled to match the
 * other homepage sections (About Us / Our Products / Industries): a light
 * transparent band with a centred eyebrow + wordmark-coloured title + wire
 * underline, then a two-column body — the reasons on the left and a supporting
 * image on the right (mirroring the About Us image/content split). Styling
 * lives under `.wcu_sec` in globals.css and reuses the About Us feature look. */

// Supporting collage that used to be the section's dark background — now the
// right-hand image, matching the About Us media card.
const WHY_CHOOSE_IMAGE =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167989/mohit/why-choose/why_choose.png';

import { ShieldCheck, Wrench, PackageSearch } from 'lucide-react';

interface Reason {
  title: string;
  text: string;
  icon: React.ReactNode;
}

const REASONS: Reason[] = [
  {
    title: 'Trusted Authorised Brands',
    text: 'We supply only genuine products from authorised brands like Polycab and Dowells, ensuring reliability and long-term performance.',
    icon: <ShieldCheck />,
  },
  {
    title: 'Expert Technical Support',
    text: 'Our experienced team provides technical guidance and product recommendations tailored to your project needs.',
    icon: <Wrench />,
  },
  {
    title: 'Wide Product Availability',
    text: 'A comprehensive range of cables, accessories, and electrical solutions available under one roof for faster sourcing.',
    icon: <PackageSearch />,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="wcu_sec about-us">
      <div className="container">
        <div className="rs-section-title-wrapper text-center section-title-space scroll-reveal" data-delay="0">
          <span className="rs-section-subtitle has-theme-orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
              <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#121a2f"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z" fill="#121a2f"></path>
            </svg>
            Why Choose Us
          </span>
          <h2 className="rs-section-title rs-split-text-enable split-in-fade wordmark-title" suppressHydrationWarning={true}>
            <SplitText
              text="Empowering Projects, Ensuring Reliability"
              wordColors={{
                empowering: '#c1272d',   // red
                projects: '#0055a9',     // blue
                ensuring: '#f7931e',     // orange
                reliability: '#c1272d',  // red
              }}
            />
          </h2>
          <img src="https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1784965401/mohit/ui/wire-underline.png" alt="" className="about-head-underline" aria-hidden="true" loading="lazy" />
        </div>

        {/* Content left, image right — the mirror of the About Us split. */}
        <div className="row g-4 g-lg-5 about-v2 wcu-v2">
          <div className="col-lg-7 w-full order-2 order-lg-1">
            <div className="about-features">
              {REASONS.map((r, i) => (
                <div
                  key={r.title}
                  className="about-feature scroll-reveal"
                  data-direction="left"
                  data-delay={`${100 + i * 140}`}
                >
                  <span className={`about-feature-icon${i === 1 ? ' is-red' : ''}`} aria-hidden="true">
                    {r.icon}
                  </span>
                  <div>
                    <h3 className="about-feature-title" aria-level={3}>{r.title}</h3>
                    <p>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5 w-full order-1 order-lg-2">
            <div className="about-media-card scroll-reveal" data-direction="right" data-delay="0">
              <img
                src={cld(WHY_CHOOSE_IMAGE, 'f_auto,q_auto,w_700')}
                alt="Why choose Mohit Sales Corporation — authorised distribution, expert support and wide availability"
                className="img-fluid"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
