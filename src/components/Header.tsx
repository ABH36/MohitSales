'use client';

import React, { useState, useEffect } from 'react';
import ProductsMegaMenu from '@/components/ProductsMegaMenu';
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
    // Lighting, Switches & Accessories and the house-wire ranges arrived later,
    // once their catalogue data existed; the arms were on polycab.com all along
    // but had nothing behind them here.
    // Structure and category names mirror polycab.com's own Consumer /
    // Industries menus. Every leaf points at a slug that renders a real page
    // (verified). Two-level groups (Wires → House Wires / 180 METER; Cables by
    // Application → Building infrastructure / … ) are shown as sub-headers with
    // indented items by the mega-menu.
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
              { id: 'pc-fan-ceiling', name: 'Ceiling Fan', slug: 'fans/ceiling-fans', children: [] },
              { id: 'pc-fan-table', name: 'Table Fan', slug: 'fans/table-fans', children: [] },
              { id: 'pc-fan-wall', name: 'Wall Fan', slug: 'fans/wall-fans', children: [] },
              { id: 'pc-fan-pedestal', name: 'Pedestal Fan', slug: 'fans/pedestal-fans', children: [] },
              { id: 'pc-fan-exhaust', name: 'Exhaust Fan', slug: 'fans/exhaust-fans', children: [] },
              { id: 'pc-fan-air', name: 'Air Circulator', slug: 'fans/air-circulator', children: [] },
              { id: 'pc-fan-farrata', name: 'Farrata Fan', slug: 'fans/farrata-fans', children: [] }
            ]
          },
          {
            id: 'pc-wires', slug: 'polycab-wires', name: 'Wires',
            children: [
              {
                id: 'pc-wire-house', slug: 'polycab-wires', name: 'House Wires',
                children: [
                  { id: 'pc-wire-green', name: 'Polycab Green Wire+', slug: 'wires/polycab-green-wire', children: [] },
                  { id: 'pc-wire-suprema', name: 'PolycabSuprema E-Beam Wire', slug: 'wires/polycab-suprema', children: [] },
                  { id: 'pc-wire-optima', name: 'PolycabOptima+', slug: 'wires/polycab-optima-plus', children: [] },
                  { id: 'pc-wire-primma', name: 'PolycabPrimma', slug: 'wires/polycab-primma', children: [] },
                  { id: 'pc-wire-etira', name: 'Etira', slug: 'polycab-wires', children: [] }
                ]
              },
              {
                id: 'pc-wire-180', slug: 'polycab-wires', name: '180 METER',
                children: [
                  { id: 'pc-wire-green180', name: 'Greenwire 180M', slug: 'wires/polycab-green-wire', children: [] },
                  { id: 'pc-wire-lffr180', name: 'Polycab LF FR 180M', slug: 'wires/lf-fr-180m-wires', children: [] }
                ]
              }
            ]
          },
          {
            id: 'pc-lighting', slug: 'lighting/led-bulb', name: 'Lighting',
            children: [
              { id: 'pc-lt-bulb', name: 'LED Bulb', slug: 'lighting/led-bulb', children: [] },
              { id: 'pc-lt-downlight', name: 'Downlight', slug: 'lighting/downlight', children: [] },
              { id: 'pc-lt-panel', name: 'Panel Light', slug: 'lighting/panel-light', children: [] },
              { id: 'pc-lt-batten', name: 'LED Batten', slug: 'lighting/led-batten', children: [] },
              { id: 'pc-lt-outdoor', name: 'Outdoor Lights', slug: 'lighting/outdoor-lights', children: [] },
              { id: 'pc-lt-rope', name: 'Rope and Strip Lights', slug: 'lighting/rope-and-strip-lights', children: [] },
              { id: 'pc-lt-cob', name: 'LED COB', slug: 'lighting/led-cob', children: [] }
            ]
          },
          {
            id: 'pc-switches', slug: 'switches-accessories/levana', name: 'Switches and Accessories',
            children: [
              { id: 'pc-sw-levana', name: 'Levana', slug: 'switches-accessories/levana', children: [] },
              { id: 'pc-sw-etira', name: 'Etira', slug: 'switches-accessories/etira', children: [] },
              { id: 'pc-sw-boxes', name: 'Plastic Modular Boxes', slug: 'switches-accessories/plastic-modular-boxes', children: [] },
              { id: 'pc-sw-acc', name: 'Accessories', slug: 'switches-accessories/accessories', children: [] }
            ]
          },
          {
            id: 'pc-water-heaters', slug: 'home-appliances/water-heaters', name: 'Water Heaters',
            children: [
              { id: 'pc-wh-instant', name: 'Instant Water Heater', slug: 'home-appliances/water-heaters/instant-water-heaters', children: [] },
              { id: 'pc-wh-storage', name: 'Storage Water Heater', slug: 'home-appliances/water-heaters/storage-water-heaters', children: [] }
            ]
          },
          {
            id: 'pc-switchgear', slug: 'polycab/switchgears', name: 'Switchgear',
            children: [
              { id: 'pc-sg-mcb', name: 'MCB', slug: 'switchgears/mcb', children: [] },
              { id: 'pc-sg-rccb', name: 'RCCB', slug: 'switchgears/rccb', children: [] },
              { id: 'pc-sg-rcbo', name: 'RCBO', slug: 'switchgears/rcbo', children: [] },
              { id: 'pc-sg-isolator', name: 'Isolator', slug: 'switchgears/isolator', children: [] },
              { id: 'pc-sg-accl', name: 'ACCL', slug: 'switchgears/accl', children: [] },
              { id: 'pc-sg-changeover', name: 'MCB Changeover Switch', slug: 'switchgears/mcb-switch', children: [] },
              { id: 'pc-sg-db', name: 'Distribution Board', slug: 'switchgears/distribution-board', children: [] }
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
            name: 'Cables by Application',
            children: [
              {
                id: 'cba-building', slug: 'industries/cables-by-application/building-infrastructure', name: 'Building infrastructure',
                children: [
                  { id: 'cba-b-res', name: 'Residential', slug: 'industries/cables-by-application/residential', children: [] },
                  { id: 'cba-b-dc', name: 'Datacenters', slug: 'industries/cables-by-application/datacenters', children: [] },
                  { id: 'cba-b-tel', name: 'Telecommunication', slug: 'industries/cables-by-application/telecommunication', children: [] },
                  { id: 'cba-b-com', name: 'Commercial', slug: 'industries/cables-by-application/commercial', children: [] },
                  { id: 'cba-b-it', name: 'IT Industry', slug: 'industries/cables-by-application/it-industry', children: [] }
                ]
              },
              {
                id: 'cba-energy', slug: 'industries/cables-by-application/energy-and-power-grid', name: 'Energy and Power Grid',
                children: [
                  { id: 'cba-e-pn', name: 'Power & Network', slug: 'industries/cables-by-application/power-and-network', children: [] },
                  { id: 'cba-e-util', name: 'Utility', slug: 'industries/cables-by-application/utility', children: [] },
                  { id: 'cba-e-ren', name: 'Renewable Energy', slug: 'industries/cables-by-application/renewable-energy', children: [] },
                  { id: 'cba-e-se', name: 'Service Entrance', slug: 'industries/cables-by-application/service-entrance', children: [] }
                ]
              },
              {
                id: 'cba-explore', slug: 'industries/cables-by-application/exploration-industries', name: 'Exploration industries',
                children: [
                  { id: 'cba-x-oil', name: 'Oil Gas & Petrochemical', slug: 'industries/cables-by-application/oil-gas-and-petrochemical', children: [] },
                  { id: 'cba-x-min', name: 'Mining Drilling and Tunneling', slug: 'industries/cables-by-application/mining-drilling-and-tunneling', children: [] }
                ]
              },
              {
                id: 'cba-mfg', slug: 'industries/cables-by-application/manufacturing-industries', name: 'Manufacturing industries',
                children: [
                  { id: 'cba-m-auto', name: 'Automation & Process Control', slug: 'industries/cables-by-application/automation-and-process-control', children: [] },
                  { id: 'cba-m-health', name: 'Healthcare', slug: 'industries/cables-by-application/healthcare', children: [] },
                  { id: 'cba-m-food', name: 'Food & Beverages', slug: 'industries/cables-by-application/food-and-beverages', children: [] },
                  { id: 'cba-m-water', name: 'Water Treatment and Waste Disposal', slug: 'industries/cables-by-application/water-treatment-and-waste-disposal', children: [] },
                  { id: 'cba-m-cement', name: 'Cement Industry', slug: 'industries/cables-by-application/cement-industry', children: [] },
                  { id: 'cba-m-metal', name: 'Metal Industry', slug: 'industries/cables-by-application/metal-industry', children: [] },
                  { id: 'cba-m-sugar', name: 'Sugar Industry', slug: 'industries/cables-by-application/sugar-industry', children: [] },
                  { id: 'cba-m-pharma', name: 'Pharmaceutical Industry', slug: 'industries/cables-by-application/pharmaceutical-industry', children: [] }
                ]
              },
              {
                id: 'cba-mobility', slug: 'industries/cables-by-application/mobility-infrastructure', name: 'Mobility infrastructure',
                children: [
                  { id: 'cba-o-mass', name: 'Mass Transit (Railways & Marine)', slug: 'industries/cables-by-application/mass-transit-railways-and-marine', children: [] },
                  { id: 'cba-o-def', name: 'Defence & Armaments Industry', slug: 'industries/cables-by-application/defence-and-armaments-industry', children: [] },
                  { id: 'cba-o-aero', name: 'Aerospace Industry', slug: 'industries/cables-by-application/aerospace-industry', children: [] }
                ]
              }
            ]
          },
          {
            id: 'cbs-static',
            slug: 'industries/cables-by-standards',
            name: 'Cables by Standards',
            children: [
              { id: 'cbs-1', name: 'Indian Standards (IS)', slug: 'industries/cables-by-standards/indian-standards', children: [] },
              { id: 'cbs-2', name: 'International Standards', slug: 'industries/cables-by-standards/international-standards', children: [] }
            ]
          },
          {
            id: 'cbt-static',
            slug: 'industries/cables-by-type',
            name: 'Cables by Type',
            children: [
              { id: 'cbt-1', name: 'LV Power Cable', slug: 'industries/cables-by-type/lv-power-cable', children: [] },
              { id: 'cbt-2', name: 'Others', slug: 'industries/cables-by-type/others', children: [] },
              { id: 'cbt-3', name: 'Instrumentation Cable', slug: 'industries/cables-by-type/instrumentation-cable', children: [] },
              { id: 'cbt-4', name: 'Communication & Data Cable', slug: 'industries/cables-by-type/communication-and-data-cable', children: [] },
              { id: 'cbt-5', name: 'Renewable Energy', slug: 'industries/cables-by-type/renewable-energy', children: [] },
              { id: 'cbt-6', name: 'MV Power Cable', slug: 'industries/cables-by-type/mv-power-cable', children: [] },
              { id: 'cbt-7', name: 'EHV Power Cable', slug: 'industries/cables-by-type/ehv-power-cable', children: [] }
            ]
          },
          {
            id: 'pc-renewables', slug: 'polycab/solar', name: 'Renewables',
            children: [
              { id: 'pc-rn-panel', name: 'Solar Inverters and Panels', slug: 'solar/solar-panel', children: [] },
              { id: 'pc-rn-db', name: 'Distribution Boxes', slug: 'polycab/solar', children: [] },
              { id: 'pc-rn-cable', name: 'Solar Cables', slug: 'solar/solar-dc-cable', children: [] }
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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);


  // Curated static navigation. This is intentional and richer than the DB
  // category tree (which only has Polycab/Dowells roots), so the menu is a
  // fixed const rather than DB-driven state.
  const menuTree = DEFAULT_MENU_TREE;

  useEffect(() => {
    // Immediately, not after 250px: the old threshold let the header scroll
    // away and then drop back in, which read as it vanishing and reappearing.
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
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

  // Desktop Products is now ProductsMegaMenu (a click-opened drill-down panel);
  // the old recursive hover flyout that used to render here was removed with it.
  // The mobile drawer still renders the tree recursively below.

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
      {/* Home: transparent over the banner, pinned (rs-sticky) as soon as the
          page moves. Inner pages: position:sticky on the <header> element
          itself (.header-pinned) — sticky on the inner div would be caged by
          this wrapper's own height and never engage. Always in view, never
          leaves the flow, so no content jump. */}
      <header className={isHomePage ? undefined : 'header-pinned'}>
        <div
          className={`rs-header-area rs-header-two ${isHomePage ? 'header-transparent' : 'bg-[#121a2f]'} has-theme-orange has-border header-new ${isHomePage && isSticky ? 'rs-sticky' : ''}`}
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

                    {/* Products — click-opened drill-down panel. Replaced the
                        hover cascade: five levels deep, the pointer had to stay
                        inside a chain of panels that overlapped their own
                        ancestors, and hover does not exist on touch. */}
                    <ProductsMegaMenu tree={menuTree} />

                    <li>
                      <Link href="/catalogue">Catalogue</Link>
                    </li>
                    <li>
                      <Link href="/pricelist">Pricelist</Link>
                    </li>
                    {/* Company Profile now lives as a section on About Us — the
                        page was one paragraph plus a PDF, and dropping it keeps
                        the nav to six items so the labels can breathe. */}
                    <li>
                      <Link href="/contact-us">Contact Us</Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="rs-header-right d-flex align-items-center gap-4">
                {/* Collapsed to an icon by default: the logo and seven nav items
                    already fill the bar, and a permanently open field pushed the
                    nav onto a second line. Expands on click; still a plain GET
                    form, so it submits without JS once open. */}
                <form
                  action="/search"
                  method="get"
                  role="search"
                  className={`header-search d-none d-lg-flex${searchOpen ? ' is-open' : ''}`}
                  onSubmit={(e) => {
                    if (!searchOpen) {
                      e.preventDefault();
                      setSearchOpen(true);
                    }
                  }}
                >
                  <input
                    type="search"
                    name="q"
                    placeholder="Search products, IS 7098, 11kV…"
                    aria-label="Search products"
                    aria-hidden={!searchOpen}
                    tabIndex={searchOpen ? 0 : -1}
                    className="header-search-input"
                    ref={searchInputRef}
                  />
                  <button
                    type={searchOpen ? 'submit' : 'button'}
                    className="header-search-btn"
                    aria-label={searchOpen ? 'Search' : 'Open search'}
                    aria-expanded={searchOpen}
                    onClick={() => {
                      if (!searchOpen) {
                        setSearchOpen(true);
                        // Focus after the width transition starts, or the caret
                        // lands in a zero-width field.
                        setTimeout(() => searchInputRef.current?.focus(), 60);
                      }
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" />
                    </svg>
                  </button>
                </form>

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
                {/* Mobile gets its own box — the desktop one is hidden below lg,
                    and search is more useful on mobile, not less. */}
                <form
                  action="/search"
                  method="get"
                  className="mobile-search"
                  role="search"
                  onSubmit={() => setIsSidebarOpen(false)}
                >
                  <input
                    type="search"
                    name="q"
                    placeholder="Search products, IS 7098, 11kV…"
                    aria-label="Search products"
                    className="mobile-search-input"
                  />
                  <button type="submit" className="mobile-search-btn" aria-label="Search">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" />
                    </svg>
                  </button>
                </form>

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
