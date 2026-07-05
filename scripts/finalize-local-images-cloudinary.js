/**
 * Finalize local-image → Cloudinary migration.
 * =============================================================================
 * Converts every remaining LOCAL image reference (`/assets/images/<path>.<ext>`,
 * images only — PDFs are never touched) to its deterministic Cloudinary delivery
 * URL: https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/mohit/<path>.<ext>
 *
 * This matches the public_id convention used by migrate-media-cloudinary.js
 * (mohit/<path-without-assets-images-prefix>). Handles refs whose local file no
 * longer exists on disk but whose asset was already uploaded to Cloudinary; refs
 * with no Cloudinary asset simply keep 404'ing exactly as they already did
 * locally (no regression).
 *
 * Scans/rewrites: DB (pageContent.htmlContent, cmsSection.content, setting.value,
 * product.imageSrc/description/features, category.image, blogPost.coverImage/content).
 * Code files are handled separately (few, edited directly).
 *
 * Idempotent. Dry-run by default; pass --commit to apply.
 *   node scripts/finalize-local-images-cloudinary.js            (dry-run)
 *   node scripts/finalize-local-images-cloudinary.js --commit
 */
const fs = require('fs');
const path = require('path');
for (const l of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)="?(.*?)"?$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const COMMIT = process.argv.includes('--commit');
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'da2dmtm9b';

// image refs only (not .pdf); optional ?query is dropped
const IMG_RE = /\/assets\/images\/[^\s"')(<>]+?\.(?:jpg|jpeg|png|webp|gif|svg)(\?[^\s"')(<>]*)?/gi;
const toCloud = (m) => {
  const clean = m.split('?')[0];
  const sub = clean.replace(/^\/assets\/images\//i, '');
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto/mohit/${sub}`;
};
const rewrite = (text) => {
  if (!text) return { out: text, n: 0 };
  let n = 0;
  const out = String(text).replace(IMG_RE, (m) => { n++; return toCloud(m); });
  return { out, n };
};

async function main() {
  console.log(`\n☁️  Finalize local images → Cloudinary  [${COMMIT ? 'COMMIT' : 'DRY-RUN'}]\n`);
  let total = 0;

  // page_contents
  let pcRows = 0, pcRefs = 0, skip = 0;
  while (true) {
    const rows = await prisma.pageContent.findMany({ select: { id: true, htmlContent: true }, skip, take: 300, orderBy: { id: 'asc' } });
    if (!rows.length) break;
    for (const r of rows) { const { out, n } = rewrite(r.htmlContent); if (n > 0) { pcRefs += n; pcRows++; if (COMMIT) await prisma.pageContent.update({ where: { id: r.id }, data: { htmlContent: out } }); } }
    skip += 300;
  }
  console.log(`page_contents : ${pcRefs} refs in ${pcRows} pages`); total += pcRefs;

  // cms
  let cms = 0;
  for (const c of await prisma.cmsSection.findMany({ select: { id: true, content: true } })) {
    const { out, n } = rewrite(c.content); if (n > 0) { cms += n; if (COMMIT) await prisma.cmsSection.update({ where: { id: c.id }, data: { content: out } }); }
  }
  console.log(`cms sections  : ${cms} refs`); total += cms;

  // settings
  let setg = 0;
  for (const s of await prisma.setting.findMany({ select: { id: true, value: true } })) {
    const { out, n } = rewrite(s.value); if (n > 0) { setg += n; if (COMMIT) await prisma.setting.update({ where: { id: s.id }, data: { value: out } }); }
  }
  console.log(`settings      : ${setg} refs`); total += setg;

  // product scalar + json-ish text
  let prod = 0;
  for (const p of await prisma.product.findMany({ select: { id: true, imageSrc: true, description: true, features: true } })) {
    const a = rewrite(p.imageSrc), b = rewrite(p.description), c = rewrite(p.features);
    const n = a.n + b.n + c.n;
    if (n > 0) { prod += n; if (COMMIT) await prisma.product.update({ where: { id: p.id }, data: { imageSrc: a.out, description: b.out, features: c.out } }); }
  }
  console.log(`products      : ${prod} refs`); total += prod;

  // category.image
  let cat = 0;
  for (const c of await prisma.category.findMany({ select: { id: true, image: true } })) {
    const { out, n } = rewrite(c.image); if (n > 0) { cat += n; if (COMMIT) await prisma.category.update({ where: { id: c.id }, data: { image: out } }); }
  }
  console.log(`categories    : ${cat} refs`); total += cat;

  // blog
  let blog = 0;
  for (const b of await prisma.blogPost.findMany({ select: { id: true, coverImage: true, content: true } })) {
    const a = rewrite(b.coverImage), d = rewrite(b.content);
    const n = a.n + d.n;
    if (n > 0) { blog += n; if (COMMIT) await prisma.blogPost.update({ where: { id: b.id }, data: { coverImage: a.out, content: d.out } }); }
  }
  console.log(`blog posts    : ${blog} refs`); total += blog;

  console.log(`\n${COMMIT ? '✅ applied' : '✋ DRY-RUN'} — total ${total} local image refs -> Cloudinary\n`);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
