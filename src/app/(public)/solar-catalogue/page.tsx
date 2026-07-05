import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { solarCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/solar-catalogue', {
    title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
    description: 'Download the complete Polycab solar products catalogue — solar DC cables, solar panels, grid-tie inverters, and DC MCBs for residential and commercial solar installations.',
    openGraph: {
      title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
      description: 'Download the complete Polycab solar products catalogue — solar DC cables, solar panels, grid-tie inverters, and DC MCBs.',
      url: 'https://mohit.bdm.co.in/solar-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Solar Catalogue | Polycab Solar DC Cables & Panel Specs | Mohit Sales Corporation',
      description: 'Download the complete Polycab solar products catalogue.',
    },
    alternates: { canonical: 'https://mohit.bdm.co.in/solar-catalogue' },
  });
}

export default function SolarCataloguePage() {
  return <CatalogueGrid title="Solar" crumbLabel="Solar Catalogue" items={solarCatalogue} />;
}
