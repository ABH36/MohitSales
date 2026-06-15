const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Reading content-export.json...');
  const dataPath = path.join(__dirname, '..', 'content-export.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: content-export.json not found!');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const products = JSON.parse(rawData);

  console.log(`Found ${products.length} products to import.`);

  // 1. Get or Create a default Category to attach products to
  let defaultCat = await prisma.category.findFirst({ where: { slug: 'general' } });
  if (!defaultCat) {
    defaultCat = await prisma.category.create({
      data: {
        name: 'General',
        slug: 'general',
      }
    });
  }

  let successCount = 0;
  let skipCount = 0;

  for (const item of products) {
    // Format the slug correctly (remove .php)
    const cleanSlug = item.path.replace(/\.php$/i, '').toLowerCase();
    
    // Check if it already exists
    const exists = await prisma.product.findUnique({
      where: { slug: cleanSlug }
    });

    if (exists) {
      skipCount++;
      continue;
    }

    try {
      await prisma.product.create({
        data: {
          slug: cleanSlug,
          title: item.heading || item.title || cleanSlug.split('/').pop(),
          description: item.description ? JSON.stringify(item.description) : null,
          features: item.cards ? JSON.stringify(item.cards) : null,
          imageSrc: item.imageSrc || null,
          datasheetLink: item.datasheet || null,
          categoryId: defaultCat.id,
          isActive: true
        }
      });
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`Imported ${successCount} products...`);
      }
    } catch (e) {
      console.error(`Failed to import ${cleanSlug}:`, e.message);
    }
  }

  console.log('✅ Import Completed!');
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Skipped (already exists): ${skipCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
