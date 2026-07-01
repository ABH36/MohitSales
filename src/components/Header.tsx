'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePublicSettings } from './PublicSettingsContext';


interface NavItem {
  id: string;
  slug: string;
  name: string;
  image?: string | null;
  description?: string | null;
  children: NavItem[];
}

const DEFAULT_MENU_TREE: NavItem[] = [
  {
    id: 'polycab-static',
    slug: 'polycab',
    name: 'Polycab',
    children: [
      {
        id: 'cba-static',
        slug: 'polycab/cables-by-application',
        name: 'Cables By Application',
        children: [
          { id: 'cba-1', name: 'Building Infrastructure', slug: 'polycab/cables-by-application/building-infrastructure', children: [] },
          { id: 'cba-2', name: 'Energy And Power Grid', slug: 'polycab/cables-by-application/energy-and-power-grid', children: [] },
          { id: 'cba-3', name: 'Exploration Industries', slug: 'polycab/cables-by-application/exploration-industries', children: [] },
          { id: 'cba-4', name: 'Manufacturing Industries', slug: 'polycab/cables-by-application/manufacturing-industries', children: [] },
          { id: 'cba-5', name: 'Mobility Infrastructure', slug: 'polycab/cables-by-application/mobility-infrastructure', children: [] }
        ]
      },
      {
        id: 'cbs-static',
        slug: 'polycab/cables-by-standards',
        name: 'Cables By Standards',
        children: [
          { id: 'cbs-1', name: 'Indian Standards (IS)', slug: 'polycab/cables-by-standards/indian-standards', children: [] },
          { id: 'cbs-2', name: 'International Standards', slug: 'polycab/cables-by-standards/international-standards', children: [] }
        ]
      },
      {
        id: 'cbt-static',
        slug: 'polycab/cables-by-type',
        name: 'Cables By Type',
        children: [
          { id: 'cbt-1', name: 'LV Power Cable', slug: 'polycab/cables-by-type/lv-power-cable', children: [] },
          { id: 'cbt-2', name: 'MV Power Cable', slug: 'polycab/cables-by-type/mv-power-cable', children: [] },
          { id: 'cbt-3', name: 'EHV Power Cable', slug: 'polycab/cables-by-type/ehv-power-cable', children: [] },
          { id: 'cbt-4', name: 'Instrumentation Cable', slug: 'polycab/cables-by-type/instrumentation-cable', children: [] },
          { id: 'cbt-5', name: 'Communication & Data Cable', slug: 'polycab/cables-by-type/communication-and-data-cable', children: [] },
          { id: 'cbt-6', name: 'Renewable Energy', slug: 'polycab/cables-by-type/renewable-energy', children: [] },
          { id: 'cbt-7', name: 'Others', slug: 'polycab/cables-by-type/others', children: [] }
        ]
      },
      { id: 'sg-static', slug: 'polycab/switchgears', name: 'Switchgears', children: [] },
      { id: 'fn-static', slug: 'polycab/fans', name: 'Fans', children: [] },
      { id: 'sl-static', slug: 'polycab/solar', name: 'Solar', children: [] },
      { id: 'ca-static', slug: 'polycab/conduit-and-accessories', name: 'Conduit & Accessories', children: [] },
      { id: 'ha-static', slug: 'polycab/home-appliances', name: 'Home Appliances', children: [] }
    ]
  },
  {
    id: 'dowells-static',
    slug: 'dowells',
    name: 'Dowells',
    children: [
      { id: 'dw-1', slug: 'dowells/cable-terminal', name: 'Cable Terminal', children: [] },
      { id: 'dw-2', slug: 'dowells/gland', name: 'Gland', children: [] },
      { id: 'dw-3', slug: 'dowells/crimping-tool', name: 'Crimping Tool', children: [] }
    ]
  }
];

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const { getSetting } = usePublicSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});


  const [menuTree, setMenuTree] = useState<NavItem[]>(DEFAULT_MENU_TREE);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch dynamic categories tree on mount
  useEffect(() => {
    async function loadNavigation() {
      try {
        const res = await fetch('/api/public/navigation');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // setMenuTree(data.data); // Disabled to show static products
        }
      } catch (err) {
        console.error('Error loading navigation:', err);
      }
    }
    // loadNavigation(); // Do not sync with prisma existing data
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  return (
    <>
      <header>
        <div
          className={`rs-header-area rs-header-two ${isHomePage ? 'header-transparent' : 'bg-[#121a2f] relative'} has-theme-orange has-border header-new ${isSticky ? 'rs-sticky' : ''}`}
          id="header-sticky"
        >
          <div className="container-fluid" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="rs-header-inner">
              <div className={`rs-header-left ${isHomePage ? 'index' : ''}`} style={{ marginLeft: 0 }}>
                <div className="rs-header-logo" style={{ marginLeft: 0, paddingLeft: 0 }}>
                  <Link href="/">
                    <img
                      src="/assets/images/logo/msc_logo_without_bg.png"
                      alt="logo"
                      width={170}
                      height={68}
                      style={{
                        width: 'clamp(50px, 14vw, 130px)',
                        maxWidth: '100%',
                        height: 'auto',
                        margin: '0',
                        background: 'transparent',
                      }}
                    />
                  </Link>
                </div>
              </div>

              <div className="rs-header-menu">
                <nav id="mobile-menu" className="main-menu d-none d-lg-block">
                  <ul className="multipage-menu">
                    <li>
                      <Link href="/">Home</Link>
                    </li>
                    <li>
                      <Link href="/about-us">About Us</Link>
                    </li>

                    {/* ── Products — cascading flyout (matches PHP original) ── */}
                    <li className="nav-has-sub">
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        Products <i className="fa-solid fa-angle-down" style={{ fontSize: '11px', marginLeft: '3px', verticalAlign: 'middle' }}></i>
                      </a>

                      {/* Level 1 — Brands (Polycab / Dowells) */}
                      <ul className="nav-flyout">
                        {menuTree.map(brand => {
                          const brandHasChildren = brand.children && brand.children.length > 0;
                          return (
                            <li key={brand.id} className={brandHasChildren ? 'nav-has-sub' : ''}>
                              {brandHasChildren ? (
                                <>
                                  <a href="#" onClick={(e) => e.preventDefault()}>
                                    <span>{brand.name}</span>
                                    <i className="fa-solid fa-chevron-right nav-fly-arrow"></i>
                                  </a>
                                  {/* Level 2 — Brand children (categories) */}
                                  <ul className="nav-flyout">
                                    {brand.children.map((cat: NavItem) => {
                                      const catHasChildren = cat.children && cat.children.length > 0;
                                      return (
                                        <li key={cat.id} className={catHasChildren ? 'nav-has-sub' : ''}>
                                          {catHasChildren ? (
                                            <>
                                              <a href="#" onClick={(e) => e.preventDefault()}>
                                                <span>{cat.name}</span>
                                                <i className="fa-solid fa-chevron-right nav-fly-arrow"></i>
                                              </a>
                                              {/* Level 3 — Subcategories */}
                                              <ul className="nav-flyout">
                                                {cat.children.map((sub: NavItem) => (
                                                  <li key={sub.id}>
                                                    <Link href={`/${sub.slug}`}>{sub.name}</Link>
                                                  </li>
                                                ))}
                                              </ul>
                                            </>
                                          ) : (
                                            <Link href={`/${cat.slug}`}>{cat.name}</Link>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </>
                              ) : (
                                <Link href={`/${brand.slug}`}>{brand.name}</Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>

                    <li>
                      <Link href="/catalogue">Catalogue</Link>
                    </li>
                    <li>
                      <Link href="/pricelist">Pricelist</Link>
                    </li>
                    <li>
                      <Link href="/company-profile">Company Profile</Link>
                    </li>
                    <li>
                      <Link href="/contact-us">Contact Us</Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="rs-header-right d-flex align-items-center gap-4">
                <div className="rs-header-hamburger">
                  <div className="sidebar-toggle new">
                    <a className="bar-icon" href="#" onClick={(e) => { e.preventDefault(); setIsSidebarOpen(true); }}>
                      <i className="fa-solid fa-bars"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Offcanvas sidebar ── */}
      <div className={`fix ${isSidebarOpen ? 'expanded' : ''}`}>
        <div className={`offcanvas-area ${isSidebarOpen ? 'expanded' : ''}`}>
          <div className="offcanvas-wrapper">
            <div className="offcanvas-content">
              <div className="offcanvas-top d-flex justify-content-between align-items-center mb-20">
                <div className="offcanvas-logo">
                  <Link className="logo-black" href="/">
                    <Image
                      src="/assets/images/logo/msc_logo_without_bg.png"
                      alt="logo"
                      width={180}
                      height={72}
                      style={{ maxWidth: '180px', height: 'auto' }}
                    />
                  </Link>
                </div>
                <div className="offcanvas-close">
                  <button className="offcanvas-close-icon" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-xmark" style={{ fontSize: '22px', color: '#ffffff' }}></i>
                  </button>
                </div>
              </div>

              <div className="offcanvas-about mb-30">
                <p>The authorized distributor of Polycab India Ltd., your trusted destination for premium electrical solutions.</p>
              </div>

              {/* Mobile Menu Navigation */}
              <div className="mobile-menu mb-4 d-lg-none">
                <ul className="list-none p-0 m-0">
                  <li className="mobile-nav-item">
                    <Link href="/" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">Home</Link>
                  </li>
                  <li className="mobile-nav-item">
                    <Link href="/about-us" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">About Us</Link>
                  </li>

                  {/* Dynamic Products mobile collapse */}
                  <li className="mobile-nav-item">
                    <div className="mobile-toggle-row" onClick={() => toggleSubmenu('products')}>
                      <span className="mobile-nav-link">Products</span>
                      <i className={`fa-solid fa-angle-${openSubmenus['products'] ? 'up' : 'down'}`}></i>
                    </div>
                    {openSubmenus['products'] && (
                      <ul className="mobile-submenu">
                        {menuTree.map(brandNode => {
                          const brandSlug = brandNode.slug;
                          const brandHasChildren = brandNode.children && brandNode.children.length > 0;
                          return (
                            <li key={brandNode.id} className="mobile-submenu-item">
                              {brandHasChildren ? (
                                <>
                                  <div className="mobile-toggle-row" onClick={() => toggleSubmenu(brandSlug)}>
                                    <span className="mobile-brand-label">{brandNode.name}</span>
                                    <i className={`fa-solid fa-angle-${openSubmenus[brandSlug] ? 'up' : 'down'} text-xs`}></i>
                                  </div>
                                  {openSubmenus[brandSlug] && (
                                    <ul className="mobile-submenu mt-1">
                                      {brandNode.children.map(catNode => {
                                        const catSlug = catNode.slug;
                                        const catHasChildren = catNode.children && catNode.children.length > 0;
                                        return (
                                          <li key={catNode.id} className="mobile-submenu-item">
                                            {catHasChildren ? (
                                              <>
                                                <div className="mobile-toggle-row" onClick={() => toggleSubmenu(catSlug)}>
                                                  <span className="mobile-cat-label">{catNode.name}</span>
                                                  <i className={`fa-solid fa-angle-${openSubmenus[catSlug] ? 'up' : 'down'} text-xs`}></i>
                                                </div>
                                                {openSubmenus[catSlug] && (
                                                  <ul className="mobile-submenu mt-1">
                                                    {catNode.children.map(subNode => (
                                                      <li key={subNode.id}>
                                                        <Link
                                                          href={`/${subNode.slug}`}
                                                          onClick={() => setIsSidebarOpen(false)}
                                                          className="mobile-leaf-link"
                                                        >
                                                          {subNode.name}
                                                        </Link>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                )}
                                              </>
                                            ) : (
                                              <Link
                                                href={`/${catNode.slug}`}
                                                onClick={() => setIsSidebarOpen(false)}
                                                className="mobile-leaf-link"
                                                style={{ fontWeight: 500, paddingLeft: 0 }}
                                              >
                                                {catNode.name}
                                              </Link>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </>
                              ) : (
                                <Link
                                  href={`/${brandNode.slug}`}
                                  onClick={() => setIsSidebarOpen(false)}
                                  className="mobile-leaf-link"
                                  style={{ fontWeight: 600, paddingLeft: 0 }}
                                >
                                  {brandNode.name}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>

                  <li className="mobile-nav-item">
                    <Link href="/catalogue" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">Catalogue</Link>
                  </li>
                  <li className="mobile-nav-item">
                    <Link href="/pricelist" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">Pricelist</Link>
                  </li>
                  <li className="mobile-nav-item">
                    <Link href="/company-profile" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">Company Profile</Link>
                  </li>
                  <li className="mobile-nav-item">
                    <Link href="/contact-us" onClick={() => setIsSidebarOpen(false)} className="mobile-nav-link">Contact Us</Link>
                  </li>
                </ul>
              </div>

              <div className="offcanvas-contact mb-30">
                <h4 className="offcanvas-title-meta">Contact Info</h4>
                <ul className="offcanvas-contact-list">
                  <li className="offcanvas-contact-item">
                    <i className="fa-solid fa-location-dot mt-1 text-[#6c757d]"></i>
                    <span className="text-[#6c757d]" style={{ whiteSpace: 'pre-line' }}>
                      {getSetting('contact_address', '54/2/16 & 54/2/18 Siddharth Farms\nLasudia Mori Dewas Naka\nIndore-452010')}
                    </span>
                  </li>
                  <li className="offcanvas-contact-item">
                    <i className="fa-solid fa-phone text-[#6c757d]"></i>
                    <a href={`tel:${getSetting('contact_phone_1', '+919522952267').replace(/[^+\d]/g, '')}`} className="text-[#6c757d] no-underline">
                      {getSetting('contact_phone_1', '+91 9522952267')}
                    </a>
                  </li>
                  <li className="offcanvas-contact-item">
                    <i className="fa-solid fa-envelope text-[#6c757d]"></i>
                    <a href={`mailto:${getSetting('contact_email', 'info@mohitscpl.com')}`} className="text-[#6c757d] no-underline">
                      {getSetting('contact_email', 'info@mohitscpl.com')}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`offcanvas-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
    </>
  );
}
