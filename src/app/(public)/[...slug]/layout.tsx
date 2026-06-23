import prisma from '@/lib/prisma';

export const revalidate = 3600;

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string[] } | Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const page = '/' + resolvedParams.slug.join('/');
  const schema = await prisma.schemaMarkup
    .findFirst({ where: { page, isActive: true }, select: { jsonLd: true } })
    .catch(() => null);

  const safeJsonLd = schema?.jsonLd
    ? schema.jsonLd.replace(/<\/script>/gi, '<\\/script>')
    : '';

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd }}
        />
      )}
      {children}
    </>
  );
}
