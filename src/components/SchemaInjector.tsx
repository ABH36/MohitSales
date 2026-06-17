import prisma from '@/lib/prisma';

export const revalidate = 3600;

export default async function SchemaInjector({ page }: { page: string }) {
  const schema = await prisma.schemaMarkup
    .findFirst({ where: { page, isActive: true }, select: { jsonLd: true } })
    .catch(() => null);
  if (!schema) return null;
  // Escape </script> to prevent script tag injection (valid JSON, XSS vector)
  const safeJsonLd = schema.jsonLd.replace(/<\/script>/gi, '<\\/script>');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd }}
    />
  );
}
