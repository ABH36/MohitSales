#!/usr/bin/env node
/**
 * scripts/backfill-images-from-archive.js
 *
 * Gives a product photo to catalogue entries that render a placeholder, using
 * the image set in the Real-Switch-Gears product export.
 *
 * These are products that have been live all along — mostly EHV and MV cable
 * ranges — whose pages fall back to the branded placeholder because no photo was
 * ever supplied. The same product is listed under several taxonomy branches, so
 * one photo typically fills several rows.
 *
 * Matching is on the exact product name, normalised for case and punctuation
 * only. Nothing fuzzy: a wrong photo on a cable page is worse than a placeholder,
 * so anything that does not match exactly is reported for a human to look at
 * rather than guessed at. The one known naming variant is listed in ALIASES,
 * checked by hand.
 *
 * Idempotent: rows that already carry an image are skipped, and Cloudinary is
 * asked not to overwrite an asset it already holds.
 *
 * Usage:
 *   node scripts/backfill-images-from-archive.js --dry     # report only
 *   node scripts/backfill-images-from-archive.js           # apply
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

const REPO =
  process.env.POLYCAB_SRC ||
  'C:/Users/FTT/AppData/Local/Temp/claude/d--MS/24e42124-6ffe-4c3b-8e32-bd75b447e8f0/scratchpad/polycab-src';
const DATA = path.join(REPO, 'src/data/catalog/polycab.products.json');
const IMAGES = path.join(REPO, 'public');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Names that differ only in how the rated voltage is written. Each was compared
 * by hand before being added — the archive spells out the maximum in brackets
 * where our catalogue stops at the rating.
 *   ours:    Polycab MV Cu BS 7835 3.8/6.6kV
 *   archive: Polycab MV Cu BS 7835 3.8/6.6(7.2)kV
 */
const ALIASES = {
  // Key is the *normalised* form — norm() strips every non-alphanumeric, so a
  // space here would never match anything.
  polycabmvcubs78353866kv: 'Polycab MV Cu BS 7835 3.8/6.6(7.2)kV',
};

async function main() {
  if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes, no uploads\n');

  if (!fs.existsSync(DATA)) {
    console.error(`Source data not found: ${DATA}`);
    console.error('Point POLYCAB_SRC at a checkout of the Real-Switch-Gears repository.');
    process.exitCode = 1;
    return;
  }

  const src = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const byName = new Map();
  for (const r of src) if (r.image) byName.set(norm(r.name), r);

  const targets = await prisma.product.findMany({
    where: { isActive: true, OR: [{ imageSrc: null }, { imageSrc: '' }] },
    select: { id: true, title: true, slug: true },
  });

  console.log(`  ${targets.length} product row(s) currently show a placeholder.\n`);

  // One upload per distinct photo, reused across every row that shares the name.
  const uploadedFor = new Map();
  const stats = { rows: 0, photos: 0, unmatched: new Map(), missingFile: [] };

  for (const t of targets) {
    const key = norm(t.title);
    let entry = byName.get(key);
    if (!entry && ALIASES[key]) entry = byName.get(norm(ALIASES[key]));

    if (!entry) {
      stats.unmatched.set(t.title, (stats.unmatched.get(t.title) || 0) + 1);
      continue;
    }

    let url = uploadedFor.get(key);
    if (!url) {
      const abs = path.join(IMAGES, entry.image.replace(/^\//, ''));
      if (!fs.existsSync(abs)) {
        stats.missingFile.push(t.title);
        continue;
      }
      if (DRY_RUN) {
        url = `DRY://${slugify(entry.name)}`;
      } else {
        const res = await cloudinary.uploader.upload(abs, {
          folder: 'mohit/catalog',
          public_id: slugify(entry.name),
          overwrite: false,
          resource_type: 'image',
        });
        url = res.secure_url;
      }
      uploadedFor.set(key, url);
      stats.photos++;
      console.log(`  + ${t.title}`);
    }

    if (!DRY_RUN) {
      await prisma.product.update({ where: { id: t.id }, data: { imageSrc: url } });
    }
    stats.rows++;
  }

  console.log('\n  ────────────────────────────────');
  console.log(`  photos used   : ${stats.photos}`);
  console.log(`  rows filled   : ${stats.rows}`);
  console.log(`  still blank   : ${targets.length - stats.rows}`);

  if (stats.missingFile.length) {
    console.log(`\n  ⚠️  ${stats.missingFile.length} matched a record whose image file is absent:`);
    stats.missingFile.slice(0, 10).forEach((t) => console.log(`        ${t}`));
  }

  const unmatched = [...stats.unmatched.entries()].sort((a, b) => b[1] - a[1]);
  if (unmatched.length) {
    console.log(`\n  ${unmatched.length} product name(s) had no exact match in the archive`);
    console.log('  (left on the placeholder rather than guessed at):');
    unmatched.slice(0, 12).forEach(([t, n]) => console.log(`        ${t.slice(0, 58)}${n > 1 ? `  ×${n}` : ''}`));
    if (unmatched.length > 12) console.log(`        … and ${unmatched.length - 12} more`);
  }

  if (DRY_RUN) console.log('\n  (dry run — nothing was written)');
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
