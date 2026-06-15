const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function getLegacyPath(slugPath) {
  let clean = slugPath.toLowerCase();
  
  if (clean.startsWith('polycab/cables-by-')) {
    clean = clean.replace('polycab/cables-by-', 'industries/cables-by-');
  } else if (clean.startsWith('polycab/')) {
    clean = clean.substring('polycab/'.length);
  } else if (clean.startsWith('dowells/')) {
    clean = clean.substring('dowells/'.length);
  }
  
  return clean;
}

function cleanImagePath(imgPath) {
  if (!imgPath) return null;
  // Strip php syntax and quotes
  let cleaned = imgPath
    .replace(/<\?php\s+echo\s+BASE_URL\s*(?:\.\s*)?['"]?\/?/g, '')
    .replace(/['"]?\s*;\s*\?>/g, '')
    .replace(/['"]/g, '')
    .trim();
  
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }
  
  cleaned = cleaned.replace(/\/+/g, '/');
  return cleaned;
}

async function main() {
  const categories = await prisma.category.findMany({
    where: { image: null },
    include: { products: true }
  });

  const cloneDir = path.join(process.cwd(), 'legacy_content');
  console.log(`Analyzing ${categories.length} categories with null images...\n`);

  for (const cat of categories) {
    let resolvedImage = null;
    let source = '';

    // Step 1: Try category's own PHP file
    const catLegacyPath = getLegacyPath(cat.slug);
    const catPhpPath = catLegacyPath.endsWith('.php') ? catLegacyPath : `${catLegacyPath}.php`;
    const catFullPath = path.join(cloneDir, catPhpPath);

    if (fs.existsSync(catFullPath) && fs.statSync(catFullPath).size > 0) {
      const content = fs.readFileSync(catFullPath, 'utf-8');
      const $ = cheerio.load(content);
      
      // Look for images in the content
      let firstImg = $('main img').first().attr('src');
      if (!firstImg) {
        firstImg = $('img').first().attr('src');
      }

      if (firstImg) {
        resolvedImage = cleanImagePath(firstImg);
        source = `category PHP file (${catPhpPath})`;
      }
    }

    // Step 2: Try to get from database products directly
    if (!resolvedImage && cat.products.length > 0) {
      const dbProdWithImg = cat.products.find(p => p.imageSrc && p.imageSrc.trim() !== '');
      if (dbProdWithImg) {
        resolvedImage = cleanImagePath(dbProdWithImg.imageSrc);
        source = `database product imageSrc (${dbProdWithImg.slug})`;
      }
    }

    // Step 3: Try product's PHP file
    if (!resolvedImage && cat.products.length > 0) {
      for (const prod of cat.products) {
        const prodLegacyPath = getLegacyPath(prod.slug);
        const prodPhpPath = prodLegacyPath.endsWith('.php') ? prodLegacyPath : `${prodLegacyPath}.php`;
        const prodFullPath = path.join(cloneDir, prodPhpPath);

        if (fs.existsSync(prodFullPath) && fs.statSync(prodFullPath).size > 0) {
          const content = fs.readFileSync(prodFullPath, 'utf-8');
          const $ = cheerio.load(content);
          
          let imgUrl = $('.product-img img').first().attr('src') || 
                       $('.product-image img').first().attr('src') ||
                       $('main img').first().attr('src') ||
                       $('img').first().attr('src');
          
          if (imgUrl) {
            resolvedImage = cleanImagePath(imgUrl);
            source = `product PHP file (${prodPhpPath} under ${prod.title})`;
            break;
          }
        }
      }
    }

    console.log(`Category: ${cat.name} (${cat.slug})`);
    if (resolvedImage) {
      console.log(`  -> Resolved image: ${resolvedImage}`);
      console.log(`  -> Source: ${source}`);
    } else {
      console.log(`  -> Could NOT resolve image`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
