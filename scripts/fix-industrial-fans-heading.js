#!/usr/bin/env node
/**
 * scripts/fix-industrial-fans-heading.js
 *
 * Corrects the Industrial Fans pages, which were seeded with "Domestic Fans"
 * throughout — the `heading` column, an in-body section title, and the enquiry
 * link's `?product=` value. The banner already read "Domestic Fans" on a page
 * whose URL and breadcrumb say Industrial Fans, and the enquiry button would
 * reach sales labelled as the wrong product.
 *
 * Scope is exactly the two Industrial Fans slugs (the page exists under both the
 * canonical and the /polycab prefix). The Domestic Fans pages, which correctly
 * say "Domestic Fans", are never touched.
 *
 * Idempotent: matches on the wrong value, so a second run finds nothing to do.
 *
 * Usage:
 *   node scripts/fix-industrial-fans-heading.js --dry     # report only
 *   node scripts/fix-industrial-fans-heading.js           # apply
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DRY_RUN =
  process.env.DRY_RUN === '1' ||
  process.argv.includes('--dry') ||
  process.argv.includes('--dry-run');

const SLUGS = [
  'fans/exhaust-fans/industrial-fans',
  'polycab/fans/exhaust-fans/industrial-fans',
];

// [wrong, right] — plain label, the space-encoded label used in the enquiry
// link, and the heading column all move from Domestic to Industrial.
const HTML_REPLACEMENTS = [
  ['Domestic Fans', 'Industrial Fans'],
  ['Domestic%20Fans', 'Industrial%20Fans'],
];

async function main() {
  if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes\n');

  let fixed = 0;
  for (const slug of SLUGS) {
    const row = await prisma.pageContent.findFirst({
      where: { slug },
      select: { id: true, heading: true, htmlContent: true },
    });
    if (!row) {
      console.log(`  – ${slug}: no row`);
      continue;
    }

    const newHeading = row.heading === 'Domestic Fans' ? 'Industrial Fans' : row.heading;
    let newHtml = row.htmlContent || '';
    let htmlChanges = 0;
    for (const [from, to] of HTML_REPLACEMENTS) {
      const before = newHtml;
      newHtml = newHtml.split(from).join(to);
      htmlChanges += (before.length - newHtml.length === 0)
        ? 0
        : (before.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    }

    const headingChanged = newHeading !== row.heading;
    if (!headingChanged && htmlChanges === 0) {
      console.log(`  ✓ ${slug}: already correct`);
      continue;
    }

    console.log(`  ✂️  ${slug}`);
    if (headingChanged) console.log(`        heading: "${row.heading}" → "${newHeading}"`);
    if (htmlChanges) console.log(`        html: ${htmlChanges} "Domestic Fans" reference(s) → "Industrial Fans"`);

    if (!DRY_RUN) {
      await prisma.pageContent.update({
        where: { id: row.id },
        data: { heading: newHeading, htmlContent: newHtml },
      });
    }
    fixed++;
  }

  console.log(`\n  ${DRY_RUN ? 'Would fix' : 'Fixed'} ${fixed} page(s).` + (fixed === 0 ? ' Nothing to do — already clean.' : ''));
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
