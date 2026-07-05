import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { conduitCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/conduit-catalogue', {
    title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
    description: 'Browse the complete Polycab conduit catalogue — UPVC conduit pipes, fittings, and accessories. Download product specifications and datasheets.',
    openGraph: {
      title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Browse the complete Polycab conduit catalogue — UPVC conduit pipes, fittings, and accessories.',
      url: 'https://mohit.bdm.co.in/conduit-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conduit Catalogue | Polycab UPVC Conduit Pipes | Mohit Sales Corporation',
      description: 'Browse the complete Polycab conduit catalogue.',
    },
    alternates: { canonical: 'https://mohit.bdm.co.in/conduit-catalogue' },
  });
}

export default function ConduitCataloguePage() {
  return <CatalogueGrid title="Conduit & Accessories" crumbLabel="Conduit & Accessories Catalogue" items={conduitCatalogue} />;
}
