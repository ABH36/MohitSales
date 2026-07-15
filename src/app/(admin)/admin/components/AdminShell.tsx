'use client';

import { useState, useEffect, useLayoutEffect, useRef, createContext, useContext } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// AdminShell is rendered per-page (each page wraps itself in it), so it
// remounts on every navigation — which resets the sidebar scroll back to the
// top. Persisting/restoring the scroll keeps the clicked item in view.
// useLayoutEffect on the client avoids a visible scroll flash.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import {
  LayoutDashboard,
  LineChart,
  FileEdit,
  FileText,
  Package,
  Folder,
  Mail,
  Newspaper,
  Globe,
  Image,
  Settings,
  Users,
  ChevronDown,
  LogOut
} from 'lucide-react';
import AdminCacheProvider, { prefetchUrl } from './AdminCacheProvider';
import '../admin.css';
import { cld } from '@/lib/cloudinary';

const PAGE_API_MAP: Record<string, string[]> = {
  '/admin/products': ['/api/admin/products?page=1&search=&limit=15&status=all&stock=', '/api/admin/categories'],
  '/admin/categories': ['/api/admin/categories'],
  '/admin/inquiries': ['/api/admin/inquiries'],
  '/admin/blogs': ['/api/admin/blogs', '/api/admin/blogs/categories'],
  '/admin/media': ['/api/admin/media'],
  '/admin/users': ['/api/admin/users', '/api/admin/roles'],
  '/admin/settings': ['/api/admin/settings'],
  '/admin/seo': ['/api/admin/seo/meta'],
  '/admin/analytics': ['/api/admin/analytics'],
  '/admin/cms': ['/api/admin/cms'],
  '/admin/pages': ['/api/admin/pages?page=1&limit=25'],
};

interface UserInfo {
  name: string;
  email: string;
  role?: string;
}

// Categories shown as a sub-nav under "Products" in the sidebar.
interface FlatCat { id: string; slug: string; label: string; depth: number; }
function flattenCats(cats: any[], parentLabel = '', depth = 0): FlatCat[] {
  const out: FlatCat[] = [];
  for (const c of cats || []) {
    const label = parentLabel ? `${parentLabel} > ${c.name}` : c.name;
    out.push({ id: c.id, slug: c.slug, label, depth });
    if (c.children?.length) out.push(...flattenCats(c.children, label, depth + 1));
  }
  return out;
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

// CMS Pages tabs, shown as a sidebar sub-nav (driven by ?tab=<key>).
const CMS_TABS: { key: string; label: string }[] = [
  { key: 'banners', label: 'Banners' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'promotions', label: 'Promotions & Popups' },
  { key: 'about-us', label: 'About Us' },
  { key: 'company-profile', label: 'Company Profile' },
];

// SEO Manager tabs, shown as a sidebar sub-nav (driven by ?tab=<key>).
const SEO_TABS: { key: string; label: string }[] = [
  { key: 'webmaster', label: 'Webmaster Tools' },
  { key: 'meta', label: 'Page Meta Tags' },
  { key: 'redirects', label: 'Redirects' },
  { key: 'schema', label: 'Schema Markup' },
  { key: 'sitemap', label: 'Sitemap' },
  { key: 'robots', label: 'Robots.txt' },
  { key: 'logs404', label: '404 Logs' },
];

// Settings tabs, shown as a sidebar sub-nav (driven by ?tab=<key>).
const SETTINGS_TABS: { key: string; label: string }[] = [
  { key: 'site', label: 'Site Config' },
  { key: 'webmaster', label: 'Webmaster Tools' },
  { key: 'account', label: 'My Account' },
];

const navItems = [
  {
    section: 'Main', items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: LineChart },
    ]
  },
  {
    section: 'Content', items: [
      { label: 'CMS Pages', href: '/admin/cms', icon: FileEdit },
      { label: 'Page Content', href: '/admin/pages', icon: FileText },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Folder },
      { label: 'Inquiries', href: '/admin/inquiries', icon: Mail },
      { label: 'Blog Posts', href: '/admin/blogs', icon: Newspaper },
    ]
  },
  {
    section: 'SEO', items: [
      { label: 'SEO Manager', href: '/admin/seo', icon: Globe },
    ]
  },
  {
    section: 'System', items: [
      { label: 'Media Library', href: '/admin/media', icon: Image },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Users', href: '/admin/users', icon: Users },
    ]
  },
];

