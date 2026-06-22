import type { Metadata } from 'next';
import './tailwind.css';
import './admin/admin.css';
export const metadata: Metadata = {
  title: 'Admin Panel — Mohit Sales Corporation',
  description: 'Mohit Industries Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Google Fonts for Admin */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        fontFamily: "'Inter', sans-serif",
        background: '#f0f2f5',
        margin: 0,
        padding: 0,
      }}>
        {children}
      </body>
    </html>
  );
}
