'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import '../admin.css';

interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

interface AdminContextType {
  user: UserInfo | null;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({ user: null, loading: true });

export function useAdmin() {
  return useContext(AdminContext);
}

interface AdminShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

const navItems = [
  {
    section: 'Main', items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    ]
  },
  {
    section: 'Content', items: [
      { label: 'Products', href: '/admin/products', icon: '📦' },
      { label: 'Categories', href: '/admin/categories', icon: '📁' },
      { label: 'Inquiries', href: '/admin/inquiries', icon: '📩' },
      { label: 'Blog Posts', href: '/admin/blogs', icon: '📝' },
    ]
  },
  {
    section: 'System', items: [
      { label: 'Media Library', href: '/admin/media', icon: '🖼️' },
      { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
      { label: 'Users', href: '/admin/users', icon: '👥' },
    ]
  },
];

export default function AdminShell({ children, pageTitle }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal');

  useEffect(() => {
    // Load font size from localStorage
    const savedSize = localStorage.getItem('admin-font-size') as 'normal' | 'medium' | 'large';
    if (savedSize && ['normal', 'medium', 'large'].includes(savedSize)) {
      setFontSize(savedSize);
    }
  }, []);

  const changeFontSize = (size: 'normal' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('admin-font-size', size);
  };

  useEffect(() => {
    // 5-min profile cache in sessionStorage to prevent DB query delays
    try {
      const cached = sessionStorage.getItem('admin_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 5 * 60 * 1000 && parsed.user) {
          setUser(parsed.user);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('[AdminShell Cache GET Error]:', e);
    }

    fetch('/api/admin/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
          try {
            sessionStorage.setItem('admin_user_cache', JSON.stringify({
              user: data.user,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('[AdminShell Cache SET Error]:', e);
          }
        } else {
          sessionStorage.removeItem('admin_user_cache');
        }
      })
      .catch(err => {
        console.error('Error fetching current user:', err);
        sessionStorage.removeItem('admin_user_cache');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('admin_user_cache');
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <AdminContext.Provider value={{ user, loading }}>
      <div className="admin-panel" data-font-size={fontSize}>
        {/* Animated Background */}
        <div className="admin-bg-animation">
          <div className="admin-blob blob-1"></div>
          <div className="admin-blob blob-2"></div>
          <div className="admin-blob blob-3"></div>
        </div>

        <div className="admin-container">
          {/* Sidebar */}
          <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="admin-sidebar-header">
              <img src="/assets/images/logo/msc_logo_without_bg.png" alt="Mohit Sales Corporation Logo" className="admin-sidebar-logo-large" />
            </div>

            <nav className="admin-sidebar-nav">
              {navItems.map((section) => (
                <div key={section.section} className="admin-nav-section">
                  <div className="admin-nav-section-title">{section.section}</div>
                  {section.items.map((item) => {
                    // Hide Users item for non-admin accounts to enforce RBAC
                    if (item.href === '/admin/users' && user?.role !== 'ADMIN') {
                      return null;
                    }
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="admin-nav-icon">{item.icon}</span>
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="admin-sidebar-footer">
              <div className="admin-user-card">
                <div className="admin-user-avatar">
                  {(user?.name || user?.email || 'A')[0].toUpperCase()}
                </div>
                <div className="admin-user-info">
                  <p>{user?.name || 'Admin'}{user?.role ? ` (${user.role})` : ''}</p>
                  <span>{user?.email || 'admin@mohitscpl.com'}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="admin-main">
            <header className="admin-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  ☰
                </button>
                <h1 className="admin-topbar-title">{pageTitle}</h1>
              </div>
              <div className="admin-topbar-actions">
                <div className="admin-font-toggle" title="Accessibility: Text Size">
                  <button
                    onClick={() => changeFontSize('normal')}
                    className={`admin-font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                    aria-label="Normal text size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => changeFontSize('medium')}
                    className={`admin-font-btn ${fontSize === 'medium' ? 'active' : ''}`}
                    aria-label="Medium text size"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => changeFontSize('large')}
                    className={`admin-font-btn ${fontSize === 'large' ? 'active' : ''}`}
                    aria-label="Large text size"
                  >
                    A++
                  </button>
                </div>

                <a href="/" target="_blank" className="admin-btn admin-btn-outline admin-btn-sm">
                  🌐 View Site
                </a>
                <button onClick={handleLogout} className="admin-btn admin-btn-logout">
                  Logout
                </button>
              </div>
            </header>
            <div className="admin-content">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 99
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </AdminContext.Provider>
  );
}

