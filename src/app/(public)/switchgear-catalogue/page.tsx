import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CatalogueGrid from '@/components/CatalogueGrid';
import { switchgearCatalogue } from '@/data/catalogues';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/switchgear-catalogue', {
    title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
    description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs, distribution boards, and protection devices for residential, commercial, and industrial use.',
    openGraph: {
      title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
      description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs, distribution boards, and protection devices.',
      url: 'https://mohitscpl.com/switchgear-catalogue',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Switchgear Catalogue | Polycab MCBs, RCCBs & DBs | Mohit Sales Corporation',
      description: 'Download the complete Polycab switchgear catalogue — MCBs, RCCBs, MCCBs and distribution boards.',
    },
    alternates: { canonical: 'https://mohitscpl.com/switchgear-catalogue' },
  });
}

export default function SwitchgearCataloguePage() {
  return <CatalogueGrid title="Switchgear" crumbLabel="Switchgear Catalogue" items={switchgearCatalogue} />;
}
