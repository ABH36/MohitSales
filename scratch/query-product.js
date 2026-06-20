const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cat = await p.category.findFirst({
    where: { slug: { contains: 'building-infrastructure' } }
  });
  console.log('HYPHEN SLUG:', cat ? cat.slug : 'NOT FOUND');

  const cat2 = await p.category.findFirst({
    where: { slug: { contains: 'building_infrastructure' } }
  });
  console.log('UNDERSCORE SLUG:', cat2 ? cat2.slug : 'NOT FOUND');

  const cat3 = await p.category.findFirst({
    where: { slug: { contains: 'cables_by_application' } }
  });
  console.log('UNDERSCORE CABLES BY APP SLUG:', cat3 ? cat3.slug : 'NOT FOUND');

  const allCategories = await p.category.findMany({
    where: { slug: { contains: 'cables' } }
  });
  console.log('\nALL CABLES CATEGORIES:');
  allCategories.forEach(c => console.log(`  - "${c.name}" | slug: "${c.slug}" | isActive: ${c.isActive}`));
}

main().catch(console.error).finally(() => p.$disconnect());
