/**
 * First-paint hero images, shared between the (client) BannerSlider — where
 * they are the first fallback slides — and the (server) homepage, which emits
 * <link rel="preload"> hints for them. Kept in a plain module because values
 * cannot be imported out of a 'use client' file into a server component.
 */
export const FIRST_BANNER = {
  desktop: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167821/mohit/banner/desktop/cable.webp',
  mobile: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167829/mohit/banner/mobile/cable.webp',
};

/**
 * Cloudinary transforms for the banner slides — capped to the largest size each
 * breakpoint can display. The preload links and the slider MUST use the same
 * transform, or the browser downloads the image twice.
 *
 * Mobile: every banner asset (including the "mobile" set) is the same wide
 * 1920×911 artwork, which rendered as a ~185px strip on phones. c_fill with
 * auto gravity re-crops it to a taller 1080×800 frame around the artwork's
 * salient region, and the CSS aspect-ratio (globals: banner mobile block)
 * matches this crop exactly.
 */
export const BANNER_TRANSFORM = {
  desktop: 'f_auto,q_auto,w_1920',
  mobile: 'f_auto,q_auto,c_fill,g_auto,w_1080,h_900',
};
