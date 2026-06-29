/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
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
      // Polycab sub-category pages are 0-byte placeholders — redirect to actual content
      { source: '/polycab/cables-by-application', destination: '/industries/cables-by-application/building-infrastructure', permanent: false },
      { source: '/polycab/cables-by-standards', destination: '/industries/cables-by-standards/indian-standards', permanent: false },
      { source: '/polycab/cables-by-type', destination: '/industries/cables-by-type/lv-power-cable', permanent: false },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const cspScriptSrc = isProd ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
    const cspValue = `default-src 'self'; script-src ${cspScriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self'; frame-src https://www.google.com; frame-ancestors 'none';`;

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
