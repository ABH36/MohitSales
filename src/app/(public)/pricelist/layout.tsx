import { schemaLayout } from '@/components/PageSchema';
import { getSeoMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/pricelist', {
  title: 'Price List | Polycab & Dowells Products | Mohit Sales Corporation',
  description: 'Download the latest Polycab wires, cables, fans, switchgear and Dowells cable terminal price lists. Updated pricing for authorized dealer Mohit Sales Corporation Pvt. Ltd., Indore.',
  openGraph: {
    title: 'Price List | Polycab & Dowells Products | Mohit Sales Corporation',
    description: 'Download the latest Polycab and Dowells price lists — wires, cables, fans, switchgear, and cable terminals. Authorized dealer in Indore.',
    url: 'https://mohitscpl.com/pricelist',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Price List | Polycab & Dowells Products | Mohit Sales Corporation',
    description: 'Download the latest Polycab and Dowells price lists from authorized dealer Mohit Sales Corporation, Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/pricelist' },
});
};

export default schemaLayout('/pricelist');
