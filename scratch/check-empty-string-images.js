const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emptyStringCats = await prisma.category.findMany({
    where: {
      image: ''
    }
  });

  console.log(`Categories with image as exact empty string (''): ${emptyStringCats.length}`);
  emptyStringCats.forEach(c => {
    console.log(`- ${c.slug} (${c.name})`);
  });

  const nullCats = await prisma.category.findMany({
    where: {
      image: null
    }
  });
  console.log(`Categories with image as null: ${nullCats.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
