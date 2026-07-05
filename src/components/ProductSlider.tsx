'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';

interface SwiperElement extends HTMLDivElement {
  _cleanupSwiper?: () => void;
}

interface ProductCard {
  image: string;
  title: string;
  link: string;
}

interface ProductSliderProps {
  products: ProductCard[];
  prevElSelector: string;
  nextElSelector: string;
}

export default function ProductSlider({ products, prevElSelector, nextElSelector }: ProductSliderProps) {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let swiperInstance: unknown = null;
    const intervalId = setInterval(() => {
      const Swiper = (window as unknown as { Swiper: any }).Swiper;
      if (Swiper && swiperRef.current) {
        clearInterval(intervalId);

        const animateVisibleCards = (swiper: any) => {
          if (!swiper.slides || !swiper.params) return;
          const perView = typeof swiper.params.slidesPerView === 'number'
            ? Math.round(swiper.params.slidesPerView) : 4;

          const items: HTMLElement[] = [];
          for (let offset = 0; offset < perView; offset++) {
            const slide = swiper.slides[swiper.activeIndex + offset] as HTMLElement | undefined;
            if (!slide) continue;
            const item = slide.querySelector('.rs-portfolio-item') as HTMLElement | null;
            if (item) items.push(item);
          }

          items.forEach(item => item.classList.remove('card-anim'));
          if (items[0]) void items[0].offsetWidth; // single reflow to reset animation
          items.forEach((item, i) => {
            item.style.animationDelay = `${i * 90}ms`;
            item.classList.add('card-anim');
          });
        };

        swiperInstance = new Swiper(swiperRef.current, {
          loop: true,
          speed: 1500,               // data-speed="1500"
          autoplay: {
            delay: 2500,             // data-delay="2500"
            disableOnInteraction: false,
            pauseOnMouseEnter: true, // data-hover-pause="true"
          },
          direction: 'horizontal',
          slidesPerView: 3,          // 3 items per row matching the mockup
          spaceBetween: 30,
          navigation: {
            nextEl: prevElSelector,  // Flipped mapping to match visual slide directions in RTL
            prevEl: nextElSelector,
          },
          breakpoints: {
            10:   { slidesPerView: 1, spaceBetween: 15 },
            480:  { slidesPerView: 1, spaceBetween: 15 },
            576:  { slidesPerView: 1, spaceBetween: 20 },
            768:  { slidesPerView: 2, spaceBetween: 24 },
            992:  { slidesPerView: 3, spaceBetween: 30 },
            1200: { slidesPerView: 3, spaceBetween: 30 },
          },
          on: {
            init(swiper: any) { setTimeout(() => animateVisibleCards(swiper), 50); },
            slideChange(swiper: any) { animateVisibleCards(swiper); },
          },
        });

        // Pause autoplay on mouse enter, resume on mouse leave
        const handleMouseEnter = () => (swiperInstance as any)?.autoplay?.stop();
        const handleMouseLeave = () => (swiperInstance as any)?.autoplay?.start();

        const sliderEl = swiperRef.current;
        if (sliderEl) {
          sliderEl.addEventListener('mouseenter', handleMouseEnter);
          sliderEl.addEventListener('mouseleave', handleMouseLeave);

          // Store cleanup helper
          (sliderEl as any)._cleanupSwiper = () => {
            sliderEl.removeEventListener('mouseenter', handleMouseEnter);
            sliderEl.removeEventListener('mouseleave', handleMouseLeave);
          };
        }
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      if (swiperInstance) {
        const sliderEl = swiperRef.current as SwiperElement | null;
        if (sliderEl && sliderEl._cleanupSwiper) {
          sliderEl._cleanupSwiper();
        }
        (swiperInstance as any).destroy(true, true);
      }
    };
  }, [products, prevElSelector, nextElSelector]);

  return (
    <div 
      ref={swiperRef}
      className="swiper react-managed"
    >
      <div className="swiper-wrapper">
        {products.map((prod, index) => (
          <div key={index} className="swiper-slide mb-4">
            <div className="rs-portfolio-item">
              <div className="rs-portfolio-thumb">
                <img
                  src={prod.image}
                  alt={prod.title}
                />
              </div>
              <div className="rs-portfolio-content">
                <h4 className="rs-portfolio-title has-white">
                  <Link href={prod.link}>{prod.title}</Link>
                </h4>
                <div className="rs-portfolio-btn">
                  <Link
                    href={prod.link}
                    className="portfolio-red-btn"
                    aria-label={`View ${prod.title}`}
                  >
                    <i className="fa-regular fa-arrow-right" aria-hidden="true"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
