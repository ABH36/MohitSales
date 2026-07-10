import Link from 'next/link';
import AdminShell from '../components/AdminShell';
import prisma from '@/lib/prisma';
import { cld } from '@/lib/cloudinary';
import RecentInquiries, { type DashInquiry } from './RecentInquiries';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  try {
    const [
      productCount,
      categoryCount,
      inquiryCount,
      blogCount,
      mediaCount,
      userCount,
      recentInquiries,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.inquiry.count(),
      prisma.blogPost.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    // Serialize for the client component (Date -> ISO string).
    const inquiries: DashInquiry[] = recentInquiries.map((i) => ({
      id: i.id,
      name: i.name,
      company: i.company,
      email: i.email,
      mobile: i.mobile,
      message: i.message,
      status: i.status,
      source: i.source,
      createdAt: i.createdAt.toISOString(),
    }));

    return { productCount, categoryCount, inquiryCount, blogCount, mediaCount, userCount, inquiries };
  } catch (error) {
    console.error('[Dashboard] Error fetching stats:', error);
    return {
      productCount: 0, categoryCount: 0, inquiryCount: 0,
      blogCount: 0, mediaCount: 0, userCount: 0, inquiries: [] as DashInquiry[],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  // Each stat card links to the section it summarises.
  const cards = [
    { value: stats.productCount, label: 'Products', icon: '📦', cls: 'blue', href: '/admin/products' },
    { value: stats.categoryCount, label: 'Categories', icon: '📁', cls: 'orange', href: '/admin/categories' },
    { value: stats.inquiryCount, label: 'Inquiries', icon: '📩', cls: 'green', href: '/admin/inquiries' },
    { value: stats.blogCount, label: 'Blog Posts', icon: '📝', cls: 'purple', href: '/admin/blogs' },
    { value: stats.mediaCount, label: 'Media Files', icon: '🖼️', cls: 'red', href: '/admin/media' },
    { value: stats.userCount, label: 'Users', icon: '👥', cls: 'blue', href: '/admin/users' },
  ];

  return (
    <AdminShell pageTitle="Dashboard">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <img
          src={cld("https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167908/mohit/logo/msc_logo_without_bg.png", "f_auto,q_auto,w_320")}
          alt="Mohit Sales Corporation"
          className="admin-welcome-logo"
        />
      </div>

      {/* Stats Cards — each links to its section */}
      <div className="admin-stats-grid">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="admin-stat-link" aria-label={`Open ${c.label}`}>
            <div className="admin-stat-card admin-stat-card-clickable">
              <div>
                <div className="admin-stat-value">{c.value}</div>
                <div className="admin-stat-label">{c.label}</div>
              </div>
              <div className={`admin-stat-icon ${c.cls}`}>{c.icon}</div>
              <span className="admin-stat-go" aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries — click a row to read the full query */}
      <RecentInquiries inquiries={stats.inquiries} />
    </AdminShell>
  );
}
