#!/usr/bin/env node
/**
 * scripts/import-polycab-ranges.js
 *
 * Imports the Polycab ranges the catalogue was missing — Lighting, Switches &
 * Accessories, the five house/180m wires and the Switchgear distribution board —
 * from the product export in the Real-Switch-Gears repository.
 *
 * Two levels are created, matching how home-appliances/water-heaters/… nests:
 *   lighting/led-bulb                          ← range page
 *   lighting/led-bulb/aelius-nxt-g-led-bulb    ← individual product
 *
 * Source data quirks this has to repair:
 *   - Every switch is named for its function alone ("Blank Plate", "Caprina")
 *     with no range anywhere in the record. The range is only recoverable from
 *     the image filename (`switches-etira-blank-plate.png`), so that is what
 *     drives both the naming and the category tree.
 *   - Three wires are stored with the brand run together and in caps
 *     ("POLYCABSUPREMA"), and many names are fully capitalised.
 *
 * Idempotent: products are matched on slug, so a second run updates rather than
 * duplicates, and images already carrying a Cloudinary URL are not re-uploaded.
 *
 * Usage:
 *   node scripts/import-polycab-ranges.js --dry     # report only, no writes
 *   node scripts/import-polycab-ranges.js           # apply
 */

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();
const DRY_RUN =
  process.env.DRY_RUN === '1' ||
  process.argv.includes('--dry') ||
  process.argv.includes('--dry-run');

// A checkout of the Real-Switch-Gears repository; sits next to this project
// by default, override with POLYCAB_SRC.
const REPO = process.env.POLYCAB_SRC || path.join(process.cwd(), '..', 'polycab-src');
const DATA = path.join(REPO, 'src/data/catalog/polycab.products.json');
const IMAGES = path.join(REPO, 'public');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ── naming ─────────────────────────────────────────────────────────────── */

/**
 * Capitalisation that leaves genuine acronyms alone. A blanket title-case turns
 * "LED" into "Led" and "LF FR 180m Wires" into "Lf Fr 180m Wires".
 */
const ACRONYMS = new Set([
  'LED', 'COB', 'CCT', 'LF', 'FR', 'FRLS', 'LSH', 'HR', 'DP', 'RJ', 'HS',
  'BLDC', 'DLX', 'MCB', 'RCCB', 'RCBO', 'DB', 'AC', 'DC', 'USB', 'TV', 'IP',
  'ABS', 'UV', 'PC', 'CFL', 'SP', 'NXT', 'MM', 'W', 'V', 'A', 'T', 'G',
]);

function normaliseName(raw) {
  let s = String(raw || '').replace(/\s+/g, ' ').trim();
  // "POLYCABSUPREMA" → "POLYCAB SUPREMA"
  s = s.replace(/^POLYCAB(?=[A-Z])/, 'POLYCAB ');
  return s
    .split(' ')
    .map((word) =>
      word
        .split('-')
        .map((part) => {
          if (!part) return part;
          if (ACRONYMS.has(part.toUpperCase()) && part === part.toUpperCase()) return part;
          if (part === part.toUpperCase() && /[A-Z]{2,}/.test(part)) {
            return part[0] + part.slice(1).toLowerCase();
          }
          return part;
        })
        .join('-')
    )
    .join(' ');
}

/**
 * Product title, brand first.
 *
 * Switches carry their range, lights do not. Every switch is named for its
 * function alone — "Blank Plate", "Caprina", "1 Way Switch" — which says nothing
 * about which range it belongs to, so Etira/Levana has to be in the title.
 * Lights already have distinctive product names (Aelius, Pearl, Scintillate) and
 * usually name their own type, so adding the range produced both
 * "Polycab LED Bulb Aelius LED Deco Lamp" and, where the name happened to
 * contain it, "Polycab Aelius Nxt-G LED Bulb" — two shapes inside one listing.
 * The range is still on the breadcrumb and the range page either way.
 *
 * "Accessories" is never prepended: it names the shelf, not the product.
 */
