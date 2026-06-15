'use client';

import { useEffect } from 'react';

/**
 * Loads non-critical CSS files asynchronously after the page has rendered.
 * These are animation/plugin stylesheets that don't affect above-the-fold layout.
 */
const NON_CRITICAL_CSS = [
  '/assets/css/vendor/animate.min.css',
  '/assets/css/plugins/nice-select.css',
  '/assets/css/plugins/nouislider.min.css',
  '/assets/css/vendor/magnific-popup.css',
  '/assets/css/vendor/odometer.min.css',
];

export default function NonCriticalCSS() {
  useEffect(() => {
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
