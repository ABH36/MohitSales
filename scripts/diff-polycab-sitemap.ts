/**
 * Diffs our catalogue against Polycab's public sitemaps to answer two things:
 *   1. Which of our products/categories still exist on polycab.com (match) —
 *      giving the live Polycab URL we can pull an image from.
 *   2. Which of ours are NOT on polycab.com anymore — the "old / discontinued"
 *      list the client asked for.
 *
 * Sitemaps are downloaded first to the paths below (see the curl step). Pure
 * local set-diff, no live fetching, no DB writes.
 *
 *   npx tsx scripts/diff-polycab-sitemap.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();
const SP = 'C:/Users/FTT/AppData/Local/Temp/claude/d--MS/de872d6d-bc46-4ca7-bee0-497742d9dbe1/scratchpad';

/** Normalise a slug leaf so cosmetic differences don't cause false misses:
 *  lowercase, drop filler tokens (and/for/the), strip non-alphanumerics. */
function norm(leaf: string): string {
  return leaf
    .toLowerCase()
    .replace(/\b(and|for|the|with|of)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Significant tokens of a string, minus filler + the ubiquitous "polycab". */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\b(and|for|the|with|of|polycab|ac|mc|sc)\b/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

interface PolyEntry { url: string; norm: string; toks: Set<string>; }

function loadSitemap(file: string): PolyEntry[] {
  const xml = fs.readFileSync(file, 'utf8');
  const urls = xml.match(/https:\/\/polycab\.com\/[^<\s]+/g) || [];
  const out: PolyEntry[] = [];
  for (const url of urls) {
    const path = url.replace('https://polycab.com/', '').replace(/\/$/, '');
    const segs = path.split('/');
    // Product URLs end in .../c-xxxx/p-xxxxx — the slug is the first segment.
    // Category URLs have no p-id — the slug is the last segment.
    const leaf = /\/p-\d+/.test(url) ? segs[0] : segs[segs.length - 1];
    out.push({ url, norm: norm(leaf), toks: new Set(tokens(leaf)) });
  }
  return out;
}

/** Match our product to a Polycab entry: exact normalised leaf/title first,
 *  then "all of our title's tokens appear in the Polycab slug". */
function findMatch(slugLeaf: string, title: string, entries: PolyEntry[], byNorm: Map<string, string>): string | null {
  const exact = byNorm.get(norm(slugLeaf)) || byNorm.get(norm(title));
  if (exact) return exact;
  const want = tokens(title).length ? tokens(title) : tokens(slugLeaf);
  if (!want.length) return null;
  for (const e of entries) {
    if (want.every((t) => e.toks.has(t))) return e.url;
  }
  return null;
}

async function main() {
  const products = loadSitemap(`${SP}/poly-products.xml`);
  const categories = loadSitemap(`${SP}/poly-categories.xml`);
  const all = [...products, ...categories];
  const byNorm = new Map<string, string>();
  for (const e of all) if (!byNorm.has(e.norm)) byNorm.set(e.norm, e.url);
  console.log(`Polycab sitemap: ${products.length} product slugs, ${categories.length} category slugs`);

  const ours = await prisma.product.findMany({
    select: { title: true, slug: true, imageSrc: true, datasheetLink: true },
  });

  const FALLBACK = 'msc_logo_without_bg';
  const matched: string[] = [];
  const missing: string[] = [];   // on polycab, but WE lack an image
  const notOnPolycab: string[] = []; // old / discontinued

  for (const p of ours) {
    const leaf = p.slug.split('/').pop() || '';
    const hit = findMatch(leaf, p.title || '', all, byNorm);
    const weLackImage = !p.imageSrc || p.imageSrc.includes(FALLBACK);
    if (hit) {
      matched.push(`${p.slug}\t${hit}`);
      if (weLackImage) missing.push(`${p.slug}\t${hit}`);
    } else {
      notOnPolycab.push(`${p.title}\t${p.slug}`);
    }
  }

  console.log(`\nOur products: ${ours.length}`);
  console.log(`  Matched on polycab.com:        ${matched.length}`);
  console.log(`  -> of which WE lack an image:  ${missing.length} (fillable from polycab)`);
  console.log(`  NOT on polycab (old/discont.): ${notOnPolycab.length}`);

  fs.writeFileSync('scripts/polycab-matched.tsv', 'our_slug\tpolycab_url\n' + matched.join('\n'));
  fs.writeFileSync('scripts/polycab-image-fillable.tsv', 'our_slug\tpolycab_url\n' + missing.join('\n'));
  fs.writeFileSync('scripts/not-on-polycab-OLD.tsv', 'title\tour_slug\n' + notOnPolycab.join('\n'));
  console.log('\nWrote: polycab-matched.tsv, polycab-image-fillable.tsv, not-on-polycab-OLD.tsv');

  // Show a sample of the old list, grouped by top section.
  const bySection: Record<string, number> = {};
  for (const row of notOnPolycab) {
    const slug = row.split('\t')[1] || '';
    const first = slug.split('/')[0];
    bySection[first] = (bySection[first] || 0) + 1;
  }
  console.log('\nNOT-on-polycab by top section:');
  Object.entries(bySection).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
