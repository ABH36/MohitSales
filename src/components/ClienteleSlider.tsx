'use client';

import React, { useRef, useEffect } from 'react';
import SplitText from './SplitText';

// All 46 brand logos — served from Cloudinary (mohit/brand/brand-thumb-NN)
const brandImages = Array.from({ length: 46 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return `https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto,w_240/mohit/brand/brand-thumb-${n}.png`;
});

export default function ClienteleSlider() {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let swiperInstance: any = null;
    let cancelled = false;
    const intervalId = setInterval(() => {
      if (cancelled) { clearInterval(intervalId); return; }
      const Swiper = (window as unknown as { Swiper: any }).Swiper;
      if (Swiper && swiperRef.current) {
        clearInterval(intervalId);

        swiperInstance = new Swiper(swiperRef.current, {
          loop: true,
          speed: 3000,
          autoplay: {
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          direction: 'horizontal',
          slidesPerView: 6,
          spaceBetween: 30,
          freeMode: true,
          breakpoints: {
            0:    { slidesPerView: 2, spaceBetween: 15 },
            480:  { slidesPerView: 3, spaceBetween: 20 },
            768:  { slidesPerView: 4, spaceBetween: 24 },
            992:  { slidesPerView: 5, spaceBetween: 28 },
            1200: { slidesPerView: 6, spaceBetween: 30 },
          },
        });
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      if (swiperInstance) {
        try {
          swiperInstance.autoplay?.stop?.();
          swiperInstance.destroy(true, true);
        } catch { /* instance already torn down */ }
        swiperInstance = null;
      }
    };
  }, []);

  return (
    <section className="rs-brand-area rs-brand-one section-space-bottom primary-bg rs-swiper clientle_sec">
      <div className="container">
        {/* Section Title */}
        <div className="row g-5 section-title-space justify-content-center">
          <div className="w-full">
            <div className="rs-section-title-wrapper text-center">
              <span className="rs-section-subtitle has-theme-orange">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                  <path d="M3.14286 10L0 15L8.78104e-07 0L3.14286 5V10Z" fill="#1E2E5E" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.28571 10L3.14286 15L3.14286 10L4.71428 7.5L3.14286 5L3.14286 0L6.28571 5L6.28571 10ZM6.28571 10L7.85714 7.5L6.28571 5V0L11 7.5L6.28571 15V10Z"
                    fill="#1E2E5E"
                  />
                </svg>
                Product Range
              </span>
              <h2 className="rs-section-title rs-split-text-enable split-in-fade"><SplitText text="Authorized Wires, Switchgears & Electrical Solutions" /></h2>
            </div>
          </div>
        </div>

        {/* Brand Slider */}
        <div className="row">
          <div className="w-full">
            <div className="rs-brand-wrapper clientele-swiper-wrapper">
              <div ref={swiperRef} className="swiper react-managed clientele-swiper">
                <div className="swiper-wrapper">
                  {brandImages.map((src, idx) => (
                    <div key={idx} className="swiper-slide">
                      <div className="rs-brand-item has-clip-path">
                        <div className="rs-brand-thumb">
                          <img src={src} alt={`Partner ${idx + 1}`} loading="lazy" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
