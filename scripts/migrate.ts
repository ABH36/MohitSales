const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function generateSlug(text: string) {
  if (!text) return `item-${Date.now()}`;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureCategories(catNames: string[]) {
  let parentId: string | null = null;
  for (const name of catNames) {
    if (!name || name.toLowerCase() === 'home') continue;
    
    let slug = generateSlug(name);
    let cat = await prisma.category.findFirst({ where: { slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: name,
          slug: slug,
          parentId: parentId
        }
      });
    }
    parentId = cat.id;
  }
  return parentId;
}

async function main() {
  console.log('Starting Migration...');
  const dataPath = path.join(__dirname, '../content-export.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const items = JSON.parse(rawData);

  let createdProducts = 0;
  let skippedProducts = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const hasCards = item.cards && item.cards.length > 0;
    
    // Determine categories
    const breadcrumbs = item.breadcrumbs || [];
    let catNames = [];
    
    if (hasCards) {
      // The item itself is the deepest category
      catNames = breadcrumbs.slice(1); // skip "Home"
      if (catNames.length === 0) catNames = [item.heading || item.title];
    } else {
      // The item is a product, so categories are breadcrumbs up to the second-to-last
      catNames = breadcrumbs.slice(1, -1);
      if (catNames.length === 0 && breadcrumbs.length > 1) {
          catNames = [breadcrumbs[1]]; // fallback
      }
    }

    const leafCategoryId = await ensureCategories(catNames);

    if (hasCards) {
      // Insert cards as products
      for (const card of item.cards) {
        let cardSlug = generateSlug(card.title) + '-' + Math.floor(Math.random() * 10000);
        await prisma.product.create({
          data: {
            title: card.title || 'Untitled Product',
            slug: cardSlug,
            description: card.details || '',
            imageSrc: card.image || '',
            categoryId: leafCategoryId,
            isActive: true,
          }
        });
        createdProducts++;
      }
    } else {
      // Insert item as a single product
      let itemSlug = generateSlug(item.heading || item.title) + '-' + Math.floor(Math.random() * 10000);
      await prisma.product.create({
        data: {
          title: item.heading || item.title || 'Untitled Product',
          slug: itemSlug,
          description: item.description ? item.description.join('\\n') : '',
          imageSrc: item.imageSrc || '',
          categoryId: leafCategoryId,
          isActive: true,
        }
      });
      createdProducts++;
    }

    if (i % 100 === 0 && i > 0) {
      console.log(`Processed ${i} items... Created ${createdProducts} products.`);
    }
  }

  console.log(`\\nMigration Complete!`);
  console.log(`Total Products Created: ${createdProducts}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
