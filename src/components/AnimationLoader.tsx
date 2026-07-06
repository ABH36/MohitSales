'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnimationLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip ALL public scripts on admin pages — they conflict with admin panel
    if (pathname.startsWith('/admin')) return;

    // Suppress legacy jQuery plugin errors from showing in Next.js dev overlay
    // Next.js uses addEventListener('error') for its overlay, not just window.onerror
    const suppressLegacyError = (event: ErrorEvent) => {
      const src = event.filename || '';
      const msg = event.message || '';
      if (
        src.includes('/assets/js/') ||
        src.includes('main.js') ||
        msg.includes('className.replace') ||
        msg.includes('is not a function') ||
        msg.includes('Cannot read properties of null')
      ) {
        console.warn('[Legacy JS suppressed]', msg, 'at', src, ':', event.lineno, ':', event.colno);
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    };
    window.addEventListener('error', suppressLegacyError, true); // capture phase

    const suppressLegacyRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || '';
      if (
        msg.includes('is not a function') ||
        msg.includes('Cannot read properties of null') ||
        msg.includes('className.replace')
      ) {
        console.warn('[Legacy JS promise suppressed]', msg);
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', suppressLegacyRejection, true);

    // ── Critical scripts (must load first, in order) ──
    const criticalScripts = [
      '/assets/js/vendor/jquery-3.7.1.min.js',
      '/assets/js/vendor/bootstrap.bundle.min.js',
      '/assets/js/plugins/swiper.min.js',
    ];

    // ── Non-critical scripts (can load in parallel after critical) ──
    const deferredScripts = [
      '/assets/js/plugins/waypoints.min.js',
      '/assets/js/plugins/meanmenu.min.js',
      '/assets/js/plugins/wow.min.js',
      '/assets/js/vendor/magnific-popup.min.js',
      '/assets/js/vendor/isotope.pkgd.min.js',
      '/assets/js/vendor/imagesloaded.pkgd.min.js',
      '/assets/js/plugins/jarallax.min.js',
      '/assets/js/plugins/headding-title.js',
      '/assets/js/plugins/lenis.min.js',
      '/assets/js/plugins/gsap.min.js',
      '/assets/js/plugins/rs-anim-int.js',
      '/assets/js/plugins/rs-scroll-trigger.min.js',
      '/assets/js/plugins/rs-splitText.min.js',
      '/assets/js/plugins/jquery.lettering.js',
      '/assets/js/plugins/parallax-effect.min.js',
      '/assets/js/plugins/jquery.appear.min.js',
      '/assets/js/plugins/marquee.min.js',
      '/assets/js/vendor/purecounter.js',
      '/assets/js/vendor/odometer.min.js',
    ];

    // ── main.js must load LAST (depends on everything above) ──
    const mainScript = '/assets/js/main.js';

    // REMOVED: chart.umd.min.js (198KB) — no charts on homepage
    // REMOVED: nouislider.min.js (27KB) — no slider inputs on homepage
    // REMOVED: nice-select.min.js (3KB) — no custom dropdowns on homepage

    let mounted = true;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };

    const yieldToMain = () => new Promise<void>(r => setTimeout(r, 0));

    const loadAll = async () => {
      try {
        // Step 1: Load critical scripts sequentially (jQuery → Bootstrap → Swiper),
        // yielding after each so a heavy library's parse+init doesn't chain into
        // one long main-thread task (lower TBT).
        for (const src of criticalScripts) {
          if (!mounted) return;
          await loadScript(src);
          await yieldToMain();
        }

        // Step 2: Load deferred scripts one at a time, yielding to the main thread
        // between each. This breaks the plugin init work into many short tasks
        // instead of a few long ones — directly reduces Total Blocking Time.
        for (const src of deferredScripts) {
          if (!mounted) return;
          await loadScript(src);
          await yieldToMain();
        }

        // Step 3: Load main.js last (depends on everything above)
        if (!mounted) return;
        await loadScript(mainScript);

        const jQuery = (window as any).jQuery;
        if (jQuery) {
          // Trigger window load so jquery plugins (main.js, rs-anim-int.js) run their initializers
          jQuery(window).trigger('load');

          // Re-evaluate background images data-background
          jQuery('[data-background]').each(function (this: any) {
            jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-background') + ')');
          });

          // Trigger odometer
          jQuery('.odometer').each(function (this: any) {
            const count = jQuery(this).attr('data-count');
            jQuery(this).html(count);
          });
        }
      } catch (err) {
        console.warn('Animation loader (non-critical):', err);
      }
    };

    const isHomePage = pathname === '/';
    const idleTimeout = isHomePage ? 2000 : 4000;

    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => loadAll(), { timeout: idleTimeout });
      } else {
        setTimeout(() => loadAll(), isHomePage ? 100 : 2000);
      }
    };

    scheduleLoad();

    return () => {
      mounted = false;
      // Remove error suppressors
      window.removeEventListener('error', suppressLegacyError, true);
      window.removeEventListener('unhandledrejection', suppressLegacyRejection, true);
    };
  }, [pathname]);

  return null;
}
