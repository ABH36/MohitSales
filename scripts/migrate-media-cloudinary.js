/**
 * Phase 4 (Option B) — Media → Cloudinary migration (IMAGES ONLY; PDFs stay local).
 * ================================================================================
 * Modes:
 *   (default)   DRY-RUN — scan every source, report what would upload/rewrite. No changes.
 *   --upload    Upload each referenced local image to Cloudinary (deterministic
 *               public_id, overwrite) and write the localPath→cloudUrl map to
 *               .cloudinary-map.json.
 *   --rewrite   Using .cloudinary-map.json, replace image references in code files
 *               and DB fields (product/category/blog/cms/setting + all page_contents).
 *
 * Sources scanned/rewritten: src/**.{ts,tsx,js,jsx,css}; DB scalar fields
 * (product.imageSrc, category.image, blogPost.coverImage); DB text/HTML fields
 * (pageContent.htmlContent, cmsSection.content, setting.value, blogPost.content,
 *  product.description, product.features).
 *
 * Idempotent: deterministic public_ids; already-cloudinary refs are never touched;
 * PDFs and unknown paths are never touched.
 */
const fs = require('fs');
const path = require('path');
for (const l of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z0-9_]+)="?(.*?)"?$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const prisma = new PrismaClient();
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

const ROOT = process.cwd();
const MODE = process.argv.includes('--upload') ? 'upload' : process.argv.includes('--rewrite') ? 'rewrite' : 'dry';
const MAP_FILE = path.join(ROOT, '.cloudinary-map.json');
const IMG_RE = /\/assets\/images\/[^\s"')(<>]+?\.(?:jpg|jpeg|png|webp|gif|svg)/gi; // images only, not PDF
const CODE_EXT = /\.(tsx?|jsx?|css)$/i;
const publicIdFor = (p) => 'mohit/' + p.replace(/^\/assets\/images\//i, '').replace(/\.[a-z0-9]+$/i, '');

function walk(dir, acc = []) { if (!fs.existsSync(dir)) return acc; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const fp = path.join(dir, e.name); if (e.isDirectory()) walk(fp, acc); else acc.push(fp); } return acc; }

async function collectReferencedImages() {
  const refs = new Set();
  const add = (t) => { if (!t) return; for (const u of String(t).match(IMG_RE) || []) refs.add(u.split('?')[0]); };
  for (const f of walk(path.join(ROOT, 'src')).filter((f) => CODE_EXT.test(f))) add(fs.readFileSync(f, 'utf8'));
  const [prods, cats, blogs, cms, settings] = await Promise.all([
    prisma.product.findMany({ select: { imageSrc: true, description: true, features: true } }),
    prisma.category.findMany({ select: { image: true } }),
    prisma.blogPost.findMany({ select: { coverImage: true, content: true } }),
    prisma.cmsSection.findMany({ select: { content: true } }),
    prisma.setting.findMany({ select: { value: true } }),
  ]);
  prods.forEach((p) => { add(p.imageSrc); add(p.description); add(p.features); });
  cats.forEach((c) => add(c.image)); blogs.forEach((b) => { add(b.coverImage); add(b.content); });
  cms.forEach((c) => add(c.content)); settings.forEach((s) => add(s.value));
  let skip = 0; while (true) { const rows = await prisma.pageContent.findMany({ select: { htmlContent: true }, skip, take: 500, orderBy: { id: 'asc' } }); if (!rows.length) break; for (const r of rows) add(r.htmlContent); skip += 500; }
  // keep only those that exist on disk
  const onDisk = [...refs].filter((u) => fs.existsSync(path.join(ROOT, 'public', decodeURIComponent(u))));
  return { all: [...refs], onDisk };
}

async function main() {
  console.log(`\n☁️  Media → Cloudinary  [${MODE.toUpperCase()}]\n`);

  if (MODE === 'dry' || MODE === 'upload') {
    const { all, onDisk } = await collectReferencedImages();
    const missing = all.length - onDisk.length;
    let bytes = 0; for (const u of onDisk) bytes += fs.statSync(path.join(ROOT, 'public', decodeURIComponent(u))).size;
    console.log('Distinct image refs        :', all.length);
    console.log('  exist on disk (migrate)  :', onDisk.length, `(${(bytes / 1048576).toFixed(1)} MB)`);
    console.log('  referenced but missing   :', missing, '(left as-is)');

    if (MODE === 'dry') {
      console.log('\nSample public_ids:');
      onDisk.slice(0, 6).forEach((u) => console.log('  ' + u + '  ->  ' + publicIdFor(u)));
      console.log('\n✋ DRY-RUN — nothing uploaded/rewritten. Run with --upload, then --rewrite.\n');
      await prisma.$disconnect(); return;
    }

    // upload
    const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
    let up = 0, skipd = 0;
    for (const u of onDisk) {
      if (map[u]) { skipd++; continue; }
      try {
        const res = await cloudinary.uploader.upload(path.join(ROOT, 'public', decodeURIComponent(u)), { public_id: publicIdFor(u), overwrite: true, resource_type: 'image' });
        map[u.toLowerCase()] = res.secure_url; up++;
        if (up % 100 === 0) { fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 0)); console.log(`  … ${up} uploaded`); }
      } catch (e) { console.log('  ❌', u, e.error ? e.error.message : e.message); }
    }
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 0));
    console.log(`\n✅ uploaded ${up} | already-mapped ${skipd} | map: ${Object.keys(map).length} entries -> .cloudinary-map.json\n`);
    await prisma.$disconnect(); return;
  }

  // MODE === 'rewrite'
  if (!fs.existsSync(MAP_FILE)) { console.error('No .cloudinary-map.json — run --upload first.'); process.exit(1); }
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  const replaceIn = (text) => {
    if (!text) return { out: text, n: 0 };
    let n = 0;
    const out = String(text).replace(IMG_RE, (m) => { const key = m.split('?')[0].toLowerCase(); if (map[key]) { n++; return map[key]; } return m; });
    return { out, n };
  };

  // code files
  let codeFiles = 0, codeRefs = 0;
  for (const f of walk(path.join(ROOT, 'src')).filter((f) => CODE_EXT.test(f))) {
    const txt = fs.readFileSync(f, 'utf8'); const { out, n } = replaceIn(txt);
    if (n > 0) { fs.writeFileSync(f, out); codeFiles++; codeRefs += n; }
  }
  console.log(`Code: rewrote ${codeRefs} refs in ${codeFiles} files`);

  // DB scalar fields
  let dbScalar = 0;
  for (const p of await prisma.product.findMany({ select: { id: true, imageSrc: true } })) {
    const key = (p.imageSrc || '').split('?')[0].toLowerCase();
    if (map[key]) { await prisma.product.update({ where: { id: p.id }, data: { imageSrc: map[key] } }); dbScalar++; }
  }
  for (const c of await prisma.category.findMany({ select: { id: true, image: true } })) {
    const key = (c.image || '').split('?')[0].toLowerCase();
    if (map[key]) { await prisma.category.update({ where: { id: c.id }, data: { image: map[key] } }); dbScalar++; }
  }
  for (const b of await prisma.blogPost.findMany({ select: { id: true, coverImage: true } })) {
    const key = (b.coverImage || '').split('?')[0].toLowerCase();
    if (map[key]) { await prisma.blogPost.update({ where: { id: b.id }, data: { coverImage: map[key] } }); dbScalar++; }
  }
  console.log(`DB scalar fields: rewrote ${dbScalar}`);

  // DB text/HTML fields
  let htmlRows = 0, htmlRefs = 0;
  let skip = 0;
  while (true) {
    const rows = await prisma.pageContent.findMany({ select: { id: true, htmlContent: true }, skip, take: 300, orderBy: { id: 'asc' } });
    if (!rows.length) break;
    for (const r of rows) { const { out, n } = replaceIn(r.htmlContent); if (n > 0) { await prisma.pageContent.update({ where: { id: r.id }, data: { htmlContent: out } }); htmlRows++; htmlRefs += n; } }
    skip += 300; if (skip % 1500 === 0) console.log(`  … page_contents ${skip} scanned`);
  }
  for (const c of await prisma.cmsSection.findMany({ select: { id: true, content: true } })) {
    const { out, n } = replaceIn(c.content); if (n > 0) { await prisma.cmsSection.update({ where: { id: c.id }, data: { content: out } }); htmlRefs += n; }
  }
  for (const s of await prisma.setting.findMany({ select: { id: true, value: true } })) {
    const { out, n } = replaceIn(s.value); if (n > 0) { await prisma.setting.update({ where: { id: s.id }, data: { value: out } }); htmlRefs += n; }
  }
  console.log(`DB HTML/text: rewrote ${htmlRefs} refs (${htmlRows} page_contents)`);
  console.log('\n✅ rewrite complete.\n');
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
