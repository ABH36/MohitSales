const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock getLegacyPath
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

async function getProductData(slugPath) {
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Try 1: Exact match
  const matchPath = slugPath.endsWith('.php') ? slugPath : `${slugPath}.php`;
  let found = dataList.find((item) => item.path.toLowerCase() === matchPath.toLowerCase());
  if (found) return { found, method: 'exact' };

  // Try 2: Map using legacy path helper
  const legacyPath = getLegacyPath(slugPath);
  const matchLegacyPath = legacyPath.endsWith('.php') ? legacyPath : `${legacyPath}.php`;
  found = dataList.find((item) => item.path.toLowerCase() === matchLegacyPath.toLowerCase());
  if (found) return { found, method: 'legacyPath' };

  // Try 3: Match by final filename suffix (product pages)
  const slugParts = slugPath.split('/');
  const lastPart = slugParts[slugParts.length - 1].toLowerCase();
  
  found = dataList.find((item) => {
    const itemParts = item.path.replace(/\.php$/, '').split('/');
    const itemLastPart = itemParts[itemParts.length - 1].toLowerCase();
    return itemLastPart === lastPart;
  });

  return found ? { found, method: 'suffix' } : null;
}

async function main() {
  const slugPath = 'polycab/cables-by-application/building-infrastructure';
  console.log('Testing slugPath:', slugPath);

  const productResult = await getProductData(slugPath);
  console.log('getProductData Result:', productResult);

  if (productResult) {
    const phpPath = productResult.found.path;
    const fullPath = path.join(process.cwd(), 'legacy_content', phpPath);
    const exists = fs.existsSync(fullPath);
    console.log('PHP File path:', phpPath);
    console.log('Full Path:', fullPath);
    console.log('Exists:', exists);
    if (exists) {
      const stat = fs.statSync(fullPath);
      console.log('Size:', stat.size);
    }
  }

  // Also query DB category
  const dbCategory = await prisma.category.findUnique({
    where: { slug: slugPath }
  });
  console.log('DB Category:', dbCategory);

  // Also query DB product
  const dbProduct = await prisma.product.findUnique({
    where: { slug: slugPath }
  });
  console.log('DB Product:', dbProduct);
}

main().catch(console.error).finally(() => prisma.$disconnect());
