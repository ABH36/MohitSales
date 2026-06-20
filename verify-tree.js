const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function printTree(categories, parentId = null, indent = '') {
  const levelCats = categories.filter(c => c.parentId === parentId);
  levelCats.sort((a, b) => a.sortOrder - b.sortOrder);

  for (const cat of levelCats) {
    console.log(`${indent}● ID: ${cat.id} | Slug: "${cat.slug}" | Name: "${cat.name}" | isActive: ${cat.isActive} | products: ${cat._count?.products || 0}`);
    printTree(categories, cat.id, indent + '  ');
  }
}

async function main() {
  const allCats = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log('\n=== RECURSIVE CATEGORY TREE ===');
  printTree(allCats, null);
  console.log('===============================\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
