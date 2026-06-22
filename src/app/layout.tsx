import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimationLoader from '../components/AnimationLoader';
import ScrollReveal from '../components/ScrollReveal';
import NonCriticalCSS from '../components/NonCriticalCSS';
import PublicSettingsProvider from '../components/PublicSettingsContext';
import './globals.css';

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mohitscpl.com'),
  title: 'Mohit Sales Corporation Pvt. Ltd. | Authorized Polycab & Dowells Distributor',
  description: 'Authorized distributor of Polycab India Ltd. and Dowells. Delivering premium quality wires, cables, terminals, switchgears, and solar products since 1997.',
  keywords: ['Polycab', 'Dowells', 'Cables', 'Wires', 'Terminals', 'Switchgears', 'Solar', 'Distributor', 'India'],
  openGraph: {
    title: 'Mohit Sales Corporation Pvt. Ltd.',
    description: 'Authorized distributor of Polycab India Ltd. and Dowells. Delivering premium quality wires, cables, terminals, switchgears, and solar products since 1997.',
    url: 'https://mohitscpl.com',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    images: [
      {
        url: '/assets/images/logo/logo.png',
        width: 800,
        height: 600,
        alt: 'Mohit Sales Corporation Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohit Sales Corporation Pvt. Ltd.',
    description: 'Authorized distributor of Polycab India Ltd. and Dowells.',
    images: ['/assets/images/logo/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Google Analytics (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-FZF80T7820"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-FZF80T7820');
        `}
      </Script>
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="/assets/images/favicon/favicon.png" />
        {/* ── Critical CSS (render-blocking — layout depends on these) ── */}
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/swiper.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/fontawesome-pro.css" />
        <link rel="stylesheet" href="/assets/css/vendor/spacing.css" />
        <link rel="stylesheet" href="/assets/css/vendor/remixicon.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/custom.css?v=1.0.2" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />

        {/* ── Google Fonts (preload + async) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var intercept = function(key) {
              Object.defineProperty(window, key, {
                configurable: true,
                enumerable: true,
                get: function() { return this['_' + key]; },
                set: function(val) {
                  this['_' + key] = val;
                  if (val && val.fn && !val.fn.niceSelect) {
                    val.fn.niceSelect = function() { return this; };
                  }
                }
              });
            };
            intercept('jQuery');
            intercept('$');
          })();
        ` }} />
      </head>
      <body className="rtl" suppressHydrationWarning={true}>
        <PublicSettingsProvider>
          <AnimationLoader />
          <NonCriticalCSS />
          <ScrollReveal />
          <Header />
          {children}
          <Footer />
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