function buildTitle(section, rangeLabel, rawName) {
  const name = normaliseName(rawName);
  const useRange = section === 'switches-accessories' && rangeLabel !== 'Accessories';
  return `Polycab ${useRange ? rangeLabel + ' ' : ''}${name}`.replace(/\s+/g, ' ').trim();
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* ── range mapping ──────────────────────────────────────────────────────── */

/** Image filename prefix → the range it belongs to. */
const RANGE_BY_PREFIX = [
  ['switches-etira-', 'Etira', 'switches-accessories'],
  ['levana-', 'Levana', 'switches-accessories'],
  ['plastic-modular-', 'Plastic Modular Boxes', 'switches-accessories'],
  ['switch-accessories-', 'Accessories', 'switches-accessories'],
  ['led-bulb-', 'LED Bulb', 'lighting'],
  ['led-batten-', 'LED Batten', 'lighting'],
  ['led-cob-', 'LED COB', 'lighting'],
  ['panel-light-', 'Panel Light', 'lighting'],
  ['outdoor-lights-', 'Outdoor Lights', 'lighting'],
  ['rope-strip-', 'Rope & Strip Lights', 'lighting'],
  ['downlight-', 'Downlight', 'lighting'],
];

function rangeOf(imagePath) {
  const file = String(imagePath || '').split('/').pop() || '';
  for (const [prefix, label, section] of RANGE_BY_PREFIX) {
    if (file.startsWith(prefix)) return { label, section };
  }
  return null;
}

/** The five wires the catalogue lacked; the other two are already listed. */
const WANTED_WIRES = new Set([
  'POLYCABSUPREMA',
  'POLYCABOPTIMA+',
  'POLYCABPRIMMA',
  'Polycab Green Wire', // the 180 Meter one, not "Green Wire+"
  'LF FR 180m Wires',
]);

/* ── helpers ────────────────────────────────────────────────────────────── */

async function upsertCategory({ name, slug, parentId, description, image }) {
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    if (image && !existing.image && !DRY_RUN) {
      await prisma.category.update({ where: { slug }, data: { image } });
    }
    return existing;
  }
  console.log(`   + category  ${name}  (${slug})`);
  if (DRY_RUN) return { id: `dry-${slug}`, slug, name };
  return prisma.category.create({
    data: { name, slug, parentId, description, isActive: true, ...(image ? { image } : {}) },
  });
}

const uploaded = new Map();

