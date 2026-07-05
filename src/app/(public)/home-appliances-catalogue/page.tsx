import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { homeAppliancesCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/home-appliances-catalogue', {
    title: 'Home Appliances Catalogue | Polycab Water Heaters & Appliances | Mohit Sales Corporation',
    description: 'Download the complete Polycab home appliances catalogue — water heaters, irons, coolers, and household electrical appliances for homes and offices.',
    openGraph: {
      title: 'Home Appliances Catalogue | Polycab Water Heaters & Appliances | Mohit Sales Corporation',
      description: 'Download the complete Polycab home appliances catalogue — water heaters, irons, coolers, and household electrical appliances.',
      url: 'https://mohit.bdm.co.in/home-appliances-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Home Appliances Catalogue | Polycab Water Heaters & Appliances | Mohit Sales Corporation',
      description: 'Download the complete Polycab home appliances catalogue.',
    },
    alternates: { canonical: 'https://mohit.bdm.co.in/home-appliances-catalogue' },
  });
}

export default function HomeAppliancesCataloguePage() {
  return <CatalogueGrid title="Home Appliances" crumbLabel="Home Appliances Catalogue" items={homeAppliancesCatalogue} />;
}
