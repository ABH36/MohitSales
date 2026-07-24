import prisma from '@/lib/prisma';
import { countFromRows } from '@/lib/product-counts';

/**
 * Data for the homepage "Polycab Consumer" and "Polycab Industries" explorers —
 * the same category tree the header menu uses, brought onto the homepage as
 * filterable card sections so a visitor can reach any range without opening the
 * menu.
 *
 * Each node's slug is exactly the page it links to. Images are resolved from the
 * catalogue at build time: a category rarely has its own photo, so the first
 * product image found under its slug stands in, which keeps the cards visual
 * without hand-curating dozens of images.
 */

export interface ExplorerNode {
  name: string;
  slug: string;
  image?: string | null;
  /** Products under this listing — shown as "View Products (N)" on the card. */
  count?: number;
  children?: ExplorerNode[];
}

export interface ExplorerArm {
  /** Tab + section label, e.g. "Consumer". */
  label: string;
  /** Label for the default "all" tab and its heading, e.g. "All Consumer". */
  allLabel: string;
  /** Where the "All …" card links, i.e. the arm's own hub. */
  allSlug: string;
  categories: ExplorerNode[];
}

/* The two arms, mirroring the header menu. Slugs are the live pages. */

const CONSUMER: ExplorerArm = {
  label: 'Consumer',
  allLabel: 'All Consumer',
  allSlug: 'polycab',
  categories: [
    {
      name: 'Fans', slug: 'polycab/fans',
      children: [
        { name: 'Ceiling Fans', slug: 'fans/ceiling-fans' },
        { name: 'Table Fans', slug: 'fans/table-fans' },
        { name: 'Wall Fans', slug: 'fans/wall-fans' },
        { name: 'Pedestal Fans', slug: 'fans/pedestal-fans' },
        { name: 'Exhaust Fans', slug: 'fans/exhaust-fans' },
        { name: 'Air Circulator', slug: 'fans/air-circulator' },
        { name: 'Farrata Fans', slug: 'fans/farrata-fans' },
      ],
    },
    {
      // Consumer house wires only — the industrial building-wire / domestic-cable
      // hubs belong to the Industries arm, not here.
      name: 'Wires', slug: 'polycab-wires',
      children: [
        { name: 'Polycab Green Wire+', slug: 'wires/polycab-green-wire' },
        { name: 'Polycab Suprema', slug: 'wires/polycab-suprema' },
        { name: 'Polycab Optima+', slug: 'wires/polycab-optima-plus' },
        { name: 'Polycab Primma', slug: 'wires/polycab-primma' },
        { name: 'Polycab LF FR 180M', slug: 'wires/lf-fr-180m-wires' },
      ],
    },
    {
      name: 'Lighting', slug: 'lighting/led-bulb',
      children: [
        { name: 'LED Bulb', slug: 'lighting/led-bulb' },
        { name: 'Downlight', slug: 'lighting/downlight' },
        { name: 'Panel Light', slug: 'lighting/panel-light' },
        { name: 'LED Batten', slug: 'lighting/led-batten' },
        { name: 'LED COB', slug: 'lighting/led-cob' },
        { name: 'Outdoor Lights', slug: 'lighting/outdoor-lights' },
        { name: 'Rope & Strip Lights', slug: 'lighting/rope-and-strip-lights' },
      ],
    },
    {
      name: 'Switches and Accessories', slug: 'switches-accessories/levana',
      children: [
        { name: 'Levana', slug: 'switches-accessories/levana' },
        { name: 'Etira', slug: 'switches-accessories/etira' },
        { name: 'Plastic Modular Boxes', slug: 'switches-accessories/plastic-modular-boxes' },
        { name: 'Accessories', slug: 'switches-accessories/accessories' },
      ],
    },
    {
      name: 'Water Heaters', slug: 'home-appliances/water-heaters',
      children: [
        { name: 'Instant Water Heaters', slug: 'home-appliances/water-heaters/instant-water-heaters' },
        { name: 'Storage Water Heaters', slug: 'home-appliances/water-heaters/storage-water-heaters' },
      ],
    },
    {
      name: 'Switchgear', slug: 'polycab/switchgears',
      children: [
        { name: 'MCB', slug: 'switchgears/mcb' },
        { name: 'MCB Changeover Switch', slug: 'switchgears/mcb-switch' },
        { name: 'RCCB', slug: 'switchgears/rccb' },
        { name: 'RCBO', slug: 'switchgears/rcbo' },
        { name: 'Isolator', slug: 'switchgears/isolator' },
        { name: 'ACCL', slug: 'switchgears/accl' },
        { name: 'Distribution Board', slug: 'switchgears/distribution-board' },
      ],
    },
    {
      name: 'Home Appliances', slug: 'polycab/home-appliances',
      children: [
        { name: 'Irons', slug: 'home-appliances/irons' },
        { name: 'Coolers', slug: 'home-appliances/coolers' },
      ],
    },
    {
      name: 'Conduit & Accessories', slug: 'polycab/conduit-and-accessories',
      children: [
        { name: 'UPVC Conduit', slug: 'conduit-accessories/upvc-conduit' },
        { name: 'Concealed Box', slug: 'conduit-accessories/concealed-box' },
      ],
    },
  ],
};

