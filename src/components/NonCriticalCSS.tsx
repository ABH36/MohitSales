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
  '/assets/css/vendor/remixicon.css',
  '/assets/css/vendor/animate.min.css',
  '/assets/css/plugins/nice-select.css',
  '/assets/css/plugins/nouislider.min.css',
  '/assets/css/vendor/magnific-popup.css',
  '/assets/css/vendor/odometer.min.css',
];

export default function NonCriticalCSS() {
  const pathname = usePathname();
  useEffect(() => {
    // Skip on admin pages — these stylesheets conflict with admin panel
    if (pathname.startsWith('/admin')) return;
    NON_CRITICAL_CSS.forEach((href) => {
      // Skip if already loaded
      if (document.querySelector(`link[href="${href}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
