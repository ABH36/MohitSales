import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { fansCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/fans-catalogue', {
    title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
    description: 'Browse the complete Polycab fans catalogue — ceiling fans, table fans, wall fans, exhaust fans, and BLDC energy-saving fans. Download product brochures.',
    openGraph: {
      title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
      description: 'Browse the complete Polycab fans catalogue — ceiling fans, table fans, wall fans, exhaust fans, and BLDC energy-saving fans.',
      url: 'https://mohitscpl.com/fans-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Fans Catalogue | Polycab Ceiling, Table & Exhaust Fans | Mohit Sales Corporation',
      description: 'Browse the complete Polycab fans catalogue — ceiling, table, wall, exhaust, and BLDC fans.',
    },
    alternates: { canonical: 'https://mohitscpl.com/fans-catalogue' },
  });
}

export default function FansCataloguePage() {
  return <CatalogueGrid title="Fans" crumbLabel="Fans Catalogue" items={fansCatalogue} />;
}
