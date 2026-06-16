'use client';

import React, { useState, useEffect, useCallback } from 'react';

const desktopBanners = [
  '/assets/images/banner/desktop/cable.webp',
  '/assets/images/banner/desktop/polycab.webp',
  '/assets/images/banner/desktop/fans.webp',
  '/assets/images/banner/desktop/solar_product.webp',
  '/assets/images/banner/desktop/switchgear.webp',
  '/assets/images/banner/desktop/wire.webp',
  '/assets/images/banner/desktop/dowells.webp'
];

const mobileBanners = [
  '/assets/images/banner/mobile/cable.webp',
  '/assets/images/banner/mobile/polycab_banner.webp',
  '/assets/images/banner/mobile/fans.webp',
  '/assets/images/banner/mobile/solar_product.webp',
  '/assets/images/banner/mobile/switchgear.webp',
  '/assets/images/banner/mobile/wire.webp',
  '/assets/images/banner/mobile/dowells.webp'
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % desktopBanners.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(goToNext, 4000);
    return () => clearInterval(timer);
  }, [goToNext]);

  return (
    <>
      {/* Desktop Slider */}
      <section className="banner_sec desktop">
        <div className="swiper banner-swiper">
          <div className="swiper-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {desktopBanners.map((banner, index) => (
              <div
                key={index}
                className={`swiper-slide ${index === activeIndex ? 'swiper-slide-active' : ''}`}
                style={{
                  backgroundImage: `url('${banner}')`,
                  position: 'absolute',
                  opacity: index === activeIndex ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundSize: 'cover',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: index === activeIndex ? 2 : 1,
                  cursor: 'pointer',
                }}
              ></div>
            ))}
            {/* Invisible spacer to give the wrapper its full height */}
            <div
              style={{
                visibility: 'hidden',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            ></div>
          </div>
          {/* Pagination bullets */}
          <div className="swiper-pagination">
            {desktopBanners.map((_, index) => (
              <span
                key={index}
                className={`swiper-pagination-bullet ${index === activeIndex ? 'swiper-pagination-bullet-active' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Slider */}
      <section className="banner_sec mobile">
        <div className="swiper banner-swiper">
          <div className="swiper-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {mobileBanners.map((banner, index) => (
              <div
                key={index}
                className={`swiper-slide ${index === activeIndex ? 'swiper-slide-active' : ''}`}
                style={{
                  backgroundImage: `url('${banner}')`,
                  position: 'absolute',
                  opacity: index === activeIndex ? 1 : 0,
                  transition: 'opacity 1s ease-in-out',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: index === activeIndex ? 2 : 1,
                }}
              ></div>
            ))}
            <div
              style={{
                visibility: 'hidden',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            ></div>
          </div>
          {/* Pagination bullets */}
          <div className="swiper-pagination">
            {mobileBanners.map((_, index) => (
              <span
                key={index}
                className={`swiper-pagination-bullet ${index === activeIndex ? 'swiper-pagination-bullet-active' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
