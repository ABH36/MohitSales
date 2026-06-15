const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const nullOrEmptyCats = await prisma.category.findMany({
    where: {
      OR: [
        { image: null },
        { image: '' }
      ]
    }
  });

  console.log(`Categories still with null/empty image: ${nullOrEmptyCats.length}`);
  if (nullOrEmptyCats.length > 0) {
    nullOrEmptyCats.forEach(c => {
      console.log(`- ${c.name} (${c.slug})`);
    });
  } else {
    console.log('✅ ALL categories now have valid, non-null image values in the database!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
