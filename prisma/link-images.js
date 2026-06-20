const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'assets', 'images', 'industries');

// Recursively get all image files in a directory
function getAllImages(dir, baseDir = dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllImages(fullPath, baseDir));
    } else if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(item)) {
      const relativePath = '/' + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
      results.push({ filename: item, path: relativePath, dir: path.relative(baseDir, path.dirname(fullPath)).replace(/\\/g, '/') });
    }
  }
  return results;
}

// Normalize string for matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check similarity - does filename contain product name words?
function matchScore(prodTitle, imgFilename) {
  const titleWords = normalize(prodTitle).split(' ').filter(w => w.length > 2);
  const fnNorm = normalize(imgFilename.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/[-_]/g, ' '));
  let matchCount = 0;
  for (const word of titleWords) {
    if (fnNorm.includes(word)) matchCount++;
  }
  return titleWords.length > 0 ? matchCount / titleWords.length : 0;
}

async function main() {
  console.log('========== IMAGE LINKING ANALYSIS ==========\n');

  // Get all images from industries folder
  const allImages = getAllImages(IMAGES_DIR);
  console.log(`Total images in /assets/images/industries/: ${allImages.length}`);
  
  // Get all images from our_products/polycab/cables
  const cableImagesDir = path.join(PUBLIC_DIR, 'assets', 'images', 'our_products', 'polycab');
  const cableImages = fs.existsSync(cableImagesDir) ? getAllImages(cableImagesDir) : [];
  console.log(`Total images in /assets/images/our_products/polycab/: ${cableImages.length}`);
  
  const allAvailableImages = [...allImages, ...cableImages];
  console.log(`Total searchable images: ${allAvailableImages.length}`);

  // Get active products without images
  const noImgProds = await p.product.findMany({
    where: { isActive: true, imageSrc: null },
    select: { id: true, title: true, slug: true }
  });
  console.log(`\nProducts without images: ${noImgProds.length}`);

  // Try to auto-match images to products
  let matched = 0;
  const updates = [];

  for (const prod of noImgProds) {
    let bestScore = 0;
    let bestImg = null;

    for (const img of allAvailableImages) {
      const score = matchScore(prod.title, img.filename);
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestImg = img;
      }
    }

    if (bestImg) {
      matched++;
      updates.push({ id: prod.id, title: prod.title, imageSrc: bestImg.path, score: bestScore });
      if (matched <= 15) {
        console.log(`  MATCH (${(bestScore*100).toFixed(0)}%): "${prod.title}" => ${bestImg.path}`);
      }
    }
  }

  console.log(`\nAuto-matched: ${matched} out of ${noImgProds.length}`);

  // Apply image updates
  if (updates.length > 0) {
    for (const upd of updates) {
      await p.product.update({
        where: { id: upd.id },
        data: { imageSrc: upd.path }
      });
    }
    console.log(`✅ Updated ${updates.length} product images\n`);
  }

  // Show sample images available in industries folder by subfolder
  console.log('\n========== AVAILABLE IMAGE DIRECTORIES ==========');
  const subdirs = [...new Set(allImages.map(i => i.dir.split('/')[0]))];
  subdirs.forEach(d => {
    const count = allImages.filter(i => i.dir.startsWith(d)).length;
    console.log(`  ${d}: ${count} images`);
  });

  await p.$disconnect();
}

main().catch(e => { console.error('ERROR:', e); p.$disconnect(); });
