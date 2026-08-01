/**
 * Fills missing product datasheets by mapping each product to the relevant
 * official Polycab RANGE/CATEGORY brochure PDF (Polycab does not publish
 * per-product datasheets — only range brochures). Links point directly at
 * Polycab's CDN (cms.polycab.com), per the agreed hosting choice.
 *
 * DRY by default: prints what WOULD change and writes a report; no DB writes.
 * Pass --apply to actually set datasheetLink. Run --apply against PROD is a
 * deployer step.
 *
 *   npx tsx scripts/fill-datasheets-from-polycab.ts            # dry report
 *   npx tsx scripts/fill-datasheets-from-polycab.ts --apply    # write DB
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const M = 'https://cms.polycab.com/media';
// Official Polycab range brochures (title -> URL), gathered from
// polycab.com/product-brochures/*.
const B = {
  HOUSE_WIRES: `${M}/q33mxdlf/house-wires-catalogue-with-suprema-march-25.pdf`,
  GREEN_WIRE: `${M}/2iobnjo3/polycab-green-wire-leaflet.pdf`,
  SYNC: `${M}/fclpy0yx/sync-leaflet_web.pdf`,
  FANS: `${M}/crhb2fx2/15mb-digital-pdf.pdf`,
  LED: `${M}/vn4bv5f4/led-digital-catalogue-2026.pdf`,
  PRO_LIGHTING: `${M}/e5qdcpje/professional-lighting-catalogue.pdf`,
  SWITCHES: `${M}/3ltjtydd/polycab-switches-catalogue.pdf`,
  SWITCHGEAR: `${M}/o1wan13m/switchgear-technical-catalogue-web-version.pdf`,
  SOLAR_RANGE: `${M}/km3f5gvq/polycab-solar-range-catalogue-8.pdf`,
  SOLAR_DC_CABLE: `${M}/jqvffc3o/polycab_solar-pv-dc-cable_v1.pdf`,
  DOWELLS: `${M}/4ykjk4px/dowells-brochure.pdf`,
  LT: `${M}/kb1l12kq/lt-catalogue-ord_17720_v2.pdf`,
  HT: `${M}/2bgh00kf/ht-cable-catalogue.pdf`,
  EHV: `${M}/tdidggtl/polycab-ehv-brochure.pdf`,
  MVCC: `${M}/bu3ixzub/polycab-mvcc-condactor-catalogue-pdf.pdf`,
  INSTRUMENTATION: `${M}/v0hf0z4m/instrumentation-cable_catalogue_innerpage_v9_ord-10763-final-c2c.pdf`,
  COMMUNICATION: `${M}/1nvdf0tf/approved_communicaton-cable-catlogue.pdf`,
  RUBBER: `${M}/44sptk1w/final_rubber-cable_catalogue.pdf`,
  FIRE: `${M}/k5lfvqld/fire-survival-cable-brochure-artwork_2.pdf`,
  UNINYVIN: `${M}/3dsjre3i/uninyvin-cable-compressed.pdf`,
  B2B_ALL: `${M}/2hlozcdj/b2b-all-products-catalogue.pdf`, // catch-all
};

// Human-readable label per URL, for the report.
const LABEL: Record<string, string> = {
  [B.HOUSE_WIRES]: 'House Wires', [B.GREEN_WIRE]: 'Green Wire', [B.SYNC]: 'Sync Wire',
  [B.FANS]: 'Fans', [B.LED]: 'LED Lighting', [B.PRO_LIGHTING]: 'Professional Lighting',
  [B.SWITCHES]: 'Switches', [B.SWITCHGEAR]: 'Switchgear', [B.SOLAR_RANGE]: 'Solar Range',
  [B.SOLAR_DC_CABLE]: 'Solar DC Cable', [B.DOWELLS]: 'Dowells', [B.LT]: 'LT Cable',
  [B.HT]: 'HT Cable (MV)', [B.EHV]: 'EHV Cable', [B.MVCC]: 'MVCC Conductor',
  [B.INSTRUMENTATION]: 'Instrumentation Cable', [B.COMMUNICATION]: 'Communication & Data Cable',
  [B.RUBBER]: 'Rubber Cable', [B.FIRE]: 'Fire Survival Cable', [B.UNINYVIN]: 'Uninyvin Cable',
  [B.B2B_ALL]: 'B2B All-Products (fallback)',
};

/** Map a product slug to the best-matching Polycab brochure URL. */
function brochureFor(slug: string, title: string): string {
  const s = (slug + ' ' + title).toLowerCase();
  const first = slug.toLowerCase().split('/')[0];

  // Consumer families
  if (first === 'wires' || first === 'polycab-wires') {
    if (/green/.test(s)) return B.GREEN_WIRE;
    if (/\bsync\b/.test(s)) return B.SYNC;
    return B.HOUSE_WIRES;
  }
  if (/^fans/.test(first)) return B.FANS;
  if (/^lighting/.test(first)) {
    if (/outdoor|flood|street|gate|gate-light|professional|highbay|high-bay/.test(s)) return B.PRO_LIGHTING;
    return B.LED;
  }
  if (first === 'switches-accessories') return B.SWITCHES;
  if (first === 'switchgears') return B.SWITCHGEAR;
  if (/^solar/.test(first)) {
    if (/dc-cable|dc cable|pv-dc|pv dc/.test(s)) return B.SOLAR_DC_CABLE;
    return B.SOLAR_RANGE;
  }
  if (/^(dowells|gland|cable-terminal)/.test(first) || /crimping|lug|gland/.test(s)) return B.DOWELLS;

  // Industrial cables — match by cable type keywords anywhere in the path/title.
  if (/ehv/.test(s)) return B.EHV;
  if (/instrumentation/.test(s)) return B.INSTRUMENTATION;
  if (/communication|data-cable|coaxial|rs-485|festoon/.test(s)) return B.COMMUNICATION;
  if (/rubber/.test(s)) return B.RUBBER;
  if (/fire-survival|fire-protection|fs-cable/.test(s)) return B.FIRE;
  if (/uninyvin/.test(s)) return B.UNINYVIN;
  if (/mvcc/.test(s)) return B.MVCC;
  if (/\bmv\b|mv-power|medium-voltage|6\.35|11kv|3\.3kv|33kv|6622|6724|7835/.test(s)) return B.HT;
  if (/\bhv\b|high-voltage/.test(s)) return B.HT;
  if (/building-wire|house-?wire|hffr|is-694|frls|fr-lsh|etira-fr|green-wire/.test(s)) return B.HOUSE_WIRES;
  if (/lv-power|low-voltage|60502-1|xlpe|armoured|unarmoured|lt-|\blv\b/.test(s)) return B.LT;

  // Any remaining cable / taxonomy node → the master B2B catalogue.
  return B.B2B_ALL;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { OR: [{ datasheetLink: null }, { datasheetLink: '' }] },
    select: { id: true, title: true, slug: true },
  });

  const byBrochure: Record<string, number> = {};
  const rows: string[] = [];
  let fallback = 0;

  for (const p of products) {
    const url = brochureFor(p.slug, p.title || '');
    const label = LABEL[url] || url;
    byBrochure[label] = (byBrochure[label] || 0) + 1;
    if (url === B.B2B_ALL) fallback++;
    rows.push(`${label}\t${p.slug}\t${url}`);
    if (APPLY) {
      await prisma.product.update({ where: { id: p.id }, data: { datasheetLink: url } });
    }
  }

  const summary = Object.entries(byBrochure).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  ${String(v).padStart(4)}  ${k}`).join('\n');

  const header =
    `=== DATASHEET FILL ${APPLY ? '(APPLIED)' : '(DRY RUN — no DB writes)'} ===\n` +
    `Products with missing datasheet: ${products.length}\n` +
    `Mapped to a specific range brochure: ${products.length - fallback}\n` +
    `Mapped to B2B all-products fallback: ${fallback}\n\n` +
    `By brochure:\n${summary}\n`;

  console.log(header);
  const out = 'scripts/datasheet-fill-report.tsv';
  fs.writeFileSync(out, header + '\n' + rows.join('\n'));
  console.log(`Full per-product mapping written to ${out}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
