import type { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo';
import CategoryLandingGrid from '@/components/CategoryLandingGrid';
import { getLandingItems } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/cable-terminal', {
    title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
    description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
    openGraph: {
      title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
      description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore. Premium copper and aluminium cable terminals for industrial and commercial applications.',
      url: 'https://mohitscpl.com/cable-terminal',
      siteName: 'Mohit Sales Corporation Pvt. Ltd.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Cable Terminals | Dowells Cable Lugs & Connectors | Mohit Sales Corporation',
      description: 'Authorized dealer of Dowells cable terminals, lugs, and connectors in Indore.',
    },
    alternates: { canonical: 'https://mohitscpl.com/cable-terminal' },
  });
}

export default async function CableTerminalPage() {
  const items = await getLandingItems('cable-terminal');
  return (
    <CategoryLandingGrid
      title="Cable Terminal"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dowells', href: '/dowells' }, { label: 'Cable Terminal' }]}
      items={items}
    />
  );
}
