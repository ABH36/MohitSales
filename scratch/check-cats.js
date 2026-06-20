const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { slug: { startsWith: 'polycab/cables/cables-by-application' } }
  });
  console.log(cats.map(c => c.slug));
}

main().catch(console.error).finally(() => prisma.$disconnect());
