<<<<<<< HEAD
import type { Metadata } from 'next';
import './tailwind.css';
import './admin/admin.css';
=======
import type { Metadata, Viewport } from 'next';
import '@/app/(public)/globals.css';

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
  };
}

>>>>>>> 370fcea (fast rendring)
export const metadata: Metadata = {
  title: 'Admin Panel — Mohit Sales Corporation',
  description: 'Mohit Industries Admin Dashboard',
};

<<<<<<< HEAD
export default function AdminLayout({
=======
export default function AdminRootLayout({
>>>>>>> 370fcea (fast rendring)
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en" dir="ltr">
      <head>
        {/* Google Fonts for Admin */}
=======
    <html lang="en">
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="/assets/images/favicon/favicon.png" />
>>>>>>> 370fcea (fast rendring)
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
<<<<<<< HEAD
      <body style={{
        fontFamily: "'Inter', sans-serif",
        background: '#f0f2f5',
        margin: 0,
        padding: 0,
      }}>
=======
      <body suppressHydrationWarning={true}>
>>>>>>> 370fcea (fast rendring)
        {children}
      </body>
    </html>
  );
}
