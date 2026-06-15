/**
 * scripts/fix-subcategory-images.js
 *
 * Scrapes and assigns valid image paths to categories with null or empty images.
 * Uses category legacy PHP pages, DB products, and content-export.json product lookups.
 * Verifies that all assigned image paths exist on disk.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const jsonPath = path.join(process.cwd(), 'content-export.json');
let contentExport = [];
if (fs.existsSync(jsonPath)) {
  contentExport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

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
  // Strip php syntax, quotes, and trailing junk
  let cleaned = imgPath
    .replace(/<\?php\s+echo\s+BASE_URL\s*(?:\.\s*)?/gi, '')
    .replace(/['"]?\s*;?\s*\?>/g, '')
    .replace(/['"]/g, '')
    .trim();
  
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }
  
  cleaned = cleaned.replace(/\/+/g, '/');
  return cleaned;
}

function findJsonProduct(dbSlug) {
  const parts = dbSlug.split('/');
  const lastPart = parts[parts.length - 1].replace(/-\d+$/, '').toLowerCase(); // strip numeric suffix like -8953
  
  return contentExport.find(item => {
    const itemParts = item.path.replace(/\.php$/, '').split('/');
    const itemLastPart = itemParts[itemParts.length - 1].toLowerCase();
    return itemLastPart === lastPart;
  });
}

// Check if image path exists on disk under public/
function imageExists(imgPath) {
  if (!imgPath) return false;
  const fullPath = path.join(process.cwd(), 'public', imgPath);
  return fs.existsSync(fullPath);
}

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { image: null },
        { image: '' }
      ]
    },
    include: { products: true }
  });

  const cloneDir = path.join(process.cwd(), 'legacy_content');
  console.log(`🌱 Found ${categories.length} categories with missing images.`);
  
  let updatedCount = 0;

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
      
      let firstImg = $('main img').first().attr('src') || $('img').first().attr('src');
      if (firstImg) {
        const cleaned = cleanImagePath(firstImg);
        if (imageExists(cleaned)) {
          resolvedImage = cleaned;
          source = `category PHP file (${catPhpPath})`;
        }
      }
    }

    // Step 2: Try database products directly
    if (!resolvedImage && cat.products.length > 0) {
      const dbProdWithImg = cat.products.find(p => p.imageSrc && p.imageSrc.trim() !== '' && imageExists(cleanImagePath(p.imageSrc)));
      if (dbProdWithImg) {
        resolvedImage = cleanImagePath(dbProdWithImg.imageSrc);
        source = `database product imageSrc (${dbProdWithImg.slug})`;
      }
    }

    // Step 3: Try matching product in content-export.json and loading its PHP file
    if (!resolvedImage && cat.products.length > 0) {
      for (const prod of cat.products) {
        const jsonProd = findJsonProduct(prod.slug);
        if (jsonProd) {
          if (jsonProd.imageSrc) {
            const cleaned = cleanImagePath(jsonProd.imageSrc);
            if (imageExists(cleaned)) {
              resolvedImage = cleaned;
              source = `content-export.json imageSrc for product (${jsonProd.path})`;
              break;
            }
          }
          
          const prodPhpPath = jsonProd.path;
          const prodFullPath = path.join(cloneDir, prodPhpPath);
          if (fs.existsSync(prodFullPath) && fs.statSync(prodFullPath).size > 0) {
            const content = fs.readFileSync(prodFullPath, 'utf-8');
            const $ = cheerio.load(content);
            
            let imgUrl = $('.product-img img').first().attr('src') || 
                         $('.product-image img').first().attr('src') ||
                         $('main img').first().attr('src') ||
                         $('img').first().attr('src');
            
            if (imgUrl) {
              const cleaned = cleanImagePath(imgUrl);
              if (imageExists(cleaned)) {
                resolvedImage = cleaned;
                source = `product PHP file from content-export (${prodPhpPath})`;
                break;
              }
            }
          }
        }
      }
    }

    // Step 4: Fallback to checking product legacy paths directly
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
            const cleaned = cleanImagePath(imgUrl);
            if (imageExists(cleaned)) {
              resolvedImage = cleaned;
              source = `product legacy PHP file (${prodPhpPath})`;
              break;
            }
          }
        }
      }
    }

    // Step 5: Final Fallback for Cables / Standards / Others
    if (!resolvedImage) {
      // General fallbacks depending on category name/slug
      let fallbackPath = null;
      if (cat.slug.includes('cable') || cat.slug.includes('standard') || cat.slug.includes('residential')) {
        fallbackPath = '/assets/images/catalogue/cables.png';
      } else if (cat.slug.includes('fan')) {
        fallbackPath = '/assets/images/our_products/fans/ceiling_fan.png';
      } else if (cat.slug.includes('conduit')) {
        fallbackPath = '/assets/images/our_products/conduit_accessories/concealed_box/metal.png';
      } else if (cat.slug.includes('solar')) {
        fallbackPath = '/assets/images/our_products/solar/solar-grid-tie-inverter.png';
      } else if (cat.slug.includes('gland')) {
        fallbackPath = '/assets/images/our_products/gland/1.jpg';
      } else if (cat.slug.includes('terminal')) {
        fallbackPath = '/assets/images/our_products/dowells/cable_terminal/1.jpg';
      } else {
        fallbackPath = '/assets/images/catalogue/cables.png';
      }

      if (imageExists(fallbackPath)) {
        resolvedImage = fallbackPath;
        source = `General Category Fallback (${fallbackPath})`;
      }
    }

    if (resolvedImage) {
      console.log(`✍️ Updating: "${cat.name}" (${cat.slug}) -> ${resolvedImage} [Source: ${source}]`);
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: resolvedImage }
      });
      updatedCount++;
    } else {
      console.log(`⚠️ Could not resolve any image for: "${cat.name}" (${cat.slug})`);
    }
  }

  console.log(`\n🎉 Success! Updated ${updatedCount} / ${categories.length} categories with valid images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
