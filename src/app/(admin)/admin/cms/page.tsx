'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../components/AdminShell';

interface BannerItem {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
}

interface PageContent {
  title: string;
  content: string;
  imageUrl: string;
  extraField: string;
}

type TabKey = 'banners' | 'homepage' | 'promotions' | 'about-us' | 'company-profile';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'banners', label: 'Banners' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'promotions', label: '📢 Promotions & Popups' },
  { key: 'about-us', label: 'About Us' },
  { key: 'company-profile', label: 'Company Profile' },
];

const DEFAULT_BANNERS: BannerItem[] = [
  { id: '1', title: 'Cable', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167821/mohit/banner/desktop/cable.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167829/mohit/banner/mobile/cable.webp', link: '', isActive: true, sortOrder: 0 },
  { id: '2', title: 'Polycab', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167824/mohit/banner/desktop/polycab.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167834/mohit/banner/mobile/polycab_banner.webp', link: '', isActive: true, sortOrder: 1 },
  { id: '3', title: 'Fans', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167823/mohit/banner/desktop/fans.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167833/mohit/banner/mobile/fans.webp', link: '', isActive: true, sortOrder: 2 },
  { id: '4', title: 'Solar', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167826/mohit/banner/desktop/solar_product.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167835/mohit/banner/mobile/solar_product.webp', link: '', isActive: true, sortOrder: 3 },
  { id: '5', title: 'Switchgear', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167827/mohit/banner/desktop/switchgear.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167836/mohit/banner/mobile/switchgear.webp', link: '', isActive: true, sortOrder: 4 },
  { id: '6', title: 'Wire', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167828/mohit/banner/desktop/wire.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167837/mohit/banner/mobile/wire.webp', link: '', isActive: true, sortOrder: 5 },
  { id: '7', title: 'Dowells', desktopImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167822/mohit/banner/desktop/dowells.webp', mobileImage: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167830/mohit/banner/mobile/dowells.webp', link: '', isActive: true, sortOrder: 6 },
];

const DISCOUNT_PRESET = `<div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px; text-align: center; color: #fff;">
  <div style="display: inline-block; background: #f59e0b; color: #1e293b; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 12px; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);">
    🏷️ Mega Sale Active
  </div>
  <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Flat 10% OFF on Wires</h3>
  <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 13px;">Use coupon code <strong style="color: #f59e0b; background: rgba(245,158,11,0.1); padding: 2px 8px; border-radius: 4px; border: 1px dashed rgba(245,158,11,0.3);">MOHIT10</strong> at checkout</p>
  <a href="/contact-us" style="display: inline-block; background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); color: #1e293b; padding: 10px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">
    Inquire Now
  </a>
</div>`;

const FESTIVE_PRESET = `<div style="background: linear-gradient(135deg, #742a2a 0%, #991b1b 100%); padding: 36px; text-align: center; color: #fff; border: 3px double #f59e0b;">
  <div style="font-size: 32px; margin-bottom: 10px;">✨🎆✨</div>
  <h3 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 900; color: #f59e0b;">Happy Festive Season!</h3>
  <p style="margin: 0 0 20px 0; color: #fecaca; font-size: 13px;">Celebrate this festival with our high-grade safe cabling solutions. Get special discounts on bulk wholesale bookings.</p>
  <a href="/contact-us" style="display: inline-block; background: #f59e0b; color: #742a2a; padding: 10px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 13px;">
    Get Festive Quote
  </a>
</div>`;

const SPOTLIGHT_PRESET = `<div style="display: flex; flex-direction: row; flex-wrap: wrap; background: #0b1329; color: #fff; text-align: left;">
  <div style="flex: 1 1 200px; padding: 32px; display: flex; flex-direction: column; justify-content: center;">
    <div style="display: inline-block; color: #38bdf8; font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px;">
      🚀 New Product Launch
    </div>
    <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; line-height: 1.2;">Polycab Green Wires</h3>
    <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">Eco-friendly, flame retardant lead-free wires for safe smart homes.</p>
    <a href="/polycab" style="display: inline-block; background: #38bdf8; color: #0b1329; padding: 8px 20px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 12px; width: fit-content;">
      View Catalogue
    </a>
  </div>
  <div style="flex: 1 1 180px; background: url('https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167828/mohit/banner/desktop/wire.webp') center/cover no-repeat; min-height: 180px;"></div>
</div>`;

const DEFAULT_HOMEPAGE_ABOUT: PageContent = {
  title: 'About Us',
  content: 'Established in 1997, Mohit Sales Corporation Pvt. Ltd. has built a strong reputation as a trusted leader in the electrical distribution industry. With over 27+ years of experience, we deliver reliable, high-quality electrical products and customized solutions to diverse sectors.\n\nWe are a proud Authorised Distributor of Polycab and Dowells, ensuring our customers receive only genuine, certified products that meet the highest industry standards.\n\nOur success is driven by a customer-first approach, technical expertise, timely delivery, and dependable after-sales support. Today, we proudly serve contractors, industries, retailers, and large-scale infrastructure projects, helping power growth and innovation across the region.',
  imageUrl: 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/about/authorized-distributor.png',
  extraField: '',
};

const DEFAULT_ABOUT_US: PageContent = {
  title: 'About Mohit Sales Corporation Pvt. Ltd.',
  content: '<p>Founded in <strong>1997</strong>, Mohit Sales Corporation Pvt. Ltd. has grown into a trusted and leading name in the electrical distribution industry. With <strong>27+ years of experience</strong>, we specialize in delivering high-quality electrical products and solutions across multiple sectors.</p>\n\n<p>As an <strong>Authorised Distributor of Polycab and Dowells</strong> we ensure our customers receive genuine products backed by technical expertise, timely supply, and reliable after-sales support. Our strong industry presence, expert team, and customer-centric approach have enabled us to consistently meet the evolving needs of contractors, industries, retailers, and infrastructure projects.</p>\n\n<p>Mohit Sales Corporation continues to build a reputation for trust, quality, and professionalism—values that form the foundation of our long-standing success.</p>',
  imageUrl: 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167900/mohit/inner-banner/about-us.png',
  extraField: '',
};

const DEFAULT_COMPANY_PROFILE: PageContent = {
  title: 'Company Profile',
  content: '<p>Mohit Sales Corporation Pvt. Ltd. is a trusted name in the electrical distribution industry. With over 27+ years of experience, we deliver high-quality electrical products and customized solutions to diverse sectors. As an Authorised Distributor of Polycab and Dowells, we ensure our customers receive only genuine, certified products that meet the highest industry standards.</p>',
  imageUrl: 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/inner-banner/products.png',
  extraField: '/assets/images/pdf/MOHIT CATALOGUE.pdf',
};

export default function CmsPage() {
  const [tab, setTab] = useState<TabKey>('banners');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [pageData, setPageData] = useState<Record<string, PageContent>>({
    homepage: DEFAULT_HOMEPAGE_ABOUT,
    'about-us': DEFAULT_ABOUT_US,
    'company-profile': DEFAULT_COMPANY_PROFILE,
  });
  const [promoData, setPromoData] = useState({
    showPopup: false,
    template: 'standard',
    popupType: 'festival',
    title: 'Special Festive Offer!',
    subtitle: 'Limited Time Deal',
    description: 'Get exclusive discounts on our premium range.',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Inquire Now',
    displayDelay: 2,
    themeColor: '#f97316',
    customHtml: '',
  });
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/cms?page=homepage').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/cms?page=about-us').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/cms?page=company-profile').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([homepageRes, aboutRes, profileRes]) => {
      const findSection = (sections: any[], section: string) =>
        sections?.find?.((s: any) => s.section === section);

      const bannerSection = findSection(homepageRes.data, 'banners');
      if (bannerSection) {
        try {
          const parsed = JSON.parse(bannerSection.content);
          if (parsed.banners?.length) setBanners(parsed.banners);
          else setBanners(DEFAULT_BANNERS);
        } catch { setBanners(DEFAULT_BANNERS); }
      } else {
        setBanners(DEFAULT_BANNERS);
      }

      const loadPage = (sections: any[], page: string, sectionName: string) => {
        const sec = findSection(sections, sectionName);
        if (sec) {
          try {
            const parsed = JSON.parse(sec.content);
            setPageData(prev => ({ ...prev, [page]: { ...prev[page], ...parsed } }));
          } catch {}
        }
      };

      loadPage(homepageRes.data, 'homepage', 'content');
      loadPage(aboutRes.data, 'about-us', 'content');
      loadPage(profileRes.data, 'company-profile', 'content');

      const promoSection = findSection(homepageRes.data, 'promo_popup');
      if (promoSection) {
        try {
          const parsed = JSON.parse(promoSection.content);
          setPromoData(prev => ({ ...prev, ...parsed }));
        } catch {}
      }

      setLoading(false);
    }).catch(() => {
      setLoading(false);
      showToast('Failed to load CMS data.', 'error');
    });
  }, []);

  const saveBanners = async () => {
    const invalid = banners.filter(b => b.isActive && !b.desktopImage.trim());
    if (invalid.length) {
      showToast(`${invalid.length} active banner(s) have no desktop image. Please fix or deactivate them.`, 'error');
      return;
    }
    setSavingKey('banners');
    try {
      const sorted = [...banners].map((b, i) => ({ ...b, sortOrder: b.sortOrder ?? i }));
      const res = await fetch('/api/admin/cms/homepage/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { banners: sorted } }),
      });
      const data = await res.json();
      if (data.success) showToast('Banners saved successfully!');
      else showToast(data.message || 'Failed to save.', 'error');
    } catch { showToast('Network error.', 'error'); }
    setSavingKey(null);
  };

  const savePageContent = async (page: string) => {
    setSavingKey(page);
    try {
      const res = await fetch(`/api/admin/cms/${page}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pageData[page] }),
      });
      const data = await res.json();
      if (data.success) showToast(`${page} content saved!`);
      else showToast(data.message || 'Failed to save.', 'error');
    } catch { showToast('Network error.', 'error'); }
    setSavingKey(null);
  };

  const savePromo = async () => {
    setSavingKey('promo_popup');
    try {
      const res = await fetch('/api/admin/cms/homepage/promo_popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: promoData }),
      });
      const data = await res.json();
      if (data.success) showToast('Promotional popup settings saved successfully!');
      else showToast(data.message || 'Failed to save.', 'error');
    } catch { showToast('Network error.', 'error'); }
    setSavingKey(null);
  };

  const addBanner = () => {
    setBanners(prev => [...prev, {
      id: crypto.randomUUID(),
      title: '',
      desktopImage: '',
      mobileImage: '',
      link: '',
      isActive: true,
      sortOrder: prev.length,
    }]);
  };

  const removeBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const updateBanner = (id: string, field: keyof BannerItem, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updatePage = (page: string, field: keyof PageContent, value: string) => {
    setPageData(prev => ({ ...prev, [page]: { ...prev[page], [field]: value } }));
  };

  const [uploading, setUploading] = useState<string | null>(null);

  const uploadImage = async (file: File, onSuccess: (url: string) => void, fieldKey: string) => {
    if (file.size > 1 * 1024 * 1024) {
      showToast('Image must be under 1MB.', 'error');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, WebP, GIF allowed.', 'error');
      return;
    }
    setUploading(fieldKey);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        showToast('Image uploaded!');
      } else {
        showToast(data.message || 'Upload failed.', 'error');
      }
    } catch { showToast('Upload error.', 'error'); }
    setUploading(null);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151',
    marginBottom: '6px',
  };
  const btnPrimary: React.CSSProperties = {
    background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 24px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
  };
  const btnDanger: React.CSSProperties = {
    background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px',
  };
  const btnOutline: React.CSSProperties = {
    background: '#fff', color: '#4f46e5', border: '2px solid #4f46e5',
    padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: 600, fontSize: '14px',
  };
  const btnUpload: React.CSSProperties = {
    background: '#6366f1', color: '#fff', border: 'none', padding: '10px 16px',
    borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: 500, fontSize: '13px',
    whiteSpace: 'nowrap',
  };

  const renderImageField = (label: string, value: string, onChange: (url: string) => void, fieldKey: string, placeholder?: string) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0' }}>
        <input
          style={{ ...inputStyle, borderRadius: '8px 0 0 8px', flex: 1 }}
          value={value}
          placeholder={placeholder || '/assets/images/...'}
          onChange={e => onChange(e.target.value)}
        />
        <label style={{ ...btnUpload, opacity: uploading === fieldKey ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {uploading === fieldKey ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            disabled={uploading === fieldKey}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f, onChange, fieldKey);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      {value && (
        <div style={{ marginTop: '6px', height: '60px', width: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundImage: `url('${value}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'block' }}>Max 1MB. JPG, PNG, WebP, GIF</span>
    </div>
  );

  return (
    <AdminShell pageTitle="CMS Management">
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '14px 24px',
          borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 500,
          background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e5e7eb', marginBottom: '24px' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              border: 'none', background: 'transparent',
              color: tab === t.key ? '#4f46e5' : '#6b7280',
              borderBottom: tab === t.key ? '3px solid #4f46e5' : '3px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>Loading CMS data...</div>
      ) : (
        <>
          {/* BANNERS TAB */}
          {tab === 'banners' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  Homepage Banners ({banners.length})
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={addBanner} style={btnOutline}>+ Add Banner</button>
                  <button onClick={saveBanners} disabled={savingKey === 'banners'} style={{ ...btnPrimary, opacity: savingKey === 'banners' ? 0.6 : 1 }}>
                    {savingKey === 'banners' ? 'Saving...' : 'Save Banners'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {banners.map((banner, idx) => (
                  <div key={banner.id} style={{
                    background: '#fff', borderRadius: '12px', padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: '#f3f4f6', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                          {banner.title || 'Untitled Banner'}
                        </span>
                        {!banner.isActive && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeBanner(banner.id)} style={btnDanger}>Delete</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={labelStyle}>Title</label>
                        <input style={inputStyle} value={banner.title} placeholder="Banner title"
                          onChange={e => updateBanner(banner.id, 'title', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Link URL (optional)</label>
                        <input style={inputStyle} value={banner.link} placeholder="/products or https://..."
                          onChange={e => updateBanner(banner.id, 'link', e.target.value)} />
                      </div>
                      {renderImageField('Desktop Image', banner.desktopImage, (url) => updateBanner(banner.id, 'desktopImage', url), `banner-desk-${banner.id}`, '/assets/images/banner/desktop/...')}
                      {renderImageField('Mobile Image', banner.mobileImage, (url) => updateBanner(banner.id, 'mobileImage', url), `banner-mob-${banner.id}`, '/assets/images/banner/mobile/...')}
                      <div>
                        <label style={labelStyle}>Sort Order</label>
                        <input style={{ ...inputStyle, width: '120px' }} type="number" value={banner.sortOrder}
                          onChange={e => updateBanner(banner.id, 'sortOrder', parseInt(e.target.value) || 0)} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                          <input type="checkbox" checked={banner.isActive}
                            onChange={e => updateBanner(banner.id, 'isActive', e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                          <span style={{ fontWeight: 500, color: '#374151' }}>Active</span>
                        </label>
                      </div>
                    </div>

                    {banner.desktopImage && (
                      <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Desktop Preview</span>
                          <div style={{
                            marginTop: '4px', height: '80px', borderRadius: '6px', overflow: 'hidden',
                            backgroundImage: `url('${banner.desktopImage}')`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            border: '1px solid #e5e7eb',
                          }} />
                        </div>
                        {banner.mobileImage && (
                          <div style={{ width: '80px' }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Mobile</span>
                            <div style={{
                              marginTop: '4px', height: '80px', borderRadius: '6px', overflow: 'hidden',
                              backgroundImage: `url('${banner.mobileImage}')`,
                              backgroundSize: 'cover', backgroundPosition: 'center',
                              border: '1px solid #e5e7eb',
                            }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOMEPAGE TAB */}
          {tab === 'homepage' && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Homepage Content</h3>
                <button onClick={() => savePageContent('homepage')} disabled={savingKey === 'homepage'}
                  style={{ ...btnPrimary, opacity: savingKey === 'homepage' ? 0.6 : 1 }}>
                  {savingKey === 'homepage' ? 'Saving...' : 'Save Homepage'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>About Section Title</label>
                  <input style={inputStyle} value={pageData.homepage.title} placeholder="About Us"
                    onChange={e => updatePage('homepage', 'title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>About Section Content</label>
                  <textarea style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }}
                    value={pageData.homepage.content} placeholder="Company description..."
                    onChange={e => updatePage('homepage', 'content', e.target.value)} />
                </div>
                {renderImageField('About Section Image', pageData.homepage.imageUrl, (url) => updatePage('homepage', 'imageUrl', url), 'homepage-img', 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/about/authorized-distributor.png')}
              </div>
            </div>
          )}

          {/* PROMOTIONS TAB */}
          {tab === 'promotions' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Settings Form */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Promotion & Ads Popup Settings</h3>
                  <button onClick={savePromo} disabled={savingKey === 'promo_popup'}
                    style={{ ...btnPrimary, opacity: savingKey === 'promo_popup' ? 0.6 : 1 }}>
                    {savingKey === 'promo_popup' ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Status Toggle */}
                  <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={promoData.showPopup}
                        onChange={e => setPromoData(prev => ({ ...prev, showPopup: e.target.checked }))}
                        style={{ width: '20px', height: '20px', accentColor: '#4f46e5', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Enable Home Page Promotional Popup</span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          Toggle the popup ad overlay on/off on the main website homepage.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Template Style Selector */}
                  <div>
                    <label style={labelStyle}>Layout Template</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                      {[
                        { key: 'standard', name: 'Vertical Card', desc: 'Top Image' },
                        { key: 'split', name: 'Split Card', desc: 'Left Image' },
                        { key: 'banner', name: 'Full Banner', desc: 'Bg Image' },
                        { key: 'text_only', name: 'Minimalist', desc: 'Text Only' },
                        { key: 'custom_html', name: 'Custom HTML', desc: 'Online Presets' }
                      ].map((t) => (
                        <div
                          key={t.key}
                          onClick={() => setPromoData(prev => ({ ...prev, template: t.key as any }))}
                          style={{
                            border: promoData.template === t.key ? '2px solid #4f46e5' : '1px solid #d1d5db',
                            background: promoData.template === t.key ? '#f5f3ff' : '#fff',
                            borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '13px', color: promoData.template === t.key ? '#4f46e5' : '#374151' }}>{t.name}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{t.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom HTML conditional editor vs standard fields */}
                  {promoData.template === 'custom_html' ? (
                    <>
                      {/* Presets Loading Row */}
                      <div>
                        <label style={labelStyle}>Quick Presets (Select Online Layouts)</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setPromoData(prev => ({ ...prev, customHtml: DISCOUNT_PRESET, themeColor: '#f59e0b' }))}
                            style={{ ...btnOutline, padding: '8px 16px', fontSize: '12.5px', height: 'auto', borderWidth: '1px' }}
                          >
                            🏷️ Load Discount Preset
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromoData(prev => ({ ...prev, customHtml: FESTIVE_PRESET, themeColor: '#ef4444' }))}
                            style={{ ...btnOutline, padding: '8px 16px', fontSize: '12.5px', height: 'auto', borderWidth: '1px' }}
                          >
                            🎆 Load Festival Preset
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromoData(prev => ({ ...prev, customHtml: SPOTLIGHT_PRESET, themeColor: '#38bdf8' }))}
                            style={{ ...btnOutline, padding: '8px 16px', fontSize: '12.5px', height: 'auto', borderWidth: '1px' }}
                          >
                            🚀 Load Spotlight Preset
                          </button>
                        </div>
                      </div>

                      {/* Custom HTML Textarea */}
                      <div>
                        <label style={labelStyle}>Custom HTML & Inline CSS Code</label>
                        <textarea
                          style={{ ...inputStyle, minHeight: '250px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12.5px', background: '#1e293b', color: '#f8fafc', padding: '14px' }}
                          value={promoData.customHtml}
                          placeholder="<div style='padding: 20px;'><h3>Custom Ad</h3></div>"
                          onChange={e => setPromoData(prev => ({ ...prev, customHtml: e.target.value }))}
                        />
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                          Write custom HTML with inline styles. Avoid using scripts or external stylesheets. The standard dismiss/close triggers are handled automatically.
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Event Type / Category Selector */}
                      <div>
                        <label style={labelStyle}>Promotion Type (Emoji Theme)</label>
                        <select
                          style={inputStyle}
                          value={promoData.popupType}
                          onChange={e => setPromoData(prev => ({ ...prev, popupType: e.target.value as any }))}
                        >
                          <option value="festival">🎆 Festival Offer (Holiday specials)</option>
                          <option value="discount">🏷️ Discount / Special Offer</option>
                          <option value="new_product">🆕 New Product Announcement</option>
                          <option value="custom">📢 Custom Notice</option>
                        </select>
                      </div>

                      {/* Text Fields */}
                      <div>
                        <label style={labelStyle}>Main Title (Headline)</label>
                        <input
                          style={inputStyle}
                          value={promoData.title}
                          placeholder="e.g. Diwali Dhamaka Sale!"
                          onChange={e => setPromoData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Subtitle / Promo Tagline</label>
                        <input
                          style={inputStyle}
                          value={promoData.subtitle}
                          placeholder="e.g. Flat 15% Off or Limited Time Offer"
                          onChange={e => setPromoData(prev => ({ ...prev, subtitle: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Detailed Message Description</label>
                        <textarea
                          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                          value={promoData.description}
                          placeholder="Enter the details of your offer or announcement here..."
                          onChange={e => setPromoData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      {/* Banner Image Uploader */}
                      {promoData.template !== 'text_only' && (
                        renderImageField(
                          'Promotional Banner Image',
                          promoData.imageUrl,
                          (url) => setPromoData(prev => ({ ...prev, imageUrl: url })),
                          'promo-img',
                          'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/about/authorized-distributor.png'
                        )
                      )}

                      {/* CTA Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>Button CTA Text</label>
                          <input
                            style={inputStyle}
                            value={promoData.buttonText}
                            placeholder="e.g. Inquire Now"
                            onChange={e => setPromoData(prev => ({ ...prev, buttonText: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Redirect Link URL (optional)</label>
                          <input
                            style={inputStyle}
                            value={promoData.linkUrl}
                            placeholder="e.g. /contact-us or /polycab"
                            onChange={e => setPromoData(prev => ({ ...prev, linkUrl: e.target.value }))}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Timing & Color Settings */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Display Delay (seconds)</label>
                      <input
                        style={inputStyle}
                        type="number"
                        min="0"
                        max="30"
                        value={promoData.displayDelay}
                        onChange={e => setPromoData(prev => ({ ...prev, displayDelay: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Theme Color</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={promoData.themeColor}
                          onChange={e => setPromoData(prev => ({ ...prev, themeColor: e.target.value }))}
                          style={{ width: '42px', height: '42px', padding: '0', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          style={{ ...inputStyle, flex: 1 }}
                          value={promoData.themeColor}
                          onChange={e => setPromoData(prev => ({ ...prev, themeColor: e.target.value }))}
                          placeholder="#f97316"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sticky Real-time Desktop/Mobile Live Preview Box */}
              <div style={{
                position: 'sticky',
                top: '24px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                minHeight: '450px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✨ Live Sandbox Screen Preview
                </span>

                <div style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.05)',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  minHeight: '340px'
                }}>
                  
                  {/* Standard Preview Card */}
                  {promoData.template === 'standard' && (
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '280px', overflow: 'hidden' }}>
                      {promoData.imageUrl ? (
                        <div style={{ height: '120px', backgroundImage: `url('${promoData.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: `3px solid ${promoData.themeColor}` }} />
                      ) : (
                        <div style={{ height: '40px', background: `${promoData.themeColor}1a` }} />
                      )}
                      <div style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                          {promoData.popupType === 'festival' ? '🎆' : promoData.popupType === 'discount' ? '🏷️' : promoData.popupType === 'new_product' ? '🆕' : '📢'}
                        </div>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{promoData.title || 'Title Headline'}</h5>
                        {promoData.subtitle && (
                          <div style={{ fontSize: '11px', fontWeight: 700, color: promoData.themeColor, marginBottom: '8px' }}>{promoData.subtitle}</div>
                        )}
                        <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>{promoData.description || 'Description message body'}</p>
                        <button style={{ background: promoData.themeColor, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {promoData.buttonText || 'Button Text'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Split Preview Card */}
                  {promoData.template === 'split' && (
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', width: '100%', display: 'flex', overflow: 'hidden' }}>
                      {promoData.imageUrl && (
                        <div style={{ flex: '1', backgroundImage: `url('${promoData.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      )}
                      <div style={{ flex: '1.2', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: promoData.themeColor, textTransform: 'uppercase', marginBottom: '4px' }}>
                          {promoData.popupType === 'festival' ? '🎆' : promoData.popupType === 'discount' ? '🏷️' : promoData.popupType === 'new_product' ? '🆕' : '📢'} Special
                        </span>
                        <h5 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{promoData.title || 'Title Headline'}</h5>
                        {promoData.subtitle && (
                          <div style={{ fontSize: '10px', fontWeight: 700, color: promoData.themeColor, marginBottom: '6px' }}>{promoData.subtitle}</div>
                        )}
                        <p style={{ margin: '0 0 12px 0', fontSize: '10px', color: '#64748b', lineHeight: '1.3' }}>{promoData.description || 'Description message body'}</p>
                        <button style={{ width: 'fit-content', background: promoData.themeColor, color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          {promoData.buttonText || 'Button Text'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Banner Preview Card */}
                  {promoData.template === 'banner' && (
                    <div style={{
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      width: '100%',
                      minHeight: '180px',
                      backgroundImage: promoData.imageUrl ? `linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.85) 100%), url('${promoData.imageUrl}')` : `linear-gradient(135deg, ${promoData.themeColor}, #0f172a 100%)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '16px',
                      boxSizing: 'border-box',
                      color: '#fff'
                    }}>
                      <span style={{ fontSize: '9px', width: 'fit-content', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', marginBottom: '6px' }}>
                        {promoData.popupType === 'festival' ? '🎆' : promoData.popupType === 'discount' ? '🏷️' : promoData.popupType === 'new_product' ? '🆕' : '📢'} {promoData.subtitle || 'Promo'}
                      </span>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800 }}>{promoData.title || 'Title Headline'}</h5>
                      <p style={{ margin: '0 0 12px 0', fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.3' }}>{promoData.description || 'Description message body'}</p>
                      <button style={{ width: 'fit-content', background: '#fff', color: '#0f172a', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {promoData.buttonText || 'Button Text'}
                      </button>
                    </div>
                  )}

                  {/* Text-Only Preview Card */}
                  {promoData.template === 'text_only' && (
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', borderLeft: `5px solid ${promoData.themeColor}`, width: '100%', maxWidth: '260px', padding: '16px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: promoData.themeColor, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                        {promoData.popupType === 'festival' ? '🎆' : promoData.popupType === 'discount' ? '🏷️' : promoData.popupType === 'new_product' ? '🆕' : '📢'} Announcement
                      </span>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{promoData.title || 'Title Headline'}</h5>
                      {promoData.subtitle && (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>{promoData.subtitle}</div>
                      )}
                      <p style={{ margin: '0 0 16px 0', fontSize: '10.5px', color: '#475569', lineHeight: '1.4' }}>{promoData.description || 'Description message body'}</p>
                      <button style={{ background: promoData.themeColor, color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {promoData.buttonText || 'Button Text'}
                      </button>
                    </div>
                  )}

                  {/* Custom HTML Preview Card */}
                  {promoData.template === 'custom_html' && (
                    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '320px', overflow: 'hidden' }}>
                      {promoData.customHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: promoData.customHtml }} />
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                          Preset or custom code not loaded yet.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ABOUT US TAB */}
          {tab === 'about-us' && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>About Us Page</h3>
                <button onClick={() => savePageContent('about-us')} disabled={savingKey === 'about-us'}
                  style={{ ...btnPrimary, opacity: savingKey === 'about-us' ? 0.6 : 1 }}>
                  {savingKey === 'about-us' ? 'Saving...' : 'Save About Us'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Page Title</label>
                  <input style={inputStyle} value={pageData['about-us'].title} placeholder="About Mohit Sales Corporation"
                    onChange={e => updatePage('about-us', 'title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Page Content (HTML supported)</label>
                  <textarea style={{ ...inputStyle, minHeight: '250px', resize: 'vertical' }}
                    value={pageData['about-us'].content} placeholder="<p>Company history...</p>"
                    onChange={e => updatePage('about-us', 'content', e.target.value)} />
                </div>
                {renderImageField('Hero Banner Image', pageData['about-us'].imageUrl, (url) => updatePage('about-us', 'imageUrl', url), 'aboutus-img', 'https://res.cloudinary.com/da2dmtm9b/image/upload/v1783167900/mohit/inner-banner/about-us.png')}
              </div>
            </div>
          )}

          {/* COMPANY PROFILE TAB */}
          {tab === 'company-profile' && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Company Profile Page</h3>
                <button onClick={() => savePageContent('company-profile')} disabled={savingKey === 'company-profile'}
                  style={{ ...btnPrimary, opacity: savingKey === 'company-profile' ? 0.6 : 1 }}>
                  {savingKey === 'company-profile' ? 'Saving...' : 'Save Company Profile'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Page Title</label>
                  <input style={inputStyle} value={pageData['company-profile'].title} placeholder="Company Profile"
                    onChange={e => updatePage('company-profile', 'title', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Page Content (HTML supported)</label>
                  <textarea style={{ ...inputStyle, minHeight: '250px', resize: 'vertical' }}
                    value={pageData['company-profile'].content} placeholder="<p>Company overview...</p>"
                    onChange={e => updatePage('company-profile', 'content', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Company Profile PDF URL</label>
                  <input style={inputStyle} value={pageData['company-profile'].extraField}
                    placeholder="/assets/images/pdf/MOHIT CATALOGUE.pdf"
                    onChange={e => updatePage('company-profile', 'extraField', e.target.value)} />
                </div>
                {renderImageField('Hero Image', pageData['company-profile'].imageUrl, (url) => updatePage('company-profile', 'imageUrl', url), 'profile-img', 'https://res.cloudinary.com/da2dmtm9b/image/upload/f_auto,q_auto/mohit/inner-banner/products.png')}
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
