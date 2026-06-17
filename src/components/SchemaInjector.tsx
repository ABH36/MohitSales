import prisma from '@/lib/prisma';

export const revalidate = 3600;

export default async function SchemaInjector({ page }: { page: string }) {
  const schemas = await prisma.schemaMarkup
    .findMany({ where: { page, isActive: true }, select: { id: true, jsonLd: true } })
    .catch(() => []);
  if (!schemas.length) return null;
  return (
    <>
      {schemas.map((schema) => {
        // Escape </script> to prevent script tag injection (valid JSON, XSS vector)
        const safeJsonLd = schema.jsonLd.replace(/<\/script>/gi, '<\\/script>');
        return (
          <script
            key={schema.id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd }}
          />
        );
      })}
    </>
  );
}
