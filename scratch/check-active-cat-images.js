const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      image: {
        not: null
      }
    },
    select: {
      id: true,
      slug: true,
      name: true,
      image: true,
      parentId: true
    }
  });

  console.log('Categories with active images:');
  categories.forEach(c => {
    console.log(`- ${c.slug} (${c.name}): ${c.image}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
