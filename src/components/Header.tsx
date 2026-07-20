'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePublicSettings } from './PublicSettingsContext';
import { cld } from '@/lib/cloudinary';


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
    // Polycab is split into the same two arms the manufacturer's own site uses —
    // Consumer and Industries — so the catalogue reads the way customers expect.
    // Every entry points at a slug that already exists; nothing here renames or
    // moves a page, it only regroups how they are surfaced in the menu.
    // (Polycab also lists a consumer "Lighting" arm — deliberately omitted for
    //  now because we stock no lighting SKUs yet.)
    id: 'polycab-static',
    slug: 'polycab',
    name: 'Polycab',
    children: [
      {
        id: 'pc-consumer',
        slug: 'polycab',
        name: 'Consumer',
        children: [
          {
            id: 'pc-fans', slug: 'polycab/fans', name: 'Fans',
            children: [
              { id: 'pc-fan-ceiling', name: 'Ceiling Fans', slug: 'fans/ceiling-fans', children: [] },
              { id: 'pc-fan-table', name: 'Table Fans', slug: 'fans/table-fans', children: [] },
              { id: 'pc-fan-wall', name: 'Wall Fans', slug: 'fans/wall-fans', children: [] },
              { id: 'pc-fan-pedestal', name: 'Pedestal Fans', slug: 'fans/pedestal-fans', children: [] },
              { id: 'pc-fan-exhaust', name: 'Exhaust Fans', slug: 'fans/exhaust-fans', children: [] },
              { id: 'pc-fan-air', name: 'Air Circulator', slug: 'fans/air-circulator', children: [] },
              { id: 'pc-fan-farrata', name: 'Farrata Fans', slug: 'fans/farrata-fans', children: [] }
            ]
          },
          {
            // House-wire ranges live inside the industrial cable taxonomy; these
            // link straight into the existing hubs rather than duplicating them.
            id: 'pc-wires', slug: 'industries/cables-by-type/others/building-wires', name: 'Wires',
            children: [
              { id: 'pc-wire-building', name: 'Building Wires', slug: 'industries/cables-by-type/others/building-wires', children: [] },
              { id: 'pc-wire-domestic', name: 'Domestic Appliance & Lighting Cable', slug: 'industries/cables-by-type/others/domestic-appliance-and-lighting-cable', children: [] }
            ]
          },
          {
            // Polycab surfaces Water Heaters as its own consumer arm — split
            // Instant / Storage — sitting immediately before Switchgear, so it
            // is mirrored that way here rather than buried under appliances.
            id: 'pc-water-heaters', slug: 'home-appliances/water-heaters', name: 'Water Heaters',
            children: [
              { id: 'pc-wh-instant', name: 'Instant Water Heaters', slug: 'home-appliances/water-heaters/instant-water-heaters', children: [] },
              { id: 'pc-wh-storage', name: 'Storage Water Heaters', slug: 'home-appliances/water-heaters/storage-water-heaters', children: [] }
            ]
          },
          {
            // Polycab lists no Distribution Board equivalent for us — we stock
            // none — so the other six of their seven types are all that appear.
            id: 'pc-switchgear', slug: 'polycab/switchgears', name: 'Switchgear',
            children: [
              { id: 'pc-sg-mcb', name: 'MCB', slug: 'switchgears/mcb', children: [] },
              { id: 'pc-sg-changeover', name: 'MCB Changeover Switch', slug: 'switchgears/mcb-switch', children: [] },
              { id: 'pc-sg-rccb', name: 'RCCB', slug: 'switchgears/rccb', children: [] },
              { id: 'pc-sg-rcbo', name: 'RCBO', slug: 'switchgears/rcbo', children: [] },
              { id: 'pc-sg-isolator', name: 'Isolator', slug: 'switchgears/isolator', children: [] },
              { id: 'pc-sg-accl', name: 'ACCL', slug: 'switchgears/accl', children: [] }
            ]
          },
          {
            // Irons and coolers are ours, not part of Polycab's consumer menu —
            // kept in their own group so they don't muddy the mirrored sections.
            id: 'pc-appliances', slug: 'polycab/home-appliances', name: 'Home Appliances',
            children: [
              { id: 'pc-ap-iron', name: 'Irons', slug: 'home-appliances/irons', children: [] },
              { id: 'pc-ap-cooler', name: 'Coolers', slug: 'home-appliances/coolers', children: [] }
            ]
          },
          {
            id: 'pc-conduit', slug: 'polycab/conduit-and-accessories', name: 'Conduit & Accessories',
            children: [
              { id: 'pc-cd-upvc', name: 'UPVC Conduit', slug: 'conduit-accessories/upvc-conduit', children: [] },
              { id: 'pc-cd-box', name: 'Concealed Box', slug: 'conduit-accessories/concealed-box', children: [] }
            ]
          }
        ]
      },
      {
        id: 'pc-industries',
        slug: 'industries',
        name: 'Industries',
        children: [
          {
            id: 'cba-static',
            slug: 'industries/cables-by-application',
            name: 'Cables By Application',
            children: [
              { id: 'cba-1', name: 'Building Infrastructure', slug: 'industries/cables-by-application/building-infrastructure', children: [] },
              { id: 'cba-2', name: 'Energy And Power Grid', slug: 'industries/cables-by-application/energy-and-power-grid', children: [] },
              { id: 'cba-3', name: 'Exploration Industries', slug: 'industries/cables-by-application/exploration-industries', children: [] },
              { id: 'cba-4', name: 'Manufacturing Industries', slug: 'industries/cables-by-application/manufacturing-industries', children: [] },
              { id: 'cba-5', name: 'Mobility Infrastructure', slug: 'industries/cables-by-application/mobility-infrastructure', children: [] }
            ]
          },
          {
            id: 'cbs-static',
            slug: 'industries/cables-by-standards',
            name: 'Cables By Standards',
            children: [
              { id: 'cbs-1', name: 'Indian Standards (IS)', slug: 'industries/cables-by-standards/indian-standards', children: [] },
              { id: 'cbs-2', name: 'International Standards', slug: 'industries/cables-by-standards/international-standards', children: [] }
            ]
          },
          {
            id: 'cbt-static',
            slug: 'industries/cables-by-type',
            name: 'Cables By Type',
            children: [
              { id: 'cbt-1', name: 'LV Power Cable', slug: 'industries/cables-by-type/lv-power-cable', children: [] },
              { id: 'cbt-2', name: 'MV Power Cable', slug: 'industries/cables-by-type/mv-power-cable', children: [] },
              { id: 'cbt-3', name: 'EHV Power Cable', slug: 'industries/cables-by-type/ehv-power-cable', children: [] },
              { id: 'cbt-4', name: 'Instrumentation Cable', slug: 'industries/cables-by-type/instrumentation-cable', children: [] },
              { id: 'cbt-5', name: 'Communication & Data Cable', slug: 'industries/cables-by-type/communication-and-data-cable', children: [] },
              { id: 'cbt-6', name: 'Renewable Energy', slug: 'industries/cables-by-type/renewable-energy', children: [] },
              // Kept as a plain link on purpose: the Others hub page already
              // lists all 11 of its sub-types, and nesting them here pushed the
              // cascade to a fifth panel, which overlapped its own ancestors and
              // broke the hover chain. Clicking through loses nothing.
              { id: 'cbt-7', name: 'Others', slug: 'industries/cables-by-type/others', children: [] }
            ]
          },
          {
            id: 'pc-renewables', slug: 'polycab/solar', name: 'Renewables',
            children: [
              { id: 'pc-rn-panel', name: 'Solar Panel', slug: 'solar/solar-panel', children: [] },
              { id: 'pc-rn-inverter', name: 'Solar Grid-Tie Inverter', slug: 'solar/solar-grid-tie-inverter', children: [] },
              { id: 'pc-rn-cable', name: 'Solar DC Cable', slug: 'solar/solar-dc-cable', children: [] },
              { id: 'pc-rn-dcmcb', name: 'DC MCB', slug: 'solar/dc-mcb', children: [] }
            ]
          }
        ]
      }
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


  // Curated static navigation. This is intentional and richer than the DB
  // category tree (which only has Polycab/Dowells roots), so the menu is a
  // fixed const rather than DB-driven state.
  const menuTree = DEFAULT_MENU_TREE;

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Both menus render the tree recursively so the config can nest as deep as it
  // needs (Polycab → Industries → Cables By Type → Others → Industrial Cable is
  // five levels) without the markup having to know the depth up front.
  const renderFlyout = (items: NavItem[]): React.ReactNode => (
    <ul className="nav-flyout">
      {items.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        return (
          <li key={item.id} className={hasChildren ? 'nav-has-sub' : ''}>
            {hasChildren ? (
              <>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <span>{item.name}</span>
                  <i className="fa-solid fa-chevron-right nav-fly-arrow"></i>
                </a>
                {renderFlyout(item.children)}
              </>
            ) : (
              <Link href={`/${item.slug}`}>{item.name}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Keyed by item.id, not slug — the same slug legitimately appears in two
  // branches (Building Wires sits under both Consumer → Wires and Cables By
  // Type → Others), and a slug key would toggle both open at once.
  const renderMobileTree = (items: NavItem[], depth = 0): React.ReactNode => (
    <ul className={depth === 0 ? 'mobile-submenu' : 'mobile-submenu mt-1'}>
      {items.map(item => {
        const hasChildren = item.children && item.children.length > 0;
        return (
          <li key={item.id} className="mobile-submenu-item">
            {hasChildren ? (
              <>
                <div className="mobile-toggle-row" onClick={() => toggleSubmenu(item.id)}>
                  <span className={depth === 0 ? 'mobile-brand-label' : 'mobile-cat-label'}>{item.name}</span>
                  <i className={`fa-solid fa-angle-${openSubmenus[item.id] ? 'up' : 'down'} text-xs`}></i>
                </div>
                {openSubmenus[item.id] && renderMobileTree(item.children, depth + 1)}
              </>
            ) : (
              <Link
                href={`/${item.slug}`}
                onClick={() => setIsSidebarOpen(false)}
                className="mobile-leaf-link"
              >
                {item.name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );


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
                      src={cld("https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167908/mohit/logo/msc_logo_without_bg.png", 'f_auto,q_auto,w_320')}
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
                        Products
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginLeft: '5px', verticalAlign: 'middle' }}
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </a>

                      {/* Brands → Consumer/Industries → categories → … (recursive) */}
                      {renderFlyout(menuTree)}
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
                    <a className="bar-icon" href="#" aria-label="Open menu" onClick={(e) => { e.preventDefault(); setIsSidebarOpen(true); }}>
                      <i className="fa-solid fa-bars" aria-hidden="true"></i>
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
                      src={cld("https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167908/mohit/logo/msc_logo_without_bg.png", 'f_auto,q_auto,w_360')}
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
                    {openSubmenus['products'] && renderMobileTree(menuTree)}
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
