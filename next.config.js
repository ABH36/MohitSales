/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    // Cloudinary already delivers optimized formats/sizes (f_auto,q_auto via
    // the cld() helper), so we skip Next's own image optimizer. This also
    // avoids the common self-hosted/Docker breakage where /_next/image fails
    // (missing sharp / can't reach the origin behind a reverse proxy), which
    // makes <Image> render nothing on the server.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // ── SEO de-duplication ──────────────────────────────────────────────
      // The 2,122 /polycab/cables-by-* pages are byte-identical duplicates of
      // the canonical /industries/cables-by-* pages. Permanently redirect the
      // whole subtree so ranking signals consolidate and duplicates leave the
      // index. (:path+ = one-or-more segments; bare section pages handled below.)
      { source: '/polycab/cables-by-application/:path+', destination: '/industries/cables-by-application/:path+', permanent: true },
      { source: '/polycab/cables-by-type/:path+', destination: '/industries/cables-by-type/:path+', permanent: true },
      { source: '/polycab/cables-by-standards/:path+', destination: '/industries/cables-by-standards/:path+', permanent: true },
      // Bare section landings (placeholders) → a known-good canonical sub-page.
      { source: '/polycab/cables-by-application', destination: '/industries/cables-by-application/building-infrastructure', permanent: true },
      { source: '/polycab/cables-by-standards', destination: '/industries/cables-by-standards/indian-standards', permanent: true },
      { source: '/polycab/cables-by-type', destination: '/industries/cables-by-type/lv-power-cable', permanent: true },
      // Legacy homepage aliases.
      { source: '/index', destination: '/', permanent: true },
      { source: '/index-old', destination: '/', permanent: true },
      // The company profile is now a section of About Us rather than a page of
      // its own. Redirected rather than dropped so older links and anything
      // printed with the old URL still land somewhere useful.
      { source: '/company-profile', destination: '/about-us', permanent: true },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    // Google Analytics (gtag.js) — the script comes from googletagmanager.com and
    // beacons go to google-analytics.com; without these the site's own CSP blocks GA.
    const gaScript = 'https://www.googletagmanager.com';
    const gaConnect = 'https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com';
    const cspScriptSrc = isProd ? `'self' 'unsafe-inline' ${gaScript}` : `'self' 'unsafe-inline' 'unsafe-eval' ${gaScript}`;
    const cspValue = `default-src 'self'; script-src ${cspScriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self' ${gaConnect}; frame-src https://www.google.com; frame-ancestors 'none';`;

    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
