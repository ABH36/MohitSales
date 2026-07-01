'use client';

import { useEffect } from 'react';

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';

/**
 * Applies the Google Fonts stylesheet without blocking initial render.
 * The layout <head> already issues a <link rel="preload"> for this URL,
 * so by the time this effect runs the CSS is already in the browser cache
 * — this just attaches it, avoiding the render-blocking <link rel="stylesheet">.
 */
export default function GoogleFontsLoader() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_URL}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_URL;
    document.head.appendChild(link);
  }, []);

  return null;
}
