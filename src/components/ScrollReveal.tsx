'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollReveal — Items slide in (fade + translateY) the first time
 * they enter the viewport while scrolling.
 *
 * Add class `scroll-reveal` to any element.
 * Optional: data-delay="200"  data-direction="left|right|up|down"
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip on admin pages — no scroll animations needed
    if (pathname.startsWith('/admin')) return;

    // ---- inject CSS once ----
    const styleId = 'scroll-reveal-css';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `
        .scroll-reveal {
          opacity: 0;
          will-change: opacity, transform;
          transition: opacity 0.8s cubic-bezier(.22,1,.36,1),
                      transform 0.8s cubic-bezier(.22,1,.36,1);
        }
        .scroll-reveal, .scroll-reveal[data-direction="up"] {
          transform: translateY(50px);
        }
        .scroll-reveal[data-direction="down"] {
          transform: translateY(-50px);
        }
        .scroll-reveal[data-direction="left"] {
          transform: translateX(-50px);
        }
        .scroll-reveal[data-direction="right"] {
          transform: translateX(50px);
        }
        .scroll-reveal.is-visible {
          opacity: 1 !important;
          transform: translate(0,0) !important;
        }
      `;
      document.head.appendChild(s);
    }

    // ---- observer ----
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.dataset.delay || '0', 10);
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-visible'), delay);
          } else {
            el.classList.add('is-visible');
          }
          observer.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    // ---- helper: observe all un-revealed elements ----
    const observeAll = () => {
      document.querySelectorAll('.scroll-reveal:not(.is-visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    // Run immediately + after short delays to catch hydration & lazy content
    observeAll();
    const t1 = setTimeout(observeAll, 500);
    const t2 = setTimeout(observeAll, 1500);
    const t3 = setTimeout(observeAll, 3000);

    // Also watch DOM for dynamically added elements
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      mutation.disconnect();
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