const INDUSTRIES: ExplorerArm = {
  label: 'Industries',
  allLabel: 'All Industries',
  allSlug: 'industries',
  categories: [
    {
      name: 'Cables by Application', slug: 'industries/cables-by-application',
      children: [
        { name: 'Building infrastructure', slug: 'industries/cables-by-application/building-infrastructure' },
        { name: 'Energy and Power Grid', slug: 'industries/cables-by-application/energy-and-power-grid' },
        { name: 'Exploration industries', slug: 'industries/cables-by-application/exploration-industries' },
        { name: 'Manufacturing industries', slug: 'industries/cables-by-application/manufacturing-industries' },
        { name: 'Mobility infrastructure', slug: 'industries/cables-by-application/mobility-infrastructure' },
      ],
    },
    {
      name: 'Cables by Standards', slug: 'industries/cables-by-standards',
      children: [
        { name: 'Indian Standards (IS)', slug: 'industries/cables-by-standards/indian-standards' },
        { name: 'International Standards', slug: 'industries/cables-by-standards/international-standards' },
      ],
    },
    {
      name: 'Cables by Type', slug: 'industries/cables-by-type',
      children: [
        { name: 'LV Power Cable', slug: 'industries/cables-by-type/lv-power-cable' },
        { name: 'Others', slug: 'industries/cables-by-type/others' },
        { name: 'Instrumentation Cable', slug: 'industries/cables-by-type/instrumentation-cable' },
        { name: 'Communication & Data Cable', slug: 'industries/cables-by-type/communication-and-data-cable' },
        { name: 'Renewable Energy', slug: 'industries/cables-by-type/renewable-energy' },
        { name: 'MV Power Cable', slug: 'industries/cables-by-type/mv-power-cable' },
        { name: 'EHV Power Cable', slug: 'industries/cables-by-type/ehv-power-cable' },
      ],
    },
    {
      name: 'Renewables', slug: 'polycab/solar',
      children: [
        { name: 'Solar Inverters and Panels', slug: 'solar/solar-panel' },
        { name: 'Solar Cables', slug: 'solar/solar-dc-cable' },
        { name: 'DC MCB', slug: 'solar/dc-mcb' },
      ],
    },
  ],
};

/* Dowells is a much thinner, legacy-HTML catalogue: three ranges, and the
   Cable Terminal / Gland sub-items are not product rows, so their images are set
   here by hand (pulled from the live range pages). Crimping Tool's variants are
   real product rows, so their images resolve from the catalogue automatically. */
const DW = 'https://res.cloudinary.com/da2dmtm9b/image/upload';
const DOWELLS: ExplorerArm = {
  label: 'Dowells',
  allLabel: 'All Dowells',
  allSlug: 'dowells',
  categories: [
    {
      name: 'Cable Terminal', slug: 'dowells/cable-terminal',
      image: `${DW}/v1783167915/mohit/our_products/dowells/cable_terminal.png`,
      children: [
        { name: 'Aluminium', slug: 'cable-terminal/aluminium', image: `${DW}/v1783167916/mohit/our_products/dowells/cable_terminal/1.jpg` },
        { name: 'Bimetallic', slug: 'cable-terminal/bimetallic', image: `${DW}/v1783167917/mohit/our_products/dowells/cable_terminal/2.jpg` },
        { name: 'Copper', slug: 'cable-terminal/copper', image: `${DW}/v1783167918/mohit/our_products/dowells/cable_terminal/3.jpg` },
      ],
    },
    {
      name: 'Gland', slug: 'dowells/gland',
      image: `${DW}/v1783167926/mohit/our_products/dowells/gland.png`,
      children: [
        { name: 'Single Compression Gland', slug: 'gland/single-compression-gland', image: `${DW}/v1783167936/mohit/our_products/gland/1.jpg` },
        { name: 'Double Compression Gland', slug: 'gland/double-compression-gland', image: `${DW}/v1783167937/mohit/our_products/gland/2.jpg` },
        { name: 'Flange Type Gland', slug: 'gland/flang-type-gland', image: `${DW}/v1783166512/mohit/our_products/gland/3.jpg` },
        { name: 'Shrouds', slug: 'gland/shrouds', image: `${DW}/v1783166513/mohit/our_products/gland/4.jpg` },
        { name: 'Earthing Tag', slug: 'gland/earthing-tag', image: `${DW}/v1783166511/mohit/our_products/gland/5.jpg` },
      ],
    },
    {
      name: 'Crimping Tool', slug: 'dowells/crimping-tool',
      image: `${DW}/v1783167920/mohit/our_products/dowells/crimping_tool.png`,
      children: [
        { name: 'Foot Hydraulic Crimping Tool', slug: 'dowells/crimping-tool/foot-hydrolic-crimping-tool' },
        { name: 'Hand Hydraulic Crimping Tool', slug: 'dowells/crimping-tool/hand-hydrolic-crimping-tool' },
        { name: 'Hand Manual Crimping Tool', slug: 'dowells/crimping-tool/hand-manual-crimping-tool' },
      ],
    },
  ],
};

