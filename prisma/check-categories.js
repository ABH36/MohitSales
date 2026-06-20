const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, parentId: true, sortOrder: true, isActive: true }
  });
  
  // Group by parentId
  const roots = cats.filter(c => !c.parentId);
  console.log('\n=== ROOT CATEGORIES ===');
  roots.forEach(r => console.log(`[${r.isActive ? 'ACTIVE' : 'INACTIVE'}] id=${r.id} | name="${r.name}" | slug="${r.slug}"`));
  
  console.log('\n=== ALL CATEGORIES WITH PARENT ===');
  cats.filter(c => c.parentId).forEach(c => {
    const parent = cats.find(p => p.id === c.parentId);
    console.log(`[${c.isActive ? 'ACTIVE' : 'INACTIVE'}] "${c.name}" (slug: ${c.slug}) -> parent: "${parent?.name || 'NOT FOUND'}" (${c.parentId})`);
  });
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
