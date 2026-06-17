'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
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
      { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
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
    section: 'SEO', items: [
      { label: 'SEO Manager', href: '/admin/seo', icon: '🔍' },
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
  const sidebarRef = useRef<HTMLElement>(null);

  // Load font size preference from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem('admin-font-size') as 'normal' | 'medium' | 'large';
    if (savedSize && ['normal', 'medium', 'large'].includes(savedSize)) {
      setFontSize(savedSize);
    }
  }, []);

  const changeFontSize = (size: 'normal' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('admin-font-size', size);
  };

  // Close sidebar on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close sidebar when route changes (mobile nav click)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on outside click
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };
    // Slight delay so the toggle button click doesn't immediately re-close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sidebarOpen]);

  // Fetch authenticated user
  useEffect(() => {
    // 5-min profile cache in sessionStorage to prevent DB query delays
    let hasCache = false;
    try {
      const cached = sessionStorage.getItem('admin_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 5 * 60 * 1000 && parsed.user) {
          setUser(parsed.user);
          setLoading(false);
          hasCache = true; // Use cache for immediate render, but run background fetch to revalidate
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
          // Auth failed — clear cache and redirect to login
          sessionStorage.removeItem('admin_user_cache');
          router.push('/admin/login');
        }
      })
      .catch(err => {
        console.error('Error fetching current user:', err);
        // If we have a cache and it was a network failure, we don't immediately evict/redirect (resilient offline behavior)
        if (!hasCache) {
          sessionStorage.removeItem('admin_user_cache');
          router.push('/admin/login');
        }
      })
      .finally(() => {
        if (!hasCache) setLoading(false);
      });
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

  // Hamburger toggle — stopPropagation prevents outside-click listener from firing
  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSidebarOpen(prev => !prev);
  };

  return (
    <AdminContext.Provider value={{ user, loading }}>
      <div className="admin-panel" data-font-size={fontSize} dir="ltr">
        {/* Animated Background */}
        <div className="admin-bg-animation">
          <div className="admin-blob blob-1"></div>
          <div className="admin-blob blob-2"></div>
          <div className="admin-blob blob-3"></div>
        </div>

        <div className="admin-container">
          {/* Sidebar */}
          <aside
            ref={sidebarRef}
            className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
          >
            {/* Sidebar close button on mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: 8,
                width: 32,
                height: 32,
                fontSize: 16,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                zIndex: 101,
              }}
              className="admin-sidebar-close-btn"
            >
              ✕
            </button>

            <div className="admin-sidebar-header">
              <img
                src="/assets/images/logo/msc_logo_without_bg.png"
                alt="Mohit Sales Corporation Logo"
                className="admin-sidebar-logo-large"
              />
            </div>

            <nav className="admin-sidebar-nav">
              {navItems.map((section) => (
                <div key={section.section} className="admin-nav-section">
                  <div className="admin-nav-section-title">{section.section}</div>
                  {section.items.map((item) => {
                    // Hide Users item for non-admin accounts
                    if (item.href === '/admin/users' && user?.role !== 'ADMIN') {
                      return null;
                    }
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {/* Hamburger — inline styles force pointer-events over any global CSS */}
                <button
                  type="button"
                  className="admin-mobile-toggle"
                  onClick={handleToggleSidebar}
                  aria-label="Toggle navigation menu"
                  aria-expanded={sidebarOpen}
                  style={{
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    zIndex: 60,
                    position: 'relative',
                    userSelect: 'none',
                    display: undefined, /* let CSS control this */
                    flexShrink: 0,
                  }}
                >
                  {sidebarOpen ? '✕' : '☰'}
                </button>
                <h1 className="admin-topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitle}</h1>
              </div>
              <div className="admin-topbar-actions">
                {/* Font size controls */}
                <div className="admin-font-toggle" title="Accessibility: Text Size">
                  <button
                    type="button"
                    onClick={() => changeFontSize('normal')}
                    className={`admin-font-btn ${fontSize === 'normal' ? 'active' : ''}`}
                    aria-label="Normal text size"
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => changeFontSize('medium')}
                    className={`admin-font-btn ${fontSize === 'medium' ? 'active' : ''}`}
                    aria-label="Medium text size"
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => changeFontSize('large')}
                    className={`admin-font-btn ${fontSize === 'large' ? 'active' : ''}`}
                    aria-label="Large text size"
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    A++
                  </button>
                </div>

                <a
                  href="/"
                  target="_blank"
                  className="admin-btn admin-btn-outline admin-btn-sm admin-view-site-btn"
                  style={{ pointerEvents: 'auto' }}
                >
                  🌐 View Site
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="admin-btn admin-btn-logout"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            </header>
            <div className="admin-content">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile overlay — click to close sidebar */}
        {sidebarOpen && (
          <div
            className="admin-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </div>

    </AdminContext.Provider>
  );
}
