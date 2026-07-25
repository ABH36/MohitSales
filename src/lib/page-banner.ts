import { cld } from '@/lib/cloudinary';

/**
 * Chooses the in-page (breadcrumb) banner image for a product/category slug so
 * the header art matches what the page is about, instead of the one generic
 * "products" strip on every page.
 *
 * Two asset families exist on Cloudinary:
 *  - mohit/inner-banner/products.png — a clean 1920×450 wire-spool strip built
 *    as a breadcrumb background (light on the left for the title). Cables and
 *    wires (~93% of the catalogue) already suit it, so it stays their banner
 *    and is the safe default.
 *  - mohit/banner/desktop/<cat> — the taller category hero images (fans, cable,
 *    wire, switchgear, solar, dowells, polycab). These carry product imagery, so
 *    the consumer categories that products.png does not fit map here. A
 *    left-to-right light wash (see breadcrumbBgStyle) keeps the title readable
 *    and hides the hero's own baked-in text on the left.
 */
const CLOUD = 'https://res.cloudinary.com/da2dmtm9b/image/upload';
const PRODUCTS_BANNER = `${CLOUD}/v1783167906/mohit/inner-banner/products.png`;

// The category hero images (1920×911) carry their title text in the upper half
// and the product montage along the bottom. Cropping to the lower strip
// (g_south) drops the baked-in text and keeps only product imagery, so the hero
// works as a clean breadcrumb background behind the page's own title.
const heroBanner = (name: string) =>
  `${CLOUD}/c_fill,g_south,h_390,w_1920,f_auto,q_auto/mohit/banner/desktop/${name}`;

export function bannerForSlug(slug: string | null | undefined): string {
  const s = (slug || '').toLowerCase();
  const first = s.split('/')[0];

  // Cables / wires already suit the default wire-spool strip.
  if (first === 'wires' || first === 'polycab-wires') return PRODUCTS_BANNER;
  if (first === 'industries' || first === 'polycab-cables' || /cable/.test(first))
    return PRODUCTS_BANNER;

  // Dowells terminals / lugs / glands / crimping tools and conduit accessories.
  if (
    /^(gland|cable-terminal|conduit-accessories|dowells)/.test(first) ||
    /crimping|lug/.test(s)
  )
    return heroBanner('dowells');

  if (/fan/.test(first)) return heroBanner('fans');
  if (/solar|renewable/.test(first)) return heroBanner('solar_product');
  if (/switchgear/.test(first)) return heroBanner('switchgear');
  if (/switch|accessor/.test(first)) return heroBanner('switchgear');
  if (/light/.test(first)) return heroBanner('polycab');
  if (first === 'home-appliances' || first === 'polycab-home-appliances')
    return heroBanner('polycab');
  if (first.startsWith('polycab')) return heroBanner('polycab');

  return PRODUCTS_BANNER;
}

/**
 * Full CSS `background` value for `.rs-breadcrumb-bg`: the chosen image plus a
 * left-to-right light wash so the dark navy breadcrumb title always reads and
 * any hero-baked text on the left recedes. Right side stays clear so the
 * product imagery shows.
 */
export function breadcrumbBgStyle(slug: string | null | undefined): string {
  const url = cld(bannerForSlug(slug));
  // Fully opaque on the far left (where the dark navy title sits, hiding any
  // hero-baked wordmark there), fading to clear by the right so the product
  // imagery shows through.
  return (
    `linear-gradient(90deg, rgb(244,246,250) 0%, rgb(244,246,250) 26%, rgba(244,246,250,0.72) 44%, rgba(244,246,250,0.18) 66%, rgba(244,246,250,0) 88%), ` +
    `url('${url}')`
  );
}
