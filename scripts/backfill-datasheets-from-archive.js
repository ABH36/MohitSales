#!/usr/bin/env node
/**
 * scripts/backfill-datasheets-from-archive.js
 *
 * Gives a "Download Datasheet" link to products that lack one, using the
 * manufacturer-hosted datasheet URLs in the Real-Switch-Gears product export.
 *
 * The export's `catalogue` field holds Polycab's own datasheet PDFs —
 * `https://cms.polycab.com/media/…_ds_01.pdf`. As an authorised Polycab
 * distributor, linking a product to its official Polycab datasheet is the
 * correct source: always current and hosted by the manufacturer. The link is
 * stored as-is; nothing is downloaded or re-hosted.
 *
 * Matching is on the exact product name, normalised for case and punctuation
 * only — nothing fuzzy, because a wrong datasheet is worse than none. A product
 * that already has a datasheetLink is never overwritten, and unmatched names are
 * reported rather than guessed at.
 *
 * The URLs are verified live before use: Polycab's CMS answers HEAD with
 * text/html but a GET returns a real `application/pdf`, so each distinct URL is
 * GET-checked once (first bytes must be %PDF) and cached.
 *
 * Idempotent: a second run finds nothing left to fill.
 *
 * Usage:
 *   node scripts/backfill-datasheets-from-archive.js --dry     # report only
 *   node scripts/backfill-datasheets-from-archive.js           # apply
 *   node scripts/backfill-datasheets-from-archive.js --no-verify   # skip the live PDF check
 */

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DRY_RUN =
  process.env.DRY_RUN === '1' ||
  process.argv.includes('--dry') ||
  process.argv.includes('--dry-run');
const NO_VERIFY = process.argv.includes('--no-verify');

const REPO = process.env.POLYCAB_SRC || 'd:/MS/polycab-src';
const DATA = path.join(REPO, 'src/data/catalog/polycab.products.json');

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

/** GET the first bytes and confirm a real PDF. Result cached per URL. */
const verified = new Map();
async function isLivePdf(url) {
  if (NO_VERIFY) return true;
  if (verified.has(url)) return verified.get(url);
  let ok = false;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      ok = buf.slice(0, 5).toString('latin1') === '%PDF-';
    }
  } catch {
    ok = false;
  }
  verified.set(url, ok);
  return ok;
}

async function main() {
  if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes\n');

  if (!fs.existsSync(DATA)) {
    console.error(`Source data not found: ${DATA}`);
    console.error('Point POLYCAB_SRC at a checkout of the Real-Switch-Gears repository.');
    process.exitCode = 1;
    return;
  }

  const src = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const byName = new Map();
  for (const r of src) if (r.catalogue) byName.set(norm(r.name), r.catalogue);
  console.log(`  ${byName.size} datasheet URL(s) in the archive.`);

  const targets = await prisma.product.findMany({
    where: { isActive: true, OR: [{ datasheetLink: null }, { datasheetLink: '' }] },
    select: { id: true, title: true },
  });
  console.log(`  ${targets.length} product row(s) have no datasheet link.\n`);

  const stats = { filled: 0, urls: new Set(), unmatched: 0, dead: new Set() };

  for (const t of targets) {
    const url = byName.get(norm(t.title));
    if (!url) { stats.unmatched++; continue; }

    if (!(await isLivePdf(url))) {
      stats.dead.add(url);
      continue;
    }

    if (!stats.urls.has(url)) {
      stats.urls.add(url);
      console.log(`  + ${t.title}`);
    }
    if (!DRY_RUN) {
      await prisma.product.update({ where: { id: t.id }, data: { datasheetLink: url } });
    }
    stats.filled++;
  }

  console.log('\n  ────────────────────────────────');
  console.log(`  rows given a datasheet : ${stats.filled}`);
  console.log(`  distinct datasheets    : ${stats.urls.size}`);
  if (stats.dead.size) {
    console.log(`\n  ⚠️  ${stats.dead.size} matched URL(s) did not return a PDF and were skipped:`);
    [...stats.dead].slice(0, 8).forEach((u) => console.log(`        ${u}`));
  }
  console.log(`\n  ${stats.unmatched} product(s) had no exact match in the archive (left as-is).`);
  if (DRY_RUN) console.log('\n  (dry run — nothing was written)');
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
