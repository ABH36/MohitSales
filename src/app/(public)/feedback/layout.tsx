import { getSeoMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import SchemaInjector from '@/components/SchemaInjector';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('/feedback', {
  title: 'Feedback | Share Your Experience | Mohit Sales Corporation Pvt. Ltd.',
  description: 'Share your feedback and experience with Mohit Sales Corporation Pvt. Ltd. — authorized Polycab and Dowells distributor in Indore. Your feedback helps us serve you better.',
  openGraph: {
    title: 'Feedback | Share Your Experience | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Share your feedback and experience with Mohit Sales Corporation Pvt. Ltd. — authorized Polycab and Dowells distributor in Indore.',
    url: 'https://mohitscpl.com/feedback',
    siteName: 'Mohit Sales Corporation Pvt. Ltd.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feedback | Share Your Experience | Mohit Sales Corporation Pvt. Ltd.',
    description: 'Share your feedback with Mohit Sales Corporation Pvt. Ltd. — authorized Polycab and Dowells distributor in Indore.',
  },
  alternates: { canonical: 'https://mohitscpl.com/feedback' },
});
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaInjector page="/feedback" />
      {children}
    </>
  );
}
