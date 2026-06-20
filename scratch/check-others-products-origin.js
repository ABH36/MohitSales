const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(process.cwd(), 'content-export.json');
  const dataList = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const othersCat = await prisma.category.findUnique({
    where: { slug: 'polycab/cables-by-type/others' }
  });

  if (!othersCat) {
    console.log('No Others category found');
    return;
  }

  const products = await prisma.product.findMany({
    where: { categoryId: othersCat.id }
  });

  console.log(`Found ${products.length} products under Others category in DB.`);

  let mappedCount = 0;
  for (const p of products.slice(0, 15)) {
    // Find original entry in content-export.json
    let match = dataList.find(item => item.title === p.title || item.heading === p.title);
    if (!match) {
      const slugParts = p.slug.split('/');
      const lastPart = slugParts[slugParts.length - 1];
      match = dataList.find(item => {
        const itemParts = item.path.replace(/\.php$/, '').split('/');
        return itemParts[itemParts.length - 1].toLowerCase() === lastPart.toLowerCase();
      });
    }

    if (match) {
      console.log(`Product: "${p.title}"`);
      console.log(`  Original Path: "${match.path}"`);
      mappedCount++;
    } else {
      console.log(`Product: "${p.title}" (No match in JSON)`);
    }
  }

  if (products.length > 15) {
    console.log(`... and ${products.length - 15} more ...`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
