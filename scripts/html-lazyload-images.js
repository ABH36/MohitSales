/**
 * Phase A1 (step 1) — add native lazy-loading to every <img> inside stored HTML.
 * =============================================================================
 * Adds `loading="lazy" decoding="async"` to <img> tags in page_contents.htmlContent
 * and cmsSection.content that don't already declare `loading=`. This defers the
 * thousands of below-the-fold content images (industries/product pages carry many),
 * a large perceived-perf win, with no layout/behaviour change.
 *
 * Idempotent (skips imgs that already have loading=). Dry-run by default.
 *   node scripts/html-lazyload-images.js            (dry-run)
 *   node scripts/html-lazyload-images.js --commit    (apply)
 */
const fs = require('fs');
const path = require('path');
for (const l of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)="?(.*?)"?$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const COMMIT = process.argv.includes('--commit');

// Match "<img" that is NOT already followed (before the closing >) by loading=
const IMG_RE = /<img(?![^>]*\bloading\s*=)/gi;
const addLazy = (html) => {
  if (!html) return { out: html, n: 0 };
  let n = 0;
  const out = html.replace(IMG_RE, () => { n++; return '<img loading="lazy" decoding="async"'; });
  return { out, n };
};

async function main() {
  console.log(`\n🖼️  Lazy-load blob images  [${COMMIT ? 'COMMIT' : 'DRY-RUN'}]\n`);

  let pageRows = 0, pageImgs = 0, skip = 0;
  while (true) {
    const rows = await prisma.pageContent.findMany({ select: { id: true, htmlContent: true }, skip, take: 300, orderBy: { id: 'asc' } });
    if (!rows.length) break;
    for (const r of rows) {
      const { out, n } = addLazy(r.htmlContent);
      if (n > 0) { pageImgs += n; pageRows++; if (COMMIT) await prisma.pageContent.update({ where: { id: r.id }, data: { htmlContent: out } }); }
    }
    skip += 300;
  }

  let cmsImgs = 0;
  for (const c of await prisma.cmsSection.findMany({ select: { id: true, content: true } })) {
    const { out, n } = addLazy(c.content);
    if (n > 0) { cmsImgs += n; if (COMMIT) await prisma.cmsSection.update({ where: { id: c.id }, data: { content: out } }); }
  }

  console.log(`page_contents: ${pageImgs} <img> lazified across ${pageRows} pages`);
  console.log(`cms sections : ${cmsImgs} <img> lazified`);
  console.log(COMMIT ? '\n✅ applied.\n' : '\n✋ DRY-RUN — re-run with --commit.\n');
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
