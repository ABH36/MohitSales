// Recover + re-Cloudinary the local images whose filenames contain spaces/parens
// (the migration + finalize regexes excluded those chars, so these were missed
// and then deleted). Recovers each from git history, uploads to Cloudinary, and
// rewrites the DB refs.
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const ROOT = 'd:/MS/MohitSales_Node';
for (const l of fs.readFileSync(ROOT + '/.env', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)="?(.*?)"?$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { v2: cloudinary } = require(ROOT + '/node_modules/cloudinary');
const { PrismaClient } = require(ROOT + '/node_modules/@prisma/client');
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const prisma = new PrismaClient();

const DELETION_COMMIT = 'd1b9752'; // migration/cleanup commit that removed the local images
const CDN = 'https://res.cloudinary.com/' + (process.env.CLOUDINARY_CLOUD_NAME || 'da2dmtm9b') + '/image/upload/f_auto,q_auto/';
const IMG_RE = /\/assets\/images\/[^"']*?\.(webp|png|jpe?g|svg|gif)/gi;

// public_id: strip /assets/images/ + ext, and sanitise spaces/parens for a clean id
const publicIdFor = (ref) => 'mohit/' + ref.replace(/^\/assets\/images\//i, '').replace(/\.[a-z0-9]+$/i, '')
  .replace(/[()]/g, '').replace(/\s+/g, '-');

async function main() {
  // collect distinct refs from DB
  const rows = await prisma.pageContent.findMany({ where: { htmlContent: { contains: '/assets/images/' } }, select: { id: true, htmlContent: true } });
  const refs = new Set();
  rows.forEach((r) => (r.htmlContent.match(IMG_RE) || []).forEach((m) => refs.add(m)));
  console.log('distinct local image refs still in DB:', refs.size);

  const map = {};
  for (const ref of refs) {
    const gitPath = 'public' + ref; // /assets/... -> public/assets/...
    const tmp = path.join(ROOT, '_recover_tmp' + path.extname(ref));
    try {
      // recover binary from git history (parent of the deletion commit)
      const buf = cp.execSync(`git show "${DELETION_COMMIT}~1:${gitPath}"`, { cwd: ROOT, maxBuffer: 50 * 1024 * 1024 });
      fs.writeFileSync(tmp, buf);
      const pubId = publicIdFor(ref);
      const res = await cloudinary.uploader.upload(tmp, { public_id: pubId, overwrite: true });
      map[ref] = CDN + pubId + path.extname(ref);
      console.log('  ✓', ref, '->', pubId);
    } catch (e) {
      console.log('  ✗ FAILED', ref, '|', (e.message || '').slice(0, 80));
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  }

  // rewrite DB refs
  let fixedRows = 0, fixedRefs = 0;
  for (const r of rows) {
    let h = r.htmlContent, changed = false;
    for (const [ref, url] of Object.entries(map)) {
      if (h.includes(ref)) { const n = h.split(ref).length - 1; h = h.split(ref).join(url); fixedRefs += n; changed = true; }
    }
    if (changed) { await prisma.pageContent.update({ where: { id: r.id }, data: { htmlContent: h } }); fixedRows++; }
  }
  console.log(`\nDB rewrite: ${fixedRefs} refs across ${fixedRows} pages`);
  const remain = await prisma.pageContent.count({ where: { htmlContent: { contains: '/assets/images/' } } });
  console.log('remaining /assets/images/ in DB:', remain);
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
