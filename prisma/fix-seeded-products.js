const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting data migration for product descriptions...');
  
  // Find all products with non-null descriptions
  const products = await prisma.product.findMany({
    where: {
      description: {
        not: null
      }
    },
    select: {
      id: true,
      slug: true,
      description: true
    }
  });

  console.log(`Found ${products.length} products to check.`);
  let updatedCount = 0;

  for (const product of products) {
    const rawDesc = product.description;
    
    // Check if it is a JSON array string
    if (rawDesc.startsWith('[') && rawDesc.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawDesc);
        if (Array.isArray(parsed)) {
          // Join the array elements using double newlines
          const cleanDesc = parsed.filter(Boolean).map(p => String(p).trim()).join('\n\n');
          
          await prisma.product.update({
            where: { id: product.id },
            data: { description: cleanDesc }
          });
          updatedCount++;
        }
      } catch (err) {
        // Not valid JSON array or couldn't parse, leave as is
      }
    }
  }

  console.log(`✅ Migration complete. Updated ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
