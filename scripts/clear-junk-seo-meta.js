#!/usr/bin/env node
/**
 * scripts/clear-junk-seo-meta.js
 *
 * Removes SEO overrides that were left behind while testing the admin SEO panel.
 *
 * Why this matters:
 *   `seo_meta` rows override a page's own metadata. /about-us carried
 *   title "vashu sir ji" and description "developed by Shishank" — a tester's
 *   name, sitting in the live <title> tag. Every other column on the row was an
 *   empty string, so the row contributed nothing but the junk.
 *
 *   Deleting the row is the fix rather than rewriting it: each page already
 *   declares sensible defaults in its own `generateMetadata`, and with no
 *   override present those apply. /about-us falls back to
 *   "About Us | Mohit Sales Corporation Pvt. Ltd.".
 *
 * Safety:
 *   Only rows whose stored title AND description both match a known junk value
 *   are deleted, so a real SEO override written since can never be clobbered.
 *   Anything else that looks suspicious is reported for a human to judge, never
 *   touched. Running twice is a no-op.
 *
 * IMPORTANT — the change is not visible until the cache clears:
 *   getSeoMetadata() reads SeoMeta through `unstable_cache` with a 1 hour TTL,
 *   tagged `seo-meta`. The admin SEO panel busts that tag when it writes; this
 *   script talks to the database directly, so it cannot. After running, restart
 *   the app (a deploy does this anyway) or wait out the hour — otherwise the old
 *   title keeps being served from cache and it looks like the fix did nothing.
 *
 *   Deleting the row from the admin SEO panel instead avoids this entirely and
 *   is the better route when someone has admin access.
 *
 * Usage:
 *   node scripts/clear-junk-seo-meta.js --dry     # report only
 *   node scripts/clear-junk-seo-meta.js           # apply
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DRY_RUN =
  process.env.DRY_RUN === '1' ||
  process.argv.includes('--dry') ||
  process.argv.includes('--dry-run');

if (DRY_RUN) console.log('⚠️  DRY RUN — no database writes will happen\n');

/**
 * [page, exact title, exact description] — matched exactly so the delete is
 * idempotent and cannot touch a legitimate override added later.
 */
const KNOWN_JUNK = [['/about-us', 'vashu sir ji', 'developed by Shishank']];

/**
 * Heuristics for "someone was testing" — used only to *report*, never to delete.
 * A real title names the company or the page; these patterns do not.
 */
const SUSPICIOUS = [
  /^(test|testing|asdf|qwerty|abc|xyz|demo|sample)\b/i,
  /\b(sir ji|sir|bhai)\b/i,
  /developed by/i,
  /lorem ipsum/i,
];

const looksSuspicious = (v) => !!v && SUSPICIOUS.some((re) => re.test(v));

async function main() {
  const rows = await prisma.seoMeta.findMany({ orderBy: { page: 'asc' } });
  console.log(`Found ${rows.length} seo_meta row(s).\n`);

  let deleted = 0;
  const flagged = [];

  for (const row of rows) {
    const junk = KNOWN_JUNK.find(
      ([page, title, description]) =>
        row.page === page && row.title === title && row.description === description
    );

    if (junk) {
      console.log(`✂️  ${row.page}`);
      console.log(`      title:       ${JSON.stringify(row.title)}`);
      console.log(`      description: ${JSON.stringify(row.description)}`);
      console.log(`      → deleting; the page's own defaults take over`);
      if (!DRY_RUN) {
        await prisma.seoMeta.delete({ where: { id: row.id } });
      }
      deleted++;
      continue;
    }

    if (looksSuspicious(row.title) || looksSuspicious(row.description)) {
      flagged.push(row);
    }
  }

  if (flagged.length) {
    console.log('\n⚠️  These rows look like test data too, but do NOT match the');
    console.log('    known values above, so they were left alone. Check them by hand:');
    for (const row of flagged) {
      console.log(`      ${row.page}  title=${JSON.stringify(row.title)}  description=${JSON.stringify(row.description)}`);
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would delete' : 'Deleted'} ${deleted} junk row(s).` +
      (deleted === 0 ? ' Nothing to do — already clean.' : '')
  );

  if (deleted > 0 && !DRY_RUN) {
    console.log(
      '\n❗ Restart the app before checking the page.\n' +
        '   SEO rows are cached for up to 1 hour (unstable_cache, tag "seo-meta").\n' +
        '   This script writes straight to the database, so it cannot bust that\n' +
        '   cache the way the admin SEO panel does — until the app restarts, the\n' +
        '   old title is still served and it will look like nothing changed.'
    );
  }
}

main()
  .catch((e) => {
    console.error('Failed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
