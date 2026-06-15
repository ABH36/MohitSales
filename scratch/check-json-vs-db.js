const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, '..', 'content-export.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('content-export.json not found!');
    process.exit(1);
  }
  
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Total items in JSON: ${jsonData.length}`);
  
  // Get all slugs from DB
  const dbProducts = await prisma.product.findMany({
    select: { slug: true }
  });
  const dbSlugs = new Set(dbProducts.map(p => p.slug.toLowerCase()));
  console.log(`Total products in DB: ${dbSlugs.size}`);
  
  const missing = [];
  jsonData.forEach(item => {
    // Map path (e.g. "industries/cables-by-type/lv-power-cable.php") to slug ("industries/cables-by-type/lv-power-cable")
    let slug = item.path.replace(/\.php$/i, '').toLowerCase();
    if (slug.startsWith('/')) {
      slug = slug.substring(1);
    }
    
    if (!dbSlugs.has(slug)) {
      missing.push(item.path);
    }
  });
  
  console.log(`Total missing paths: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Sample missing paths:', missing.slice(0, 10));
  } else {
    console.log('Success! All products in JSON are covered in DB.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
