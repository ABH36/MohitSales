#!/usr/bin/env node
/**
 * scripts/backfill-product-images.js
 *
 * Copies each product's image out of its legacy HTML into `products.imageSrc`.
 *
 * Why this is needed:
 *   Only 33 of 2173 products carry an imageSrc. The pages still *look* right,
 *   because the renderer digs the image out of the stored legacy HTML on every
 *   request (`legacyImage` in [...slug]/page.tsx) — but anything that reads the
 *   column directly gets nothing. The visible casualty is Open Graph: og:image
 *   was absent on ~2100 product pages, so links shared to WhatsApp / LinkedIn /
 *   Google showed no preview image.
 *
 *   Filling the column also means the renderer stops having to parse HTML with
 *   cheerio just to find an image it could have read from the row.
 *
 * What it does:
 *   For every active product with no imageSrc that still has an active
 *   PageContent at the same slug, take the first image matched by the SAME
 *   selector list the renderer uses. Using the identical selectors is
 *   deliberate: the stored value is then exactly what the page already shows,
 *   so this changes no pixels — it only makes the data explicit.
 *
 *   Almost everything in this catalogue is already on Cloudinary, so absolute
 *   http(s) URLs are taken as-is. A root-relative path is only accepted when the
 *   file is actually still present under public/ — the image migration moved
 *   most of them, and a stale path would render a broken image.
 *
 * Usage:
 *   node scripts/backfill-product-images.js
 *
 * Dry-run (no DB writes — prints exactly what would change):
 *   node scripts/backfill-product-images.js --dry
 *   DRY_RUN=1 node scripts/backfill-product-images.js
 *
 * Safe to re-run: products that already carry an imageSrc are skipped.
 */

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry') || process.argv.includes('--dry-run');

if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes will happen\n');

// Kept in sync with the runtime fallback in src/app/(public)/[...slug]/page.tsx.
const IMAGE_SELECTOR = '.product-img img, .single-product-image img, .wires_inner img, img.img-fluid, .feature-image img';

function extractImage(html) {
  if (!html) return null;
  try {
    const $ = cheerio.load(html, null, false);
    const src = $(IMAGE_SELECTOR).first().attr('src');
    return src ? src.trim() : null;
  } catch {
    return null;
  }
}

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true, imageSrc: true },
  });
  console.log(`Active products: ${products.length}`);

  const pages = await prisma.pageContent.findMany({
    where: { slug: { in: products.map((p) => p.slug) }, isActive: true },
    select: { slug: true, htmlContent: true },
  });
  const htmlBySlug = new Map(pages.map((pc) => [pc.slug, pc.htmlContent]));
  console.log(`Products with a legacy page: ${htmlBySlug.size}\n`);

  const stats = { alreadySet: 0, noPage: 0, noImage: 0, notAbsolute: 0, toUpdate: 0 };
  const updates = [];
  const relatives = new Set();

  for (const p of products) {
    if (p.imageSrc && p.imageSrc.trim()) { stats.alreadySet++; continue; }

    const html = htmlBySlug.get(p.slug);
    if (!html) { stats.noPage++; continue; }

    const src = extractImage(html);
    if (!src) { stats.noImage++; continue; }

    if (!/^https?:\/\//i.test(src)) {
      // Root-relative: keep it only if the file survived the Cloudinary move.
      const clean = decodeURIComponent(src.split('?')[0].split('#')[0]);
      const onDisk = clean.startsWith('/') && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(clean)
        && fs.existsSync(path.join(PUBLIC_DIR, clean.replace(/^\//, '')));
      if (!onDisk) {
        stats.notAbsolute++;
        relatives.add(src);
        continue;
      }
    }

    stats.toUpdate++;
    updates.push({ id: p.id, title: p.title, src });
  }

  console.log('── Analysis ──────────────────────────────');
  console.log(`  already had an image    : ${stats.alreadySet}`);
  console.log(`  no legacy page          : ${stats.noPage}`);
  console.log(`  page had no image       : ${stats.noImage}`);
  console.log(`  non-absolute src (skip) : ${stats.notAbsolute}  (${relatives.size} distinct)`);
  console.log(`  ➜ will be updated       : ${stats.toUpdate}`);
  console.log('──────────────────────────────────────────\n');

  console.log('Sample of what will be set:');
  for (const u of updates.slice(0, 8)) console.log(`  ${u.title}\n      → ${u.src}`);
  if (updates.length > 8) console.log(`  … and ${updates.length - 8} more`);

  if (relatives.size) {
    console.log('\nSkipped — src is not an absolute URL:');
    for (const r of [...relatives].slice(0, 8)) console.log(`  ${r}`);
    if (relatives.size > 8) console.log(`  … and ${relatives.size - 8} more`);
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — nothing was written. Re-run without --dry to apply.');
    return;
  }

  console.log(`\nWriting ${updates.length} image URLs…`);
  let done = 0;
  for (const u of updates) {
    await prisma.product.update({ where: { id: u.id }, data: { imageSrc: u.src } });
    if (++done % 200 === 0) console.log(`  …${done}/${updates.length}`);
  }
  console.log(`✅ Updated ${done} products.`);
  console.log('🎉 Image backfill complete — og:image now resolves on those pages.');
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
