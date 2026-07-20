#!/usr/bin/env node
/**
 * scripts/backfill-datasheet-links.js
 *
 * Restores the "Download Datasheet" button on product detail pages.
 *
 * Why this is needed:
 *   The legacy site rendered products straight from PHP/HTML, and that HTML
 *   carried the datasheet button inline:
 *       <a class="rs-btn ..." href="/assets/.../thing.pdf">Download Datasheet</a>
 *   When products were seeded into the database that href was never copied into
 *   `products.datasheetLink` — only 2 of 2173 rows have it. Product pages now
 *   render from the React template, where the button is gated behind
 *   `{dbProduct.datasheetLink && ...}`, so it silently disappeared for everyone.
 *   The PDFs themselves migrated fine and still serve from public/assets.
 *
 * What it does:
 *   For every active product that still has an active PageContent at the same
 *   slug, pull the first .pdf href out of that stored HTML and write it to
 *   `products.datasheetLink`.
 *
 *   A link is only written when the PDF actually exists under public/ — some
 *   legacy pages point at files that were never migrated, and setting those
 *   would hand users a download button that 404s.
 *
 *   Products that already have a datasheetLink are left untouched.
 *
 * Usage:
 *   node scripts/backfill-datasheet-links.js
 *
 * Dry-run (no DB writes — prints exactly what would change). Either form works;
 * the flag exists because the `DRY_RUN=1 …` prefix is not valid on Windows cmd:
 *   node scripts/backfill-datasheet-links.js --dry
 *   DRY_RUN=1 node scripts/backfill-datasheet-links.js
 *
 * Safe to re-run: products that already carry a datasheetLink are skipped, so a
 * second run reports 0 to update rather than rewriting anything.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry') || process.argv.includes('--dry-run');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes will happen\n');

// First .pdf href in the stored markup. The legacy pages only ever carry one
// datasheet button, so first-match is the datasheet.
const PDF_HREF = /href=["']([^"']*\.pdf[^"']*)["']/i;

function extractPdfHref(html) {
  if (!html) return null;
  const m = html.match(PDF_HREF);
  return m ? m[1].trim() : null;
}

// Index every PDF under public/ by filename, so a link whose folder is wrong
// can still be resolved. A handful of legacy hrefs point at the wrong category
// folder (e.g. "cement--industry" with a doubled dash, or a datasheet that was
// filed under a different application) even though the file itself migrated.
// Only unambiguous matches are used — a filename present in two folders is
// skipped rather than guessed at.
function buildPdfIndex(dir, index = new Map(), ambiguous = new Set()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) buildPdfIndex(full, index, ambiguous);
    else if (entry.name.toLowerCase().endsWith('.pdf')) {
      const key = entry.name.toLowerCase();
      const rel = '/' + path.relative(PUBLIC_DIR, full).split(path.sep).join('/');
      if (index.has(key) && index.get(key) !== rel) ambiguous.add(key);
      else index.set(key, rel);
    }
  }
  return { index, ambiguous };
}

const { index: PDF_BY_NAME, ambiguous: AMBIGUOUS_PDFS } = buildPdfIndex(PUBLIC_DIR);

// Links are stored root-relative ("/assets/..."); map that onto public/.
// Returns the usable path (possibly relocated), or null if the file is gone.
// Anything absolute (http…) can't be verified locally, so it is left alone.
function resolvePdf(href) {
  if (!href || /^https?:\/\//i.test(href)) return null;
  const clean = decodeURIComponent(href.split('?')[0].split('#')[0]);
  if (fs.existsSync(path.join(PUBLIC_DIR, clean.replace(/^\//, '')))) return clean;

  const base = path.basename(clean).toLowerCase();
  if (AMBIGUOUS_PDFS.has(base)) return null;
  return PDF_BY_NAME.get(base) || null;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, title: true, datasheetLink: true },
  });
  console.log(`Active products: ${products.length}`);

  const slugs = products.map((p) => p.slug);
  const pages = await prisma.pageContent.findMany({
    where: { slug: { in: slugs }, isActive: true },
    select: { slug: true, htmlContent: true },
  });
  const htmlBySlug = new Map(pages.map((pc) => [pc.slug, pc.htmlContent]));
  console.log(`Products with a legacy page: ${htmlBySlug.size}\n`);

  const stats = { alreadySet: 0, noPage: 0, noPdf: 0, missingFile: 0, relocated: 0, toUpdate: 0 };
  const updates = [];
  const missingFiles = new Set();

  for (const p of products) {
    if (p.datasheetLink && p.datasheetLink.trim()) { stats.alreadySet++; continue; }

    const html = htmlBySlug.get(p.slug);
    if (!html) { stats.noPage++; continue; }

    const href = extractPdfHref(html);
    if (!href) { stats.noPdf++; continue; }

    const resolved = resolvePdf(href);
    if (!resolved) {
      stats.missingFile++;
      missingFiles.add(href);
      continue;
    }
    if (resolved !== href) stats.relocated++;

    stats.toUpdate++;
    updates.push({ id: p.id, title: p.title, href: resolved, from: href });
  }

  console.log('── Analysis ──────────────────────────────');
  console.log(`  already had a link      : ${stats.alreadySet}`);
  console.log(`  no legacy page          : ${stats.noPage}`);
  console.log(`  page had no PDF         : ${stats.noPdf}`);
  console.log(`  PDF file missing (skip) : ${stats.missingFile}  (${missingFiles.size} distinct files)`);
  console.log(`  of which path corrected : ${stats.relocated}  (link pointed at the wrong folder)`);
  console.log(`  ➜ will be updated       : ${stats.toUpdate}`);
  console.log('──────────────────────────────────────────\n');

  console.log('Sample of what will be set:');
  for (const u of updates.slice(0, 10)) console.log(`  ${u.title}\n      → ${u.href}`);
  if (updates.length > 10) console.log(`  … and ${updates.length - 10} more`);

  if (missingFiles.size) {
    console.log('\nSkipped — PDF referenced but not present under public/:');
    for (const f of [...missingFiles].slice(0, 10)) console.log(`  ${f}`);
    if (missingFiles.size > 10) console.log(`  … and ${missingFiles.size - 10} more`);
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN — nothing was written. Re-run without DRY_RUN=1 to apply.');
    return;
  }

  console.log(`\nWriting ${updates.length} datasheet links…`);
  let done = 0;
  for (const u of updates) {
    await prisma.product.update({ where: { id: u.id }, data: { datasheetLink: u.href } });
    if (++done % 200 === 0) console.log(`  …${done}/${updates.length}`);
  }
  console.log(`✅ Updated ${done} products.`);
  console.log('🎉 Datasheet backfill complete — the Download button is back on those pages.');
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
