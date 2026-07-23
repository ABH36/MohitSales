'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Loads non-critical CSS files asynchronously after the page has rendered.
 * These are animation/plugin stylesheets that don't affect above-the-fold layout.
 */
const NON_CRITICAL_CSS = [
  // FontAwesome (~520KB) is icon-only, not layout-critical → deferred so it
  // never blocks first paint. The layout <head> preloads it, so the bytes are
  // already cached by the time this attaches. Keeps every icon available
  // (incl. any used only in admin-editable DB content).
  '/assets/css/vendor/fontawesome-pro.css',
  // remixicon dropped entirely: zero `ri-` classes anywhere in src OR in the
  // stored legacy DB HTML (verified), so the 144KB stylesheet + fonts styled
  // nothing. FontAwesome remains for menu arrows / fa-* in content.
  '/assets/css/vendor/animate.min.css',
  '/assets/css/vendor/magnific-popup.css',
  '/assets/css/vendor/odometer.min.css',
  // Dropped nice-select and nouislider stylesheets: their init JS was already
  // removed, there are no `.nice-select`/`noUi-` elements and no `#slider-range`
  // to create any, so the CSS styled nothing. magnific-popup is kept — 9
  // `popup-image`/`popup-video` triggers in the stored legacy HTML open its
  // lightbox at runtime, which needs this stylesheet.
];

export default function NonCriticalCSS() {
  const pathname = usePathname();
  useEffect(() => {
    // Skip on admin pages — these stylesheets conflict with admin panel
    if (pathname.startsWith('/admin')) return;
    NON_CRITICAL_CSS.forEach((href) => {
      // Skip only if it is already attached as an actual STYLESHEET.
      // NOTE: match rel="stylesheet" specifically — the <head> may already
      // hold a <link rel="preload"> for the same href (e.g. FontAwesome), and
      // a preload merely fetches the file; it never applies the styles. A loose
      // `link[href=...]` check matched that preload and skipped attaching the
      // real stylesheet, leaving every FontAwesome icon invisible site-wide.
      if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
