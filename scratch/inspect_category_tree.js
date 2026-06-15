const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allCats = await prisma.category.findMany();
  
  // Build parent-child mapping
  const catMap = {};
  allCats.forEach(c => {
    catMap[c.id] = { ...c, children: [] };
  });
  
  const roots = [];
  allCats.forEach(c => {
    if (c.parentId && catMap[c.parentId]) {
      catMap[c.parentId].children.push(catMap[c.id]);
    } else {
      roots.push(catMap[c.id]);
    }
  });

  // Sort function
  const sortCats = (list) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    list.forEach(c => sortCats(c.children));
  };
  sortCats(roots);

  // Print function
  function printTree(cat, indent = '') {
    console.log(`${indent}├── ${cat.name} [slug: ${cat.slug}]`);
    cat.children.forEach(child => {
      printTree(child, indent + '│   ');
    });
  }

  console.log('--- DATABASE CATEGORY HIERARCHY TREE ---');
  roots.forEach(root => {
    printTree(root);
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
