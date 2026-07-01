import { getSeoMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/crimping-tool', {
  title: 'Crimping Tools | Dowells Hand & Hydraulic Crimpers | Mohit Sales Corporation',
  description: 'Authorized dealer of Dowells crimping tools in Indore — hand crimping tools, hydraulic crimpers, and cable lug crimpers for copper and aluminium cable terminations.',
  openGraph: {
    title: 'Crimping Tools | Dowells Hand & Hydraulic Crimpers | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells crimping tools in Indore — hand crimping tools, hydraulic crimpers for copper and aluminium cable terminations.',
    url: 'https://mohit.bdm.co.in/crimping-tool',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crimping Tools | Dowells Hand & Hydraulic Crimpers | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells hand and hydraulic crimping tools in Indore.',
  },
  alternates: { canonical: 'https://mohit.bdm.co.in/crimping-tool' },
});
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/crimping-tool" />
      {children}
    </>
  );
}
