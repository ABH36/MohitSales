import { getSeoMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/achievements', {
  title: 'Awards & Achievements | Mohit Sales Corporation Pvt. Ltd.',
  description: 'Discover the awards, recognitions, and milestones achieved by Mohit Sales Corporation Pvt. Ltd. — trusted Polycab and Dowells distributor in Indore since decades.',
  openGraph: {
    title: 'Awards & Achievements | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Discover the awards, recognitions, and milestones achieved by Mohit Sales Corporation Pvt. Ltd. — trusted Polycab and Dowells distributor in Indore.',
    url: 'https://mohitscpl.com/achievements',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Awards & Achievements | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Awards and recognitions earned by Mohit Sales Corporation Pvt. Ltd. — Polycab and Dowells distributor in Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/achievements' },
});
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/achievements" />
      {children}
    </>
  );
}