export default function AdminShell({ children, pageTitle }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const onProducts = pathname === '/admin/products';
  const onAnalytics = pathname === '/admin/analytics';
  const activeAnalyticsTab = searchParams.get('tab') === 'google' ? 'google' : 'database';
  const onCms = pathname === '/admin/cms';
  const activeCmsTab = searchParams.get('tab') || 'banners';
  const onSeo = pathname === '/admin/seo';
  const activeSeoTab = searchParams.get('tab') || 'webmaster';
  const onSettings = pathname === '/admin/settings';
  const activeSettingsTab = searchParams.get('tab') || 'site';
  const [categories, setCategories] = useState<FlatCat[]>([]);
  const [productsOpen, setProductsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [cmsOpen, setCmsOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keep the sidebar scrolled to where the user left it across navigations
  // (AdminShell remounts per page, so without this it snaps back to the top).
  // The scrollable element is the sidebar aside itself.
  useIsomorphicLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem('admin-sidebar-scroll');
    if (saved) el.scrollTop = parseInt(saved, 10) || 0;
    const onScroll = () => {
      try { sessionStorage.setItem('admin-sidebar-scroll', String(el.scrollTop)); } catch {}
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

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

  // Auto-expand the Products sub-nav whenever we're on the products page.
  useEffect(() => {
    if (onProducts) setProductsOpen(true);
  }, [onProducts]);

  // Auto-expand the Analytics sub-nav whenever we're on the analytics page.
  useEffect(() => {
    if (onAnalytics) setAnalyticsOpen(true);
  }, [onAnalytics]);

  // Auto-expand the CMS Pages sub-nav whenever we're on that page.
  useEffect(() => {
    if (onCms) setCmsOpen(true);
  }, [onCms]);

  // Auto-expand the SEO Manager sub-nav whenever we're on that page.
  useEffect(() => {
    if (onSeo) setSeoOpen(true);
  }, [onSeo]);

  // Auto-expand the Settings sub-nav whenever we're on that page.
  useEffect(() => {
    if (onSettings) setSettingsOpen(true);
  }, [onSettings]);

  // Load categories once (session-cached) to populate the Products sub-nav.
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('admin_cats_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000 && Array.isArray(parsed.cats)) {
          setCategories(parsed.cats);
          return;
        }
      }
    } catch { /* ignore cache errors */ }
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const flat = flattenCats(data.data);
          setCategories(flat);
          try { sessionStorage.setItem('admin_cats_cache', JSON.stringify({ cats: flat, timestamp: Date.now() })); } catch {}
        }
      })
      .catch(() => { /* sidebar sub-nav is optional; ignore */ });
  }, []);

  // Focus mode — hide the sidebar + top bar to view content full-screen.
  // Persisted so it stays as you move between sections.
  useEffect(() => {
    setFocusMode(localStorage.getItem('admin-focus-mode') === 'on');
  }, []);

  const toggleFocus = (on: boolean) => {
    setFocusMode(on);
    localStorage.setItem('admin-focus-mode', on ? 'on' : 'off');
  };

  // Close sidebar and profile dropdown on ESC key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setDropdownOpen(false);
        setFocusMode(false);
        localStorage.setItem('admin-focus-mode', 'off');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close sidebar and profile dropdown when route changes (mobile nav click)
  useEffect(() => {
    setSidebarOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

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
    let hasCache = false;
    try {
      const cached = sessionStorage.getItem('admin_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < 5 * 60 * 1000 && parsed.user) {
          setUser(parsed.user);
          setLoading(false);
          hasCache = true;
        }
      }
    } catch (e) {
      console.error('[AdminShell Cache GET Error]:', e);
    }

    const revalidate = () => {
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
            router.push('/admin/login');
          }
        })
        .catch(err => {
          console.error('Error fetching current user:', err);
          if (!hasCache) {
            sessionStorage.removeItem('admin_user_cache');
            router.push('/admin/login');
          }
        })
        .finally(() => {
          if (!hasCache) setLoading(false);
        });
    };

    if (hasCache) {
      const delay = setTimeout(revalidate, 3000);
      return () => clearTimeout(delay);
    } else {
      revalidate();
    }
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
    <AdminCacheProvider>
    <AdminContext.Provider value={{ user, loading }}>
      <div className="admin-panel" data-font-size={fontSize} data-focus={focusMode ? 'on' : 'off'} dir="ltr">
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
                fontSize: 'calc(var(--admin-fs) + 1px)',
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
                src={cld("https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167908/mohit/logo/msc_logo_without_bg.png", "f_auto,q_auto,w_320")}
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
                    const IconComponent = item.icon as any;
                    const handlePrefetch = () => {
                      const apis = PAGE_API_MAP[item.href];
                      if (apis) apis.forEach(url => prefetchUrl(url));
                    };

                    // Settings is an expandable group: its tabs render as a
                    // sub-nav instead of an in-page tab bar.
                    if (item.href === '/admin/settings') {
                      return (
                        <div key={item.href} className="admin-nav-group">
                          <div className="admin-nav-item-row">
                            <Link
                              href="/admin/settings"
                              scroll={false}
                              className={`admin-nav-link ${onSettings ? 'active' : ''}`}
                              onMouseEnter={handlePrefetch}
                            >
                              <span className="admin-nav-icon"><IconComponent size={20} strokeWidth={2} /></span>
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className={`admin-nav-expand ${settingsOpen ? 'open' : ''}`}
                              onClick={() => setSettingsOpen(o => !o)}
                              aria-label={settingsOpen ? 'Collapse settings tabs' : 'Expand settings tabs'}
                              aria-expanded={settingsOpen}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          {settingsOpen && (
                            <div className="admin-nav-sublist">
                              {SETTINGS_TABS.map(t => (
                                <Link
                                  key={t.key}
                                  href={t.key === 'site' ? '/admin/settings' : `/admin/settings?tab=${t.key}`}
                                  scroll={false}
                                  className={`admin-nav-sublink depth-0 ${onSettings && activeSettingsTab === t.key ? 'active' : ''}`}
                                >
                                  {t.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // SEO Manager is an expandable group: its tabs render as a
                    // sub-nav instead of an in-page tab bar.
                    if (item.href === '/admin/seo') {
                      return (
                        <div key={item.href} className="admin-nav-group">
                          <div className="admin-nav-item-row">
                            <Link
                              href="/admin/seo"
                              scroll={false}
                              className={`admin-nav-link ${onSeo ? 'active' : ''}`}
                              onMouseEnter={handlePrefetch}
                            >
                              <span className="admin-nav-icon"><IconComponent size={20} strokeWidth={2} /></span>
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className={`admin-nav-expand ${seoOpen ? 'open' : ''}`}
                              onClick={() => setSeoOpen(o => !o)}
                              aria-label={seoOpen ? 'Collapse SEO tabs' : 'Expand SEO tabs'}
                              aria-expanded={seoOpen}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          {seoOpen && (
                            <div className="admin-nav-sublist">
                              {SEO_TABS.map(t => (
                                <Link
                                  key={t.key}
                                  href={t.key === 'webmaster' ? '/admin/seo' : `/admin/seo?tab=${t.key}`}
                                  scroll={false}
                                  className={`admin-nav-sublink depth-0 ${onSeo && activeSeoTab === t.key ? 'active' : ''}`}
                                >
                                  {t.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // CMS Pages is an expandable group: its tabs render as a
                    // sub-nav instead of an in-page tab bar.
                    if (item.href === '/admin/cms') {
                      return (
                        <div key={item.href} className="admin-nav-group">
                          <div className="admin-nav-item-row">
                            <Link
                              href="/admin/cms"
                              scroll={false}
                              className={`admin-nav-link ${onCms ? 'active' : ''}`}
                              onMouseEnter={handlePrefetch}
                            >
                              <span className="admin-nav-icon"><IconComponent size={20} strokeWidth={2} /></span>
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className={`admin-nav-expand ${cmsOpen ? 'open' : ''}`}
                              onClick={() => setCmsOpen(o => !o)}
                              aria-label={cmsOpen ? 'Collapse CMS tabs' : 'Expand CMS tabs'}
                              aria-expanded={cmsOpen}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          {cmsOpen && (
                            <div className="admin-nav-sublist">
                              {CMS_TABS.map(t => (
                                <Link
                                  key={t.key}
                                  href={t.key === 'banners' ? '/admin/cms' : `/admin/cms?tab=${t.key}`}
                                  scroll={false}
                                  className={`admin-nav-sublink depth-0 ${onCms && activeCmsTab === t.key ? 'active' : ''}`}
                                >
                                  {t.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Analytics is an expandable group: its two views render as
                    // a sub-nav instead of an in-page tab bar.
                    if (item.href === '/admin/analytics') {
                      return (
                        <div key={item.href} className="admin-nav-group">
                          <div className="admin-nav-item-row">
                            <Link
                              href="/admin/analytics"
                              scroll={false}
                              className={`admin-nav-link ${onAnalytics ? 'active' : ''}`}
                              onMouseEnter={handlePrefetch}
                            >
                              <span className="admin-nav-icon"><IconComponent size={20} strokeWidth={2} /></span>
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className={`admin-nav-expand ${analyticsOpen ? 'open' : ''}`}
                              onClick={() => setAnalyticsOpen(o => !o)}
                              aria-label={analyticsOpen ? 'Collapse analytics views' : 'Expand analytics views'}
                              aria-expanded={analyticsOpen}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          {analyticsOpen && (
                            <div className="admin-nav-sublist">
                              <Link
                                href="/admin/analytics"
                                scroll={false}
                                className={`admin-nav-sublink depth-0 ${onAnalytics && activeAnalyticsTab === 'database' ? 'active' : ''}`}
                              >
                                Database Metrics
                              </Link>
                              <Link
                                href="/admin/analytics?tab=google"
                                scroll={false}
                                className={`admin-nav-sublink depth-0 ${onAnalytics && activeAnalyticsTab === 'google' ? 'active' : ''}`}
                              >
                                Google Analytics
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Products is an expandable group: its categories render as
                    // a sub-nav so they don't take horizontal space on the page.
                    if (item.href === '/admin/products') {
                      return (
                        <div key={item.href} className="admin-nav-group">
                          <div className="admin-nav-item-row">
                            <Link
                              href="/admin/products"
                              scroll={false}
                              className={`admin-nav-link ${onProducts ? 'active' : ''}`}
                              onMouseEnter={handlePrefetch}
                            >
                              <span className="admin-nav-icon"><IconComponent size={20} strokeWidth={2} /></span>
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              className={`admin-nav-expand ${productsOpen ? 'open' : ''}`}
                              onClick={() => setProductsOpen(o => !o)}
                              aria-label={productsOpen ? 'Collapse categories' : 'Expand categories'}
                              aria-expanded={productsOpen}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          {productsOpen && (
                            <div className="admin-nav-sublist">
                              <Link
                                href="/admin/products"
                                scroll={false}
                                className={`admin-nav-sublink depth-0 ${onProducts && !activeCategory ? 'active' : ''}`}
                              >
                                All Products
                              </Link>
                              {categories.map(cat => (
                                <Link
                                  key={cat.id}
                                  href={`/admin/products?category=${cat.id}`}
                                  scroll={false}
                                  className={`admin-nav-sublink depth-${cat.depth} ${onProducts && activeCategory === cat.id ? 'active' : ''}`}
                                  title={cat.label}
                                >
                                  {cat.label.split(' > ').pop()}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        scroll={false}
                        className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
                        onMouseEnter={handlePrefetch}
                      >
                        <span className="admin-nav-icon">
                          {typeof IconComponent === 'string' ? (
                            IconComponent.startsWith('la') ? (
                              <i className={IconComponent} style={{ fontSize: '1.25rem' }}></i>
                            ) : (
                              IconComponent
                            )
                          ) : (
                            <IconComponent size={20} strokeWidth={2} />
                          )}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar Footer removed since profile is moved to Topbar */}
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

                <button
                  type="button"
                  onClick={() => toggleFocus(!focusMode)}
                  className="admin-btn admin-btn-outline admin-btn-sm admin-focus-btn"
                  title="Focus mode — hide the sidebar for a wider view (Esc to exit)"
                  aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
                  aria-pressed={focusMode}
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  {focusMode ? '⤢ Exit Focus' : '⛶ Focus'}
                </button>

                <a
                  href="/"
                  target="_blank"
                  className="admin-btn admin-btn-outline admin-btn-sm admin-view-site-btn"
                  style={{ pointerEvents: 'auto' }}
                >
                  🌐 View Site
                </a>

                {/* Redesigned Admin Profile Dropdown */}
                <div className="admin-profile-menu" ref={dropdownRef}>
                  <button
                    type="button"
                    className="admin-profile-trigger"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <div className="admin-profile-avatar">
                      {(user?.name || user?.email || 'A')[0].toUpperCase()}
                    </div>
                    <div className="admin-profile-meta">
                      <span className="admin-profile-name">{user?.name || 'Admin'}</span>
                      <span className="admin-profile-role">{user?.role || 'Staff'}</span>
                    </div>
                    <ChevronDown size={14} className={`admin-profile-chevron ${dropdownOpen ? 'open' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="admin-profile-dropdown">
                      <div className="admin-dropdown-header">
                        <p className="admin-dropdown-name">{user?.name || 'Admin'}</p>
                        <p className="admin-dropdown-email">{user?.email || 'admin@mohitscpl.com'}</p>
                        {user?.role && <span className="admin-dropdown-role-badge">{user.role}</span>}
                      </div>
                      <div className="admin-dropdown-divider" />
                      <a href="/" target="_blank" className="admin-dropdown-item">
                        <Globe size={14} /> View Website
                      </a>
                      <div className="admin-dropdown-divider" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="admin-dropdown-item admin-dropdown-logout"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
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
    </AdminCacheProvider>
  );
}