async function uploadImage(localPath, publicId) {
  if (uploaded.has(publicId)) return uploaded.get(publicId);
  const abs = path.join(IMAGES, localPath.replace(/^\//, ''));
  if (!fs.existsSync(abs)) return null;
  if (DRY_RUN) return `DRY://${publicId}`;
  const res = await cloudinary.uploader.upload(abs, {
    folder: 'mohit/catalog',
    public_id: publicId,
    overwrite: false,
    resource_type: 'image',
  });
  uploaded.set(publicId, res.secure_url);
  return res.secure_url;
}

async function upsertProduct({ slug, title, description, features, imageSrc, categoryId }) {
  const existing = await prisma.product.findUnique({ where: { slug } });
  const data = {
    title,
    description,
    features,
    ...(imageSrc ? { imageSrc } : {}),
    categoryId,
    isActive: true,
    stock: 999,
  };
  if (existing) {
    if (DRY_RUN) return { action: 'update' };
    await prisma.product.update({ where: { slug }, data });
    return { action: 'update' };
  }
  if (DRY_RUN) return { action: 'create' };
  await prisma.product.create({ data: { ...data, slug } });
  return { action: 'create' };
}

/* ── main ───────────────────────────────────────────────────────────────── */

async function main() {
  if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes, no uploads\n');

  if (!fs.existsSync(DATA)) {
    console.error(`Source data not found: ${DATA}`);
    console.error('Point POLYCAB_SRC at a checkout of the Real-Switch-Gears repository.');
    process.exitCode = 1;
    return;
  }

  const src = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const polycab = await prisma.category.findUnique({ where: { slug: 'polycab' } });
  if (!polycab) {
    console.error('The "polycab" root category is missing — nothing to attach to.');
    process.exitCode = 1;
    return;
  }

  // Sections that need a home of their own.
  const sections = {
    lighting: await upsertCategory({
      name: 'Lighting',
      slug: 'polycab-lighting',
      parentId: polycab.id,
      description: 'Polycab LED lighting — bulbs, downlights, panel lights, battens, outdoor and strip lighting.',
    }),
    'switches-accessories': await upsertCategory({
      name: 'Switches & Accessories',
      slug: 'polycab-switches-accessories',
      parentId: polycab.id,
      description: 'Polycab modular switches, sockets, plates and wiring accessories.',
    }),
    wires: await upsertCategory({
      name: 'Wires',
      slug: 'polycab-wires',
      parentId: polycab.id,
      description: 'Polycab house wires and 180 metre wire ranges.',
    }),
  };
  const switchgear = await prisma.category.findUnique({ where: { slug: 'polycab-switchgears' } });

  const stats = { rangePages: 0, skus: 0, created: 0, updated: 0, images: 0, shadowsRemoved: 0, noImage: [] };

  /* ---- ranges (lighting + switches) ---- */
  const ranged = src.filter(
    (p) => p.category === 'Lighting' || p.category === 'Switches and Accessories'
  );

  const byRange = new Map();
  const unmapped = [];
  for (const p of ranged) {
    const r = rangeOf(p.image);
    if (!r) { unmapped.push(p.name); continue; }
    const key = `${r.section}/${slugify(r.label)}`;
    if (!byRange.has(key)) byRange.set(key, { ...r, items: [] });
    byRange.get(key).items.push(p);
  }

  for (const [key, range] of byRange) {
    const sectionCat = sections[range.section];
    console.log(`\n  ${range.label}  (${range.items.length} products)  → /${key}`);

    /*
     * The range is a category, not a product.
     *
     * It was a product to begin with, which rendered /lighting/led-bulb as a
     * single item page with no way through to the six bulbs underneath it — the
     * SKUs existed but nothing linked to them. A category takes the listing
     * branch of the router instead, which renders its products as a grid.
     */
    const lead = range.items[0];
    const rangeImg = await uploadImage(lead.image, `${slugify(range.label)}-range`);
    const rangeCat = await upsertCategory({
      name: range.label,
      slug: key,
      parentId: sectionCat.id,
      description: `Polycab ${range.label} range.`,
      image: rangeImg && !rangeImg.startsWith('DRY://') ? rangeImg : undefined,
    });
    stats.rangePages++;

    for (const p of range.items) {
      const title = buildTitle(range.section, range.label, p.name);
      const slug = `${key}/${slugify(p.name)}`;
      const img = await uploadImage(p.image, slugify(`${range.label}-${p.name}`));
      if (!img) stats.noImage.push(p.name);
      const r = await upsertProduct({
        slug,
        title,
        description: JSON.stringify(p.overview || []),
        features: JSON.stringify(p.benefits || []),
        imageSrc: img && !img.startsWith('DRY://') ? img : undefined,
        categoryId: rangeCat.id,
      });
      stats.skus++;
      stats[r.action === 'create' ? 'created' : 'updated']++;
      if (img) stats.images++;
    }

    // An earlier run created the range as a product; that row now shadows the
    // category on the same slug, so it has to go.
    const shadow = await prisma.product.findUnique({ where: { slug: key } });
    if (shadow) {
      console.log(`     - removing stale range product on /${key}`);
      if (!DRY_RUN) await prisma.product.delete({ where: { slug: key } });
      stats.shadowsRemoved++;
    }
  }

  /* ---- wires ---- */
  const wires = src.filter((p) => p.category === 'Wires' && WANTED_WIRES.has(p.name));
  console.log(`\n  Wires  (${wires.length} products)  → /wires`);
  for (const p of wires) {
    const title = normaliseName(p.name);
    const slug = `wires/${slugify(title)}`;
    const img = await uploadImage(p.image, slugify(`wire-${title}`));
    if (!img) stats.noImage.push(p.name);
    const r = await upsertProduct({
      slug,
      title,
      description: JSON.stringify(p.overview || []),
      features: JSON.stringify(p.benefits || []),
      imageSrc: img && !img.startsWith('DRY://') ? img : undefined,
      categoryId: sections.wires.id,
    });
    stats.skus++;
    stats[r.action === 'create' ? 'created' : 'updated']++;
    if (img) stats.images++;
    console.log(`     ${p.name}  →  ${title}`);
  }

  /* ---- switchgear distribution board ---- */
  const db = src.find((p) => p.category === 'Switchgear' && /distribution board/i.test(p.name));
  if (db && switchgear) {
    const img = await uploadImage(db.image, 'switchgear-distribution-board');
    const r = await upsertProduct({
      slug: 'switchgears/distribution-board',
      title: 'Distribution Board',
      description: JSON.stringify(db.overview || []),
      features: JSON.stringify(db.benefits || []),
      imageSrc: img && !img.startsWith('DRY://') ? img : undefined,
      categoryId: switchgear.id,
    });
    stats.skus++;
    stats[r.action === 'create' ? 'created' : 'updated']++;
    if (img) stats.images++;
    console.log('\n  Distribution Board  → /switchgears/distribution-board');
  }

  console.log('\n  ────────────────────────────────');
  console.log(`  range pages : ${stats.rangePages}`);
  console.log(`  products    : ${stats.skus}`);
  console.log(`  created     : ${stats.created}`);
  console.log(`  updated     : ${stats.updated}`);
  console.log(`  images      : ${stats.images}`);
  if (stats.shadowsRemoved) console.log(`  stale range products removed: ${stats.shadowsRemoved}`);
  if (unmapped.length) {
    console.log(`\n  ⚠️  ${unmapped.length} product(s) had no recognisable range in their image name and were skipped:`);
    unmapped.slice(0, 10).forEach((n) => console.log(`        ${n}`));
  }
  if (stats.noImage.length) {
    console.log(`\n  ⚠️  ${stats.noImage.length} product(s) had no image file on disk:`);
    stats.noImage.slice(0, 10).forEach((n) => console.log(`        ${n}`));
  }
  if (DRY_RUN) console.log('\n  (dry run — nothing was written)');
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
