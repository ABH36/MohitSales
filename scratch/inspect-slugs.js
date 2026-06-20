const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const LEGACY_DIR = path.join(__dirname, '..', 'legacy_content');

async function main() {
  const dbProducts = await prisma.product.findMany({
    take: 10,
    select: { slug: true, title: true }
  });
  console.log('10 DB Products slugs:');
  console.log(dbProducts);

  // Let's check a specific one, like rubber-cable
  const rubberCables = await prisma.product.findMany({
    where: { slug: { contains: 'rubber-cable' } },
    select: { slug: true, title: true }
  });
  console.log('rubber-cable products:');
  console.log(rubberCables);

  // Let's check if the directory list has folders like industries/cables-by-type
  const files = fs.readdirSync(LEGACY_DIR);
  console.log('Root files in legacy_content:', files);
}

main().finally(() => prisma.$disconnect());
