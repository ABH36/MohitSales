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

// Every public page is server-rendered per request. Dropping this makes the
// build prerender all ~4,400 pages instead (measured: builds fine, ~4 min, and
// pages serve much faster) — but then admin edits only appear after the page
// revalidates, so it is a content-workflow decision, not just a perf one.
// Note: it is NOT what causes missing URLs to answer 200 — that was measured
// with and without this flag and is unchanged.
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
          {/* lazyOnload (not afterInteractive): gtag's ~1.6s of long tasks were
              landing inside the TBT window on throttled phones; analytics can
              wait until the browser is idle without losing pageview data. */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
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

        {/* The hero-banner preload lives on the homepage itself (media-split
            mobile/desktop, fetchpriority=high) — a single desktop-only preload
            here loaded the wrong variant for phones and wasted bytes on every
            non-home page. */}

        {/* ── DNS prefetch for external domains ── */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Global Organization / LocalBusiness + WebSite structured data is
            emitted by <OrganizationSchema /> further down. It was briefly
            duplicated here as a hand-written block, which declared the same
            @id twice with a different telephone than the one in Settings —
            conflicting contact details for one entity. Single source now. */}

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
