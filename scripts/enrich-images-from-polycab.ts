/**
 * For our category tiles / products that lack an image but DO match a live
 * Polycab page (see polycab-image-fillable.tsv), fetch a representative image
 * from that Polycab page — the og:image, else the first product image on the
 * page. Links point directly at Polycab's CDN (cms.polycab.com), per the
 * agreed hosting choice.
 *
 * DRY by default: writes a slug -> image-url report; no DB writes. Pass --apply
 * to set imageSrc (a deployer step against PROD).
 *
 *   npx tsx scripts/enrich-images-from-polycab.ts            # dry report
 *   npx tsx scripts/enrich-images-from-polycab.ts --apply    # write DB
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function fetchImage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    // Prefer the page's og:image (clean, representative).
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (og && /cms\.polycab\.com|wp-content/.test(og[1])) return og[1];
    // Else the first real product image on the page.
    const img = html.match(/https:\/\/cms\.polycab\.com\/media\/[^"'\s)]+_img[^"'\s)]*\.(?:png|jpg|jpeg|webp)/i);
    if (img) return img[0];
    // Else any cms media image.
    const any = html.match(/https:\/\/cms\.polycab\.com\/media\/[^"'\s)]+\.(?:png|jpg|jpeg|webp)/i);
    return any ? any[0] : null;
  } catch {
    return null;
  }
}

async function main() {
  const lines = fs.readFileSync('scripts/polycab-image-fillable.tsv', 'utf8')
    .split('\n').slice(1).map((l) => l.trim()).filter(Boolean);

  const results: { slug: string; page: string; image: string | null }[] = [];
  // Small concurrency so we don't hammer polycab.com.
  const CONC = 5;
  for (let i = 0; i < lines.length; i += CONC) {
    const batch = lines.slice(i, i + CONC).map(async (l) => {
      const [slug, page] = l.split('\t');
      const image = await fetchImage(page);
      results.push({ slug, page, image });
    });
    await Promise.all(batch);
    process.stdout.write(`  fetched ${Math.min(i + CONC, lines.length)}/${lines.length}\r`);
  }

  const found = results.filter((r) => r.image);
  const none = results.filter((r) => !r.image);
  console.log(`\n\nImage found for ${found.length}/${results.length} pages; ${none.length} had no usable image.`);

  const report = 'our_slug\timage_url\tpolycab_page\n' +
    results.map((r) => `${r.slug}\t${r.image || 'NONE'}\t${r.page}`).join('\n');
  fs.writeFileSync('scripts/image-fill-report.tsv', report);
  console.log('Wrote scripts/image-fill-report.tsv');

  if (APPLY) {
    let n = 0;
    for (const r of found) {
      const res = await prisma.product.updateMany({ where: { slug: r.slug }, data: { imageSrc: r.image! } });
      n += res.count;
    }
    console.log(`Applied imageSrc to ${n} products.`);
  } else {
    console.log('DRY RUN — no DB writes. Re-run with --apply to write (deployer step).');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
