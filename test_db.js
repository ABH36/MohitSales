const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const total = await prisma.product.count();
        const edited = await prisma.product.count({
            where: {
                NOT: {
                    updatedAt: {
                        equals: prisma.product.fields.createdAt
                    }
                }
            }
        });
        
        // Let's count where updatedAt !== createdAt by querying and comparing
        const allProducts = await prisma.product.findMany({
            select: { id: true, createdAt: true, updatedAt: true }
        });
        
        let diffCount = 0;
        for (const p of allProducts) {
            if (p.createdAt.getTime() !== p.updatedAt.getTime()) {
                diffCount++;
            }
        }

        console.log(`Total Products: ${total}`);
        console.log(`Products where updatedAt !== createdAt: ${diffCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
