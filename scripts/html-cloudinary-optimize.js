/**
 * Phase D (step 2) — inject Cloudinary delivery transforms into stored HTML.
 * =============================================================================
 * Rewrites every Cloudinary upload URL inside page_contents.htmlContent and
 * cmsSection.content from
 *     res.cloudinary.com/<cloud>/image/upload/v123/mohit/foo.png
 * to
 *     res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/v123/mohit/foo.png
 * so the CDN serves AVIF/WebP at an auto-tuned quality (typically 40-70% fewer
 * bytes) with no visual change. Matches the src/lib/cloudinary.ts cld() helper
 * used for the React-rendered images, so content and component images optimize
 * consistently.
 *
 * Idempotent — only matches URLs whose next segment is still a bare version
 * (`/upload/v<digits>`), so re-running skips already-transformed URLs.
 * Dry-run by default.
 *   node scripts/html-cloudinary-optimize.js            (dry-run — counts only)
 *   node scripts/html-cloudinary-optimize.js --commit   (apply)
 */
const fs = require('fs');
const path = require('path');
for (const l of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)="?(.*?)"?$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const COMMIT = process.argv.includes('--commit');

// res.cloudinary.com/<cloud>/image/upload/  immediately followed by a bare version (v123…)
const CLD_RE = /(res\.cloudinary\.com\/[^/"'\s]+\/image\/upload\/)(v\d)/gi;
const optimize = (html) => {
  if (!html) return { out: html, n: 0 };
  let n = 0;
  const out = html.replace(CLD_RE, (_m, prefix, ver) => { n++; return `${prefix}f_auto,q_auto/${ver}`; });
  return { out, n };
};

async function main() {
  console.log(`\n🖼️  Cloudinary optimize blob images  [${COMMIT ? 'COMMIT' : 'DRY-RUN'}]\n`);

  let pageRows = 0, pageUrls = 0, skip = 0;
  while (true) {
    const rows = await prisma.pageContent.findMany({ select: { id: true, htmlContent: true }, skip, take: 300, orderBy: { id: 'asc' } });
    if (!rows.length) break;
    for (const r of rows) {
      const { out, n } = optimize(r.htmlContent);
      if (n > 0) { pageUrls += n; pageRows++; if (COMMIT) await prisma.pageContent.update({ where: { id: r.id }, data: { htmlContent: out } }); }
    }
    skip += 300;
  }

  let cmsUrls = 0;
  for (const c of await prisma.cmsSection.findMany({ select: { id: true, content: true } })) {
    const { out, n } = optimize(c.content);
    if (n > 0) { cmsUrls += n; if (COMMIT) await prisma.cmsSection.update({ where: { id: c.id }, data: { content: out } }); }
  }

  console.log(`page_contents: ${pageUrls} Cloudinary URLs optimized across ${pageRows} pages`);
  console.log(`cms sections : ${cmsUrls} Cloudinary URLs optimized`);
  console.log(COMMIT ? '\n✅ applied.\n' : '\n✋ DRY-RUN — re-run with --commit.\n');
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
