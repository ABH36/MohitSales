'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cld } from '@/lib/cloudinary';
import { FIRST_BANNER, BANNER_TRANSFORM } from '@/lib/hero-banner';

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
  FIRST_BANNER.desktop,
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167824/mohit/banner/desktop/polycab.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167823/mohit/banner/desktop/fans.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167826/mohit/banner/desktop/solar_product.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167827/mohit/banner/desktop/switchgear.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167828/mohit/banner/desktop/wire.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167822/mohit/banner/desktop/dowells.webp',
];

const FALLBACK_MOBILE = [
  FIRST_BANNER.mobile,
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167834/mohit/banner/mobile/polycab_banner.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167833/mohit/banner/mobile/fans.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167835/mohit/banner/mobile/solar_product.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167836/mohit/banner/mobile/switchgear.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167837/mohit/banner/mobile/wire.webp',
  'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167830/mohit/banner/mobile/dowells.webp',
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
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
    setPrevIndex(activeIndex);
    setActiveIndex((activeIndex + 1) % (count || 1));
  }, [activeIndex, count]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(goToNext, 4000);
    return () => clearInterval(timer);
  }, [goToNext, count]);

  const goToIndex = (index: number) => {
    if (index === activeIndex) return;
    setPrevIndex(activeIndex);
    setActiveIndex(index);
  };

  const handleSlideClick = (index: number) => {
    const link = bannerLinks[index];
    if (link) window.location.href = link;
  };

  // Vertical "conveyor" transition: the outgoing slide glides up and off the top
  // while the incoming slide rises from the bottom into place — both move together,
  // edge-to-edge, so it reads as one continuous upward scroll. Only the active and
  // outgoing slides animate; every other slide snaps to its waiting spot below
  // (transition: none) so nothing sweeps across the viewport out of turn.
  const slideStyle = (index: number, banner: string, bgPos: string, transform: string): React.CSSProperties => {
    const isActive = index === activeIndex;
    const isPrev = index === prevIndex && prevIndex !== activeIndex;
    return {
      // Width-capped per breakpoint (see BANNER_TRANSFORM) — must stay in sync
      // with the homepage preload URLs or the image downloads twice.
      backgroundImage: `url('${cld(banner, transform)}')`,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: bgPos,
      backgroundRepeat: 'no-repeat',
      transform: isActive ? 'translateY(0)' : isPrev ? 'translateY(-100%)' : 'translateY(100%)',
      transition: isActive || isPrev ? 'transform 1.15s cubic-bezier(0.6, 0.01, 0.2, 1)' : 'none',
      zIndex: isActive || isPrev ? 2 : 1,
      cursor: bannerLinks[index] ? 'pointer' : 'default',
    };
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
                style={slideStyle(index, banner, 'left center', BANNER_TRANSFORM.desktop)}
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
                onClick={() => goToIndex(index)}
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
                style={slideStyle(index, banner, 'center', BANNER_TRANSFORM.mobile)}
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
                onClick={() => goToIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
