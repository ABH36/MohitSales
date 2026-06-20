const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slugs = [
    'polycab/fans/ceiling-fans',
    'polycab/home-appliances/irons',
    'dowells/gland/single-compression-gland'
  ];

  for (const slug of slugs) {
    console.log(`\n=== SLUG: ${slug} ===`);
    const cat = await prisma.category.findUnique({ where: { slug } });
    const prod = await prisma.product.findUnique({ where: { slug } });

    console.log('Category:', cat);
    console.log('Product:', prod);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
