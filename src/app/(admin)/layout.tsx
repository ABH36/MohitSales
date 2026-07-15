import type { Metadata, Viewport } from 'next';
import '@/app/(public)/globals.css';

export const dynamic = 'force-dynamic';

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

export const metadata: Metadata = {
  title: 'Admin Panel — Mohit Sales Corporation',
  description: 'Mohit Industries Admin Dashboard',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167895/mohit/favicon/favicon.png" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
