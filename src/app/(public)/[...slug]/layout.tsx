import prisma from '@/lib/prisma';

export const revalidate = 3600;

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string[] };
}) {
  const page = '/' + params.slug.join('/');
  const schema = await prisma.schemaMarkup
    .findFirst({ where: { page, isActive: true }, select: { jsonLd: true } })
    .catch(() => null);

  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema.jsonLd }}
        />
      )}
      {children}
    </>
  );
}
