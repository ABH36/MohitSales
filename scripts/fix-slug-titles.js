#!/usr/bin/env node
/**
 * scripts/fix-slug-titles.js
 *
 * Repairs the handful of products whose `title` is the URL slug instead of a
 * product name — e.g. "polycab-mv-sc-al-epr-iceanema-15kva".
 *
 * Why this matters now:
 *   These rows were always wrong, but nothing surfaced the title, so they went
 *   unnoticed. Product page metadata now falls back to `products.title` (it used
 *   to derive the title from the slug for everyone), which means these seven
 *   would publish a raw slug as the page <title> and og:title.
 *
 *   Four of them are duplicate listings of products that appear under other
 *   taxonomy branches with the correct name, so the correct titles are taken
 *   from those twins. The remaining three are the Polycab cable hub pages.
 *
 * Usage:
 *   node scripts/fix-slug-titles.js
 *   node scripts/fix-slug-titles.js --dry
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry') || process.argv.includes('--dry-run');

if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes will happen\n');

// [slug, wrong title currently stored, correct title]. Matching the existing
// value exactly keeps this idempotent and means it can never clobber a title
// someone has since corrected by hand in the admin.
const FIXES = [
  // Titles that are the raw URL slug.
  ['polycab/cables-by-application', 'cables-by-application', 'Cables By Application'],
  ['polycab/cables-by-standards', 'cables-by-standards', 'Cables By Standards'],
  ['polycab/cables-by-type', 'cables-by-type', 'Cables By Type'],
  ['industries/cables-by-application/utility/polycab-mv-is-7098-ii-3c-2xwy2xfy-19-33kve', 'polycab-mv-is-7098-ii-3c-2xwy2xfy-19-33kve', 'Polycab MV IS 7098-II 3C 2XWY/2XFY 19/33kV(E)'],
  ['industries/cables-by-application/utility/polycab-mv-is-7098-ii-3c-2xwy-2xfy-3.8-6.6kv-e', 'polycab-mv-is-7098-ii-3c-2xwy-2xfy-3.8-6.6kv-e', 'Polycab MV IS 7098-II 3C 2XWY/2XFY 3.8/6.6kV(E)'],
  ['industries/cables-by-application/utility/polycab-mv-is-7098-ii-3c-a2xwy2xfy-19-33kve', 'polycab-mv-is-7098-ii-3c-a2xwy2xfy-19-33kve', 'Polycab MV IS 7098-II 3C A2XWY/A2XFY 19/33kV(E)'],
  ['industries/cables-by-application/utility/polycab-mv-sc-al-epr-iceanema-15kva', 'polycab-mv-sc-al-epr-iceanema-15kva', 'Polycab MV SC AL EPR ICEA/NEMA 15kV'],

  // Titles that are the parent section's name rather than the product's. These
  // reach sales as the enquiry subject, so "Solar" tells them nothing.
  ['conduit-accessories/upvc-conduit', 'Conduit & Accessories', 'UPVC Conduit'],
  ['solar/solar-grid-tie-inverter', 'Solar', 'Solar Grid Tie Inverter'],
];

async function main() {
  let fixed = 0, alreadyOk = 0, notFound = 0;

  for (const [slug, wrongTitle, title] of FIXES) {
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true, title: true } });
    if (!p) { console.log(`  – not found: ${slug}`); notFound++; continue; }
    if (p.title !== wrongTitle) { alreadyOk++; continue; }

    console.log(`  ${p.title}\n      → ${title}`);
    if (!DRY_RUN) await prisma.product.update({ where: { id: p.id }, data: { title } });
    fixed++;
  }

  const remaining = await prisma.product.count({ where: { isActive: true, title: { not: { contains: ' ' } } } });

  console.log('\n── Result ────────────────────────────────');
  console.log(`  ${DRY_RUN ? 'would fix' : 'fixed'}      : ${fixed}`);
  console.log(`  already correct : ${alreadyOk}`);
  if (notFound) console.log(`  slug not found  : ${notFound}`);
  console.log(`  active products with a space-less title (sanity check): ${remaining}`);
  console.log('──────────────────────────────────────────');

  if (DRY_RUN) console.log('\n⚠️  DRY RUN — nothing was written. Re-run without --dry to apply.');
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
