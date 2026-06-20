const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cablesRoot = await prisma.category.findUnique({
    where: { slug: 'polycab/cables' }
  });

  if (!cablesRoot) {
    console.log('No cables root category found with slug "polycab/cables"');
    return;
  }

  console.log('Cables Root:', cablesRoot);

  const childCats = await prisma.category.findMany({
    where: { parentId: cablesRoot.id }
  });

  console.log('\nDirect children of Cables Root:');
  for (const c of childCats) {
    console.log(`- ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`);
  }

  const allDescendants = await prisma.category.findMany({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });
  console.log(`\nTotal descendant categories under polycab/cables: ${allDescendants.length}`);

  const productsInCables = await prisma.product.count({
    where: { slug: { startsWith: 'polycab/cables/' } }
  });
  console.log(`Total products under polycab/cables slug prefix: ${productsInCables}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
