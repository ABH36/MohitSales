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
import OrganizationSchema from '@/components/OrganizationSchema';
import prisma from '@/lib/prisma';
import './globals.css';

// GA4 measurement ID is env-driven so staging/other envs can point at their own
// property (or disable tracking with an empty value) instead of polluting prod.
// Falls back to the production ID when unset, so prod behaviour is unchanged.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-FZF80T7820';

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
    alternates: { canonical: 'https://mohitscpl.com' },
    openGraph: {
      title: homepageMeta?.ogTitle || title,
      description,
      url: 'https://mohitscpl.com',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      images: [
        {
          url: homepageMeta?.ogImage || 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png',
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
      images: [homepageMeta?.ogImage || 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png'],
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
      {/* Google Analytics (gtag.js) — only injected when a measurement ID is set */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
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

        {/* ── Global structured data: Organization / LocalBusiness + WebSite.
             Helps Google build a Knowledge Panel and surface the business in
             local/rich results. Complements the per-page JSON-LD. ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': ['Organization', 'LocalBusiness', 'ElectronicsStore'],
                  '@id': 'https://mohitscpl.com/#organization',
                  name: 'Mohit Sales Corporation Pvt. Ltd.',
                  alternateName: 'Mohit Sales Corp.',
                  url: 'https://mohitscpl.com',
                  logo: 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783167908/mohit/logo/msc_logo_without_bg.png',
                  image: 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/v1783167908/mohit/logo/msc_logo_without_bg.png',
                  description:
                    'Authorized distributor of Polycab and Dowells electrical products in Indore — wires, cables, switchgears, fans, solar, cable terminals, glands and crimping tools.',
                  telephone: '+91-9770707019',
                  email: 'info@mohitscpl.com',
                  foundingDate: '1997',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '54/2/16 & 54/2/18 Siddharth Farms, Lasudia Mori, Dewas Naka',
                    addressLocality: 'Indore',
                    addressRegion: 'Madhya Pradesh',
                    postalCode: '452010',
                    addressCountry: 'IN',
                  },
                  areaServed: 'IN',
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://mohitscpl.com/#website',
                  url: 'https://mohitscpl.com',
                  name: 'Mohit Sales Corporation Pvt. Ltd.',
                  publisher: { '@id': 'https://mohitscpl.com/#organization' },
                  inLanguage: 'en',
                },
              ],
            }),
          }}
        />

        {/* ── Critical CSS (render-blocking — layout depends on these) ── */}
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/swiper.min.css" />
        {/* FontAwesome (520KB) is icon-only, not layout-critical → load it
            non-render-blocking. Preload fetches it early; NonCriticalCSS
            attaches it on mount; <noscript> covers the no-JS case. Cuts the
            largest render-blocking request without dropping any icon. */}
        <link rel="preload" as="style" href="/assets/css/vendor/fontawesome-pro.css" />
        <noscript><link rel="stylesheet" href="/assets/css/vendor/fontawesome-pro.css" /></noscript>
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
        <OrganizationSchema />
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
