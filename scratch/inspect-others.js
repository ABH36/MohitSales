const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const othersCat = await prisma.category.findUnique({
    where: { slug: 'polycab/cables-by-type/others' },
    include: {
      products: true,
      children: true
    }
  });

  console.log('=== DATABASE OTHERS CATEGORY ===');
  console.log('Category:', othersCat);

  // Read the legacy PHP file for others.php
  const phpPath = path.join(process.cwd(), 'legacy_content/industries/cables-by-type/others.php');
  if (fs.existsSync(phpPath)) {
    console.log('\n=== LEGACY PHP FILE EXISTS ===');
    const content = fs.readFileSync(phpPath, 'utf-8');
    // Find all titles in card links/headers
    const matches = content.match(/<h4>([^<]+)<\/h4>/g) || [];
    console.log('Matches in PHP:');
    matches.forEach(m => console.log('  ', m));
  } else {
    console.log('\n=== LEGACY PHP FILE DOES NOT EXIST AT:', phpPath);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
