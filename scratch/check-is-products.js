const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'content-export.json');
const contentExport = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

async function main() {
  const isCat = await prisma.category.findUnique({
    where: { slug: 'polycab/cables-by-standards/indian-standards' },
    include: { products: true }
  });

  console.log(`Indian Standards (IS) category products count: ${isCat.products.length}`);
  isCat.products.forEach(p => {
    console.log(`Product: "${p.title}" | Slug: "${p.slug}"`);
    const parts = p.slug.split('/');
    const lastPart = parts[parts.length - 1].replace(/-\d+$/, '').toLowerCase();
    console.log(`  lastPart: "${lastPart}"`);
    
    const matches = contentExport.filter(item => {
      const itemParts = item.path.replace(/\.php$/, '').split('/');
      const itemLastPart = itemParts[itemParts.length - 1].toLowerCase();
      return itemLastPart.includes(lastPart) || lastPart.includes(itemLastPart);
    });
    
    console.log(`  Matched JSON items: ${matches.length}`);
    matches.forEach(m => {
      console.log(`    - Path: ${m.path} | Title: ${m.title}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
