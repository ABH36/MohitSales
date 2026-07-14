'use client';

import React, { useRef, useEffect } from 'react';
import { cld } from '@/lib/cloudinary';

export default function IndustriesSlider() {
  const swiperRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const industries = [
    { name: 'Construction Industry',       image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167962/mohit/our_services/construction-industry.png' },
    { name: 'Telecommunications Industry', image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167969/mohit/our_services/telecommunication-industry.png' },
    { name: 'Commercial Industry',         image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167961/mohit/our_services/commercial-industry.png' },
    { name: 'Power Generation',            image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167967/mohit/our_services/power-generator.png' },
    { name: 'Oil & Gas',                   image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167964/mohit/our_services/oil-and-gas.png' },
    { name: 'Petrochemical Industry',      image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167966/mohit/our_services/petrochemical.png' },
    { name: 'Datacenter Industry',         image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167963/mohit/our_services/data-center.png' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let swiperInstance: any = null;
    const uniquePagId = `ind-pag-${Math.random().toString(36).substring(2, 8)}`;
    if (paginationRef.current) paginationRef.current.classList.add(uniquePagId);

    let cancelled = false;
    const intervalId = setInterval(() => {
      if (cancelled) { clearInterval(intervalId); return; }
      const Swiper = (window as any).Swiper;
      if (Swiper && swiperRef.current) {
        clearInterval(intervalId);

        swiperInstance = new Swiper(swiperRef.current, {
          loop: true,
          speed: 900,
          autoplay: {
            delay: 1000,           // 1 second auto-slide
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          direction: 'horizontal',
          slidesPerView: 3,
          spaceBetween: 30,
          pagination: {
            el: `.${uniquePagId}`,
            clickable: true,
          },
          breakpoints: {
            10:   { slidesPerView: 1, spaceBetween: 20 },
            480:  { slidesPerView: 1, spaceBetween: 20 },
            576:  { slidesPerView: 1, spaceBetween: 20 },
            768:  { slidesPerView: 2, spaceBetween: 24 },
            992:  { slidesPerView: 3, spaceBetween: 28 },
            1200: { slidesPerView: 3, spaceBetween: 30 },
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
    <div className="row">
      <div className="w-full">
        <div className="rs-portfolio-slider-wrapper">
          {/* Swiper container — rs-portfolio-seven card style */}
          <div ref={swiperRef} className="swiper react-managed">
            <div className="swiper-wrapper">
              {industries.map((ind, index) => (
                <div key={index} className="swiper-slide">
                  <div className="rs-portfolio-item">
                    <div className="rs-portfolio-thumb">
                      <img src={cld(ind.image, 'f_auto,q_auto,w_500')} alt={ind.name} />
                    </div>
                    <div className="rs-portfolio-content">
                      <h4 className="rs-portfolio-title" aria-level={3}>
                        <a href="#">{ind.name}</a>
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="rs-portfolio-pagination" style={{ marginTop: '50px', textAlign: 'center' }}>
            <div
              ref={paginationRef}
              className="swiper-pagination rs-pagination has-theme-orange rs-pagination-2"
              style={{ position: 'relative' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
