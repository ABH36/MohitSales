const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

const LEGACY_DIR = path.join(__dirname, '..', 'legacy_content');

// Helper to recursively list all PHP files in a directory
function getPhpFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'assets' && file !== 'common') {
        getPhpFiles(fullPath, fileList);
      }
    } else if (file.endsWith('.php')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Helper to clean legacy PHP tags in URL and get relative paths
function cleanPdfUrl(href) {
  if (!href) return '';
  return href
    .replace(/<\?php\s+echo\s+BASE_URL\s*\.\s*'([^']*)'\s*;?\s*\?>/g, '/$1')
    .replace(/<\?php\s+echo\s+BASE_URL\s*;?\s*\?>/g, '/')
    .replace(/^\/?/, '/') // ensure leading slash
    .trim();
}

async function findProductByLegacyPath(legacyPath) {
  // Try 1: Exact match
  let prod = await prisma.product.findUnique({
    where: { slug: legacyPath },
    select: { id: true, title: true, datasheetLink: true }
  });
  if (prod) return prod;

  // Try 2: industries/cables-by- -> polycab/cables-by-
  if (legacyPath.startsWith('industries/cables-by-')) {
    const mapped = legacyPath.replace('industries/cables-by-', 'polycab/cables-by-');
    prod = await prisma.product.findUnique({
      where: { slug: mapped },
      select: { id: true, title: true, datasheetLink: true }
    });
    if (prod) return prod;
  }

  // Try 3: prepend polycab/
  prod = await prisma.product.findUnique({
    where: { slug: 'polycab/' + legacyPath },
    select: { id: true, title: true, datasheetLink: true }
  });
  if (prod) return prod;

  // Try 4: prepend dowells/
  prod = await prisma.product.findUnique({
    where: { slug: 'dowells/' + legacyPath },
    select: { id: true, title: true, datasheetLink: true }
  });
  if (prod) return prod;

  // Try 5: match by the last segment of the slug
  const lastPart = legacyPath.split('/').pop();
  prod = await prisma.product.findFirst({
    where: {
      slug: {
        endsWith: '/' + lastPart
      }
    },
    select: { id: true, title: true, datasheetLink: true }
  });
  
  return prod;
}

async function main() {
  console.log('Scanning legacy files for datasheet PDFs...');
  if (!fs.existsSync(LEGACY_DIR)) {
    console.error('legacy_content folder not found at', LEGACY_DIR);
    return;
  }

  const phpFiles = getPhpFiles(LEGACY_DIR);
  console.log(`Found ${phpFiles.length} PHP files to parse.`);

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const filePath of phpFiles) {
    const relativePath = path.relative(LEGACY_DIR, filePath);
    const cleanSlug = relativePath.replace(/\.php$/i, '').replace(/\\/g, '/').toLowerCase();

    // Read and parse file
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, null, false);

    let pdfLink = null;
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().toLowerCase();
      if (href.toLowerCase().includes('.pdf') || text.includes('datasheet')) {
        pdfLink = cleanPdfUrl(href);
        return false; // break loop
      }
    });

    if (pdfLink) {
      const product = await findProductByLegacyPath(cleanSlug);

      if (product) {
        if (product.datasheetLink !== pdfLink) {
          await prisma.product.update({
            where: { id: product.id },
            data: { datasheetLink: pdfLink }
          });
          console.log(`Updated [${product.title}] -> ${pdfLink}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        notFoundCount++;
      }
    }
  }

  console.log(`\nBackfill execution completed:`);
  console.log(`- Updated: ${updatedCount} products`);
  console.log(`- Already matching / Skipped: ${skippedCount} products`);
  console.log(`- Product not found in DB: ${notFoundCount} files`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
