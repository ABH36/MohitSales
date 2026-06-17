'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BannerItem {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

const FALLBACK_DESKTOP = [
  '/assets/images/banner/desktop/cable.webp',
  '/assets/images/banner/desktop/polycab.webp',
  '/assets/images/banner/desktop/fans.webp',
  '/assets/images/banner/desktop/solar_product.webp',
  '/assets/images/banner/desktop/switchgear.webp',
  '/assets/images/banner/desktop/wire.webp',
  '/assets/images/banner/desktop/dowells.webp',
];

const FALLBACK_MOBILE = [
  '/assets/images/banner/mobile/cable.webp',
  '/assets/images/banner/mobile/polycab_banner.webp',
  '/assets/images/banner/mobile/fans.webp',
  '/assets/images/banner/mobile/solar_product.webp',
  '/assets/images/banner/mobile/switchgear.webp',
  '/assets/images/banner/mobile/wire.webp',
  '/assets/images/banner/mobile/dowells.webp',
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [banners, setBanners] = useState<BannerItem[] | null>(null);

  useEffect(() => {
    fetch('/api/public/cms/homepage/banners')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.content?.banners?.length) {
          const active = data.data.content.banners
            .filter((b: BannerItem) => b.isActive && b.desktopImage)
            .sort((a: BannerItem, b: BannerItem) => a.sortOrder - b.sortOrder);
          if (active.length) {
            setActiveIndex(0);
            setBanners(active);
          }
        }
      })
      .catch(() => {});
  }, []);

  const desktopImages = banners ? banners.map(b => b.desktopImage) : FALLBACK_DESKTOP;
  const mobileImages = banners ? banners.map(b => b.mobileImage || b.desktopImage) : FALLBACK_MOBILE;
  const bannerLinks = banners ? banners.map(b => b.link || '') : FALLBACK_DESKTOP.map(() => '');
  const count = desktopImages.length;

  const goToNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % (count || 1));
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(goToNext, 4000);
    return () => clearInterval(timer);
  }, [goToNext, count]);

  const handleSlideClick = (index: number) => {
    const link = bannerLinks[index];
    if (link) window.location.href = link;
  };

  return (
    <>
      {/* Desktop Slider */}
      <section className="banner_sec desktop">
        <div className="swiper banner-swiper">
          <div className="swiper-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {desktopImages.map((banner, index) => (
              <div
                key={index}
                className={`swiper-slide ${index === activeIndex ? 'swiper-slide-active' : ''}`}
                onClick={() => handleSlideClick(index)}
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
                  cursor: bannerLinks[index] ? 'pointer' : 'default',
                }}
              />
            ))}
            <div style={{ visibility: 'hidden', width: '100%', height: '100%', position: 'relative' }} />
          </div>
          <div className="swiper-pagination">
            {desktopImages.map((_, index) => (
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
            {mobileImages.map((banner, index) => (
              <div
                key={index}
                className={`swiper-slide ${index === activeIndex ? 'swiper-slide-active' : ''}`}
                onClick={() => handleSlideClick(index)}
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
                  cursor: bannerLinks[index] ? 'pointer' : 'default',
                }}
              />
            ))}
            <div style={{ visibility: 'hidden', width: '100%', height: '100%', position: 'relative' }} />
          </div>
          <div className="swiper-pagination">
            {mobileImages.map((_, index) => (
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