/* Polycab Cables — the flagship industrial catalogue. Unlike the other arms it
   is flat-but-huge (each type holds hundreds of individual SKUs), so it is shown
   as a plain grid of the seven cable types, each card linking straight to that
   type's listing page (which has its own filtering). No tab drill-down. */
const CABLES: ExplorerArm = {
  label: 'Cables',
  allLabel: 'All Cables',
  allSlug: 'industries/cables-by-type',
  categories: [
    { name: 'LV Power Cable', slug: 'industries/cables-by-type/lv-power-cable', image: `${DW}/v1783167947/mohit/our_products/polycab-lv-is-7098-i-4c-a2xfy.png` },
    { name: 'MV Power Cable', slug: 'industries/cables-by-type/mv-power-cable', image: `${DW}/v1783167948/mohit/our_products/polycab-mv-is-7098-ii-3c-a2xwy.png` },
    { name: 'EHV Power Cable', slug: 'industries/cables-by-type/ehv-power-cable', image: `${DW}/v1783167946/mohit/our_products/polycab-ehv-cu-al-cor-132kv.png` },
    { name: 'Instrumentation Cable', slug: 'industries/cables-by-type/instrumentation-cable' },
    { name: 'Communication & Data Cable', slug: 'industries/cables-by-type/communication-and-data-cable' },
    { name: 'Renewable Energy', slug: 'industries/cables-by-type/renewable-energy' },
    { name: 'Others', slug: 'industries/cables-by-type/others' },
  ],
};

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/logo/msc_logo_without_bg.png';

/**
 * Resolves a representative image for every node in both arms in one pass.
 * All product/category images are loaded once and matched by slug in memory,
 * so this is two queries regardless of how many nodes there are.
 */
export async function buildExplorerArms(): Promise<{
  cables: ExplorerArm;
  consumer: ExplorerArm;
  industries: ExplorerArm;
  dowells: ExplorerArm;
}> {
  const [products, categories, allSlugs] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, imageSrc: { not: null } },
      select: { slug: true, imageSrc: true },
      orderBy: { slug: 'asc' },
    }),
    prisma.category.findMany({
      where: { image: { not: null } },
      select: { slug: true, image: true },
    }),
    // Every active product's slug + features — used to count "products under a
    // listing" (features carries the card count for single-row multi-product
    // pages like cable-terminal/copper).
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, features: true } }),
  ]);

  const catImage = new Map(categories.map((c) => [c.slug, c.image] as const));
  // Exact-slug lookup, plus a prefix scan for hubs that are not products.
  const productImage = new Map(products.map((p) => [p.slug, p.imageSrc] as const));

  const countFor = (slug: string): number => countFromRows(allSlugs, [slug])[slug] ?? 0;

  const resolve = (slug: string): string => {
    if (catImage.get(slug)) return catImage.get(slug)!;
    if (productImage.get(slug)) return productImage.get(slug)!;
    const prefix = slug.endsWith('/') ? slug : slug + '/';
    for (const p of products) {
      if (p.slug.startsWith(prefix) && p.imageSrc) return p.imageSrc;
    }
    return FALLBACK_IMAGE;
  };

  // An image set by hand on the node wins (curated marketing shots, or the
  // legacy Dowells sub-items that are not product rows); otherwise resolve a
  // representative image from the catalogue by slug.
  const pick = (node: ExplorerNode): string => node.image || resolve(node.slug);

  const fill = (arm: ExplorerArm): ExplorerArm => ({
    ...arm,
    categories: arm.categories.map((cat) => {
      const children = cat.children?.map((child) => ({
        ...child,
        image: pick(child),
        count: countFor(child.slug),
      }));
      // A category's own slug is its menu landing (e.g. "polycab/fans"), which
      // holds no products — the ranges live under "fans/…". So when the category
      // resolves to the placeholder, borrow the first range's image instead.
      let image = pick(cat);
      if (image === FALLBACK_IMAGE) {
        const fromChild = children?.find((c) => c.image && c.image !== FALLBACK_IMAGE)?.image;
        if (fromChild) image = fromChild;
      }
      // Top-level total: the larger of the category's own slug count and the
      // sum of its ranges. Covers both a real hub (Cables by Application — the
      // hub slug holds every product, the range hubs hold none) and a category
      // whose slug is just one landing (Lighting → lighting/led-bulb — the hub
      // count is only the bulbs, so the range sum wins).
      const childSum = children ? children.reduce((s, c) => s + (c.count || 0), 0) : 0;
      const count = Math.max(countFor(cat.slug), childSum);
      return { ...cat, image, count, children };
    }),
  });

  return {
    cables: fill(CABLES),
    consumer: fill(CONSUMER),
    industries: fill(INDUSTRIES),
    dowells: fill(DOWELLS),
  };
}
