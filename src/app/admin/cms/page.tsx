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

type TabKey = 'banners' | 'homepage' | 'about-us' | 'company-profile';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'banners', label: 'Banners' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'about-us', label: 'About Us' },
  { key: 'company-profile', label: 'Company Profile' },
];

const DEFAULT_BANNERS: BannerItem[] = [
  { id: '1', title: 'Cable', desktopImage: '/assets/images/banner/desktop/cable.webp', mobileImage: '/assets/images/banner/mobile/cable.webp', link: '', isActive: true, sortOrder: 0 },
  { id: '2', title: 'Polycab', desktopImage: '/assets/images/banner/desktop/polycab.webp', mobileImage: '/assets/images/banner/mobile/polycab_banner.webp', link: '', isActive: true, sortOrder: 1 },
  { id: '3', title: 'Fans', desktopImage: '/assets/images/banner/desktop/fans.webp', mobileImage: '/assets/images/banner/mobile/fans.webp', link: '', isActive: true, sortOrder: 2 },
  { id: '4', title: 'Solar', desktopImage: '/assets/images/banner/desktop/solar_product.webp', mobileImage: '/assets/images/banner/mobile/solar_product.webp', link: '', isActive: true, sortOrder: 3 },
  { id: '5', title: 'Switchgear', desktopImage: '/assets/images/banner/desktop/switchgear.webp', mobileImage: '/assets/images/banner/mobile/switchgear.webp', link: '', isActive: true, sortOrder: 4 },
  { id: '6', title: 'Wire', desktopImage: '/assets/images/banner/desktop/wire.webp', mobileImage: '/assets/images/banner/mobile/wire.webp', link: '', isActive: true, sortOrder: 5 },
  { id: '7', title: 'Dowells', desktopImage: '/assets/images/banner/desktop/dowells.webp', mobileImage: '/assets/images/banner/mobile/dowells.webp', link: '', isActive: true, sortOrder: 6 },
];

export default function CmsPage() {
  const [tab, setTab] = useState<TabKey>('banners');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [pageData, setPageData] = useState<Record<string, PageContent>>({
    homepage: { title: '', content: '', imageUrl: '', extraField: '' },
    'about-us': { title: '', content: '', imageUrl: '', extraField: '' },
    'company-profile': { title: '', content: '', imageUrl: '', extraField: '' },
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
                      <div>
                        <label style={labelStyle}>Desktop Image URL</label>
                        <input style={inputStyle} value={banner.desktopImage} placeholder="/assets/images/banner/desktop/..."
                          onChange={e => updateBanner(banner.id, 'desktopImage', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Mobile Image URL</label>
                        <input style={inputStyle} value={banner.mobileImage} placeholder="/assets/images/banner/mobile/..."
                          onChange={e => updateBanner(banner.id, 'mobileImage', e.target.value)} />
                      </div>
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
                <div>
                  <label style={labelStyle}>About Section Image URL</label>
                  <input style={inputStyle} value={pageData.homepage.imageUrl}
                    placeholder="/assets/images/about/authorized distributor.png"
                    onChange={e => updatePage('homepage', 'imageUrl', e.target.value)} />
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
                <div>
                  <label style={labelStyle}>Hero Banner Image URL</label>
                  <input style={inputStyle} value={pageData['about-us'].imageUrl}
                    placeholder="/assets/images/inner-banner/about-us.png"
                    onChange={e => updatePage('about-us', 'imageUrl', e.target.value)} />
                </div>
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
                <div>
                  <label style={labelStyle}>Hero Image URL</label>
                  <input style={inputStyle} value={pageData['company-profile'].imageUrl}
                    placeholder="/assets/images/inner-banner/company-profile.png"
                    onChange={e => updatePage('company-profile', 'imageUrl', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
