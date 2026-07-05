import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { cablesCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/cables-catalogue', {
    title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
    description: 'Browse the complete Polycab cables catalogue — power cables, armoured cables, XLPE cables, control cables, and flexible cables. Download datasheets and specifications.',
    openGraph: {
      title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
      description: 'Browse the complete Polycab cables catalogue — power cables, armoured cables, XLPE cables, control cables, and flexible cables.',
      url: 'https://mohitscpl.com/cables-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cables Catalogue | Polycab Power & Control Cables | Mohit Sales Corporation',
      description: 'Browse the complete Polycab cables catalogue — power, armoured, XLPE, and control cables.',
    },
    alternates: { canonical: 'https://mohitscpl.com/cables-catalogue' },
  });
}

export default function CablesCataloguePage() {
  return <CatalogueGrid title="Cables" crumbLabel="Cables Catalogue" items={cablesCatalogue} />;
}
