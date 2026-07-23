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
 * breakpoint can display (the mobile original is 114KB; w_1080 serves 47KB).
 * The preload links and the slider MUST use the same transform, or the browser
 * downloads the image twice.
 */
export const BANNER_TRANSFORM = {
  desktop: 'f_auto,q_auto,w_1920',
  mobile: 'f_auto,q_auto,w_1080',
};
