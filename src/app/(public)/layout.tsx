import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickySocialMedia from '@/components/StickySocialMedia';
import AnimationLoader from '@/components/AnimationLoader';
import ScrollReveal from '@/components/ScrollReveal';
import NonCriticalCSS from '@/components/NonCriticalCSS';
import GoogleFontsLoader from '@/components/GoogleFontsLoader';
import PublicSettingsProvider from '@/components/PublicSettingsContext';
import prisma from '@/lib/prisma';
import './globals.css';

export const dynamic = 'force-dynamic';

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

let verificationCache: { data: Record<string, string>; ts: number } | null = null;

async function getWebmasterCodes(): Promise<Record<string, string>> {
  if (verificationCache && Date.now() - verificationCache.ts < 60000) return verificationCache.data;
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ['webmaster_google', 'webmaster_bing', 'webmaster_baidu', 'webmaster_yandex'] } },
      select: { key: true, value: true },
    });
    const data = Object.fromEntries(settings.map(s => [s.key, s.value]));
    verificationCache = { data, ts: Date.now() };
    return data;
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const codes = await getWebmasterCodes();

  // Try to load homepage metadata from database
  let homepageMeta = null;
  try {
    homepageMeta = await prisma.seoMeta.findUnique({
      where: { page: '/' }
    });
  } catch (err) {
    console.error('Error fetching homepage metadata:', err);
  }

  const title = homepageMeta?.title || 'Mohit Sales Corporation Pvt. Ltd. | Authorized Polycab & Dowells Distributor';
  const description = homepageMeta?.description || 'Authorized distributor of Polycab India Ltd. and Dowells. Delivering premium quality wires, cables, terminals, switchgears, and solar products since 1997.';
  const keywords = homepageMeta?.keywords
    ? homepageMeta.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : ['Polycab', 'Dowells', 'Cables', 'Wires', 'Terminals', 'Switchgears', 'Solar', 'Distributor', 'India'];

  return {
    metadataBase: new URL('https://mohitscpl.com'),
    title,
    description,
    keywords,
    openGraph: {
      title: homepageMeta?.ogTitle || title,
      description,
      url: 'https://mohitscpl.com',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      images: [
        {
          url: homepageMeta?.ogImage || '/assets/images/logo/logo.png',
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
      title: homepageMeta?.ogTitle || title,
      description,
      images: [homepageMeta?.ogImage || '/assets/images/logo/logo.png'],
    },
    verification: {
      google: codes.webmaster_google || undefined,
      yandex: codes.webmaster_yandex || undefined,
      other: {
        ...(codes.webmaster_bing ? { 'msvalidate.01': codes.webmaster_bing } : {}),
        ...(codes.webmaster_baidu ? { 'baidu-site-verification': codes.webmaster_baidu } : {}),
      },
    },
  };
}

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
        <link rel="shortcut icon" type="image/x-icon" href="https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167895/mohit/favicon/favicon.png" />

        {/* ── Preload LCP image (banner) — browser downloads immediately.
             URL carries f_auto,q_auto to match BannerSlider's rendered
             background so the preload is reused (no duplicate download).
             `type` is omitted because f_auto may deliver AVIF or WebP. ── */}
        <link rel="preload" as="image" href="https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783167821/mohit/banner/desktop/cable.webp" />

        {/* ── DNS prefetch for external domains ── */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* ── Critical CSS (render-blocking — layout depends on these) ── */}
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/swiper.min.css" />
        <link rel="stylesheet" href="/assets/css/vendor/fontawesome-pro.css" />
        <link rel="stylesheet" href="/assets/css/vendor/spacing.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/custom.css?v=1.0.4" />
        <link rel="stylesheet" href="/assets/css/responsive.css?v=1.0.1" />

        {/* ── Google Fonts (preconnect + non-blocking load via GoogleFontsLoader) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </noscript>
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
      <body className="ltr" suppressHydrationWarning={true}>
        <PublicSettingsProvider>
          <GoogleFontsLoader />
          <AnimationLoader />
          <NonCriticalCSS />
          <ScrollReveal />
          <Header />
          {children}
          <Footer />
          <StickySocialMedia />
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
