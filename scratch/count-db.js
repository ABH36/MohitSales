const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Record Count ---');
  try {
    const products = await prisma.product.count();
    const categories = await prisma.category.count();
    const seoMeta = await prisma.seoMeta.count();
    const schemaMarkup = await prisma.schemaMarkup.count();
    const redirect = await prisma.redirect.count();
    const inquiry = await prisma.inquiry.count();
    const blogPost = await prisma.blogPost.count();
    const media = await prisma.media.count();

    console.log('Products:', products);
    console.log('Categories:', categories);
    console.log('SEO Meta:', seoMeta);
    console.log('Schema Markup:', schemaMarkup);
    console.log('Redirects:', redirect);
    console.log('Inquiries:', inquiry);
    console.log('Blog Posts:', blogPost);
    console.log('Media:', media);
  } catch (error) {
    console.error('Error running count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
