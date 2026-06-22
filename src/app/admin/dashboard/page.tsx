import AdminShell from '../components/AdminShell';
import prisma from '@/lib/prisma';

async function getDashboardStats() {
  try {
    const [
      newProductCount,
      legacyProductCount,
      categoryCount,
      inquiryCount,
      blogCount,
      mediaCount,
      userCount,
      settingCount,
      recentInquiries,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.pageContent.count(),
      prisma.category.count(),
      prisma.inquiry.count(),
      prisma.blogPost.count(),
      prisma.media.count(),
      prisma.user.count(),
      prisma.setting.count(),
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const productCount = newProductCount + legacyProductCount;

    return {
      productCount,
      categoryCount,
      inquiryCount,
      blogCount,
      mediaCount,
      userCount,
      settingCount,
      recentInquiries,
    };
  } catch (error) {
    console.error('[Dashboard] Error fetching stats:', error);
    return {
      productCount: 0,
      categoryCount: 0,
      inquiryCount: 0,
      blogCount: 0,
      mediaCount: 0,
      userCount: 0,
      settingCount: 0,
      recentInquiries: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AdminShell pageTitle="Dashboard">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <img
          src="/assets/images/logo/msc_logo_without_bg.png"
          alt="Mohit Sales Corporation"
          className="admin-welcome-logo"
        />
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.productCount}</div>
            <div className="admin-stat-label">Products</div>
          </div>
          <div className="admin-stat-icon blue">📦</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.categoryCount}</div>
            <div className="admin-stat-label">Categories</div>
          </div>
          <div className="admin-stat-icon orange">📁</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.inquiryCount}</div>
            <div className="admin-stat-label">Inquiries</div>
          </div>
          <div className="admin-stat-icon green">📩</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.blogCount}</div>
            <div className="admin-stat-label">Blog Posts</div>
          </div>
          <div className="admin-stat-icon purple">📝</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.mediaCount}</div>
            <div className="admin-stat-label">Media Files</div>
          </div>
          <div className="admin-stat-icon red">🖼️</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{stats.userCount}</div>
            <div className="admin-stat-label">Users</div>
          </div>
          <div className="admin-stat-icon blue">👥</div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Recent Inquiries</h3>
          <a href="/admin/inquiries" className="admin-btn admin-btn-outline admin-btn-sm">
            View All →
          </a>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentInquiries.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              stats.recentInquiries.map((inq) => (
                <tr key={inq.id}>
                  <td style={{ fontWeight: 600 }}>{inq.name}</td>
                  <td>{inq.company}</td>
                  <td>{inq.email}</td>
                  <td>
                    <span className={`admin-badge ${inq.status === 'new' ? 'admin-badge-info' :
                      inq.status === 'read' ? 'admin-badge-warning' :
                        inq.status === 'replied' ? 'admin-badge-success' :
                          'admin-badge-danger'
                      }`}>
                      {inq.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: '#718096', fontSize: '12px' }}>
                    {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
