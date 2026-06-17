import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/cables-catalogue" />
      {children}
    </>
  );
}
