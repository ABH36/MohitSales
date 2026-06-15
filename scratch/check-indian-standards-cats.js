const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: {
      slug: {
        contains: 'indian-standards'
      }
    }
  });

  console.log('Categories matching "indian-standards" in DB:');
  cats.forEach(c => {
    console.log(`- ID: ${c.id} | Slug: ${c.slug} | Name: ${c.name}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
