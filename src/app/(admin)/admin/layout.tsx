import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      dir="ltr"
      id="admin-layout-root"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}
