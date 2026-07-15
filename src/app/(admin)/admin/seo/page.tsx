'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache } from '../components/AdminCacheProvider';

// The SEO views are driven by the sidebar sub-nav (?tab=<key>).
type SeoTab = 'webmaster' | 'meta' | 'redirects' | 'schema' | 'sitemap' | 'robots' | 'logs404';
const SEO_TAB_KEYS: SeoTab[] = ['webmaster', 'meta', 'redirects', 'schema', 'sitemap', 'robots', 'logs404'];

// ── Types ──────────────────────────────────────────────────────────────────

interface SeoMeta {
  id: string;
  page: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  type: number;
  isActive: boolean;
  hitCount: number;
}

interface SchemaMarkup {
  id: string;
  page: string;
  schemaType: string;
  jsonLd: string;
  isActive: boolean;
}

interface SitemapOverride {
  id: string;
  urlPath: string;
  priority: number;
  changeFreq: string;
  isExcluded: boolean;
}

interface RobotsRule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  crawlDelay?: number;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string | null;
  description: string | null;
  isPublic: boolean;
}

// ── Empty forms ─────────────────────────────────────────────────────────────

const emptyMeta: Omit<SeoMeta, 'id'> = {
  page: '', title: '', description: '', keywords: '',
  ogImage: '', ogTitle: '', canonicalUrl: '', noIndex: false, noFollow: false,
};

const emptyRedirect = { fromPath: '', toPath: '', type: 301, isActive: true };

const emptySchema = { page: '', schemaType: 'Organization', jsonLd: '{}', isActive: true };

const emptyOverride = { urlPath: '', priority: 0.5, changeFreq: 'monthly', isExcluded: false };

const CHANGE_FREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
const SCHEMA_TYPES = ['Organization', 'LocalBusiness', 'Product', 'BreadcrumbList', 'FAQPage', 'WebSite', 'ItemList'];

// ── Main page ──────────────────────────────────────────────────────────────

export default function SeoPage() {
  return (
    <AdminShell pageTitle="SEO Manager">
      <SeoPageInner />
    </AdminShell>
  );
}

function SeoPageInner() {
  const { user } = useAdmin();
  const { fetchWithCache, invalidate } = useAdminCache();
  const isReadOnly = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SeoTab | null;
  const validTab: SeoTab = tabParam && SEO_TAB_KEYS.includes(tabParam) ? tabParam : 'webmaster';
  const [activeTab, setActiveTab] = useState<SeoTab>(validTab);
  useEffect(() => { setActiveTab(validTab); }, [validTab]);

  // ── Shared state ──
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── WEBMASTER STATE ──
  const [webmasterSettings, setWebmasterSettings] = useState<Setting[]>([]);
  const [webmasterLoading, setWebmasterLoading] = useState(true);
  const [webmasterSaving, setWebmasterSaving] = useState<string | null>(null);
  const [webmasterValues, setWebmasterValues] = useState<Record<string, string>>({});
  const [confirmSetting, setConfirmSetting] = useState<Setting | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  // ── META STATE ──
  const [metas, setMetas] = useState<SeoMeta[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaForm, setMetaForm] = useState<Omit<SeoMeta, 'id'>>(emptyMeta);
  const [editingMetaId, setEditingMetaId] = useState<string | null>(null);
  const [showMetaModal, setShowMetaModal] = useState(false);

  // ── REDIRECTS STATE ──
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [redirectLoading, setRedirectLoading] = useState(true);
  const [redirectForm, setRedirectForm] = useState(emptyRedirect);
  const [editingRedirectId, setEditingRedirectId] = useState<string | null>(null);
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  // ── SCHEMA STATE ──
  const [schemas, setSchemas] = useState<SchemaMarkup[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaForm, setSchemaForm] = useState(emptySchema);
  const [editingSchemaId, setEditingSchemaId] = useState<string | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [jsonError, setJsonError] = useState('');

  // ── SITEMAP STATE ──
  const [overrides, setOverrides] = useState<SitemapOverride[]>([]);
  const [sitemapLoading, setSitemapLoading] = useState(true);
  const [overrideForm, setOverrideForm] = useState(emptyOverride);
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [sitemapPreview, setSitemapPreview] = useState<{
    totalUrls: number;
    urls: Array<{ url: string; lastmod: string; changefreq: string; priority: number; type: string; title: string }>;
    generatedAt: string;
    stats: {
      static: number;
      categories: number;
      products: number;
      legacyProducts: number;
      blogs: number;
    }
  } | null>(null);

  // ── ROBOTS STATE ──
  const [robotsRules, setRobotsRules] = useState<RobotsRule[]>([]);
  const [robotsLoading, setRobotsLoading] = useState(true);
  const [robotsSaving, setRobotsSaving] = useState(false);

  // ── 404 LOGS STATE ──
  const [logs404, setLogs404] = useState<any[]>([]);
  const [logs404Loading, setLogs404Loading] = useState(true);

  // ── WEBMASTER CRUD ──────────────────────────────────────────────────────
  const loadWebmasterSettings = useCallback(async () => {
    setWebmasterLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        const seoSettings = data.data.filter((s: any) => s.key.startsWith('webmaster_'));
        setWebmasterSettings(seoSettings);
        const vals: Record<string, string> = {};
        seoSettings.forEach((s: any) => { vals[s.id] = s.value; });
        setWebmasterValues(vals);
      }
    } catch (e) {
      console.error('Error fetching webmaster settings:', e);
    }
    setWebmasterLoading(false);
  }, []);

  useEffect(() => { if (activeTab === 'webmaster') loadWebmasterSettings(); }, [activeTab, loadWebmasterSettings]);

  const handleSaveSettingClick = (setting: Setting) => {
    setConfirmSetting(setting);
    setPasswordInput('');
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmSetting) return;

    const settingId = confirmSetting.id;
    setWebmasterSaving(settingId);
    try {
      const res = await fetch(`/api/admin/settings/${settingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: webmasterValues[settingId],
          password: passwordInput
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${confirmSetting.label || confirmSetting.key}" updated!`);
        setConfirmSetting(null);
        loadWebmasterSettings();
      } else {
        showToast(data.message || 'Error updating setting.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setWebmasterSaving(null);
    }
  };

  // ── 404 LOGS CRUD ───────────────────────────────────────────────────────
  const loadLogs404 = useCallback(async () => {
    setLogs404Loading(true);
    try {
      const res = await fetch('/api/admin/seo/not-found');
      const data = await res.json();
      if (data.success) setLogs404(data.data);
    } catch (e) {
      console.error('Error fetching 404 logs:', e);
    }
    setLogs404Loading(false);
  }, []);

  useEffect(() => { if (activeTab === 'logs404') loadLogs404(); }, [activeTab, loadLogs404]);

  const deleteLog404 = async (id: string) => {
    if (!confirm('Delete this 404 log entry?')) return;
    try {
      const res = await fetch(`/api/admin/seo/not-found/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Deleted log entry');
        loadLogs404();
      } else {
        showToast(data.error || 'Failed to delete entry', 'error');
      }
    } catch {
      showToast('Failed to delete entry', 'error');
    }
  };

  const clearAllLogs404 = async () => {
    if (!confirm('Are you sure you want to clear all 404 logs? This action is permanent.')) return;
    try {
      const res = await fetch('/api/admin/seo/not-found', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('All 404 logs cleared');
        loadLogs404();
      } else {
        showToast(data.error || 'Failed to clear logs', 'error');
      }
    } catch {
      showToast('Failed to clear logs', 'error');
    }
  };

  const handleCreateRedirectFrom404 = (path: string) => {
    setRedirectForm({
      fromPath: path,
      toPath: '',
      type: 301,
      isActive: true
    });
    setEditingRedirectId(null);
    setShowRedirectModal(true);
  };

  // ── META CRUD ──────────────────────────────────────────────────────────

  const loadMetas = useCallback(async () => {
    setMetaLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/seo/meta');
      if (data.success) setMetas(data.data);
    } catch (err) { console.error(err); }
    setMetaLoading(false);
  }, [fetchWithCache]);

  useEffect(() => { if (activeTab === 'meta') loadMetas(); }, [activeTab, loadMetas]);

  const openMetaModal = (meta?: SeoMeta) => {
    if (meta) {
      setMetaForm({ page: meta.page, title: meta.title || '', description: meta.description || '', keywords: meta.keywords || '', ogImage: meta.ogImage || '', ogTitle: meta.ogTitle || '', canonicalUrl: meta.canonicalUrl || '', noIndex: meta.noIndex, noFollow: meta.noFollow });
      setEditingMetaId(meta.id);
    } else {
      setMetaForm(emptyMeta);
      setEditingMetaId(null);
    }
    setShowMetaModal(true);
  };

  const saveMeta = async () => {
    if (!metaForm.page) return showToast('Page path is required', 'error');
    const url = editingMetaId ? `/api/admin/seo/meta/${editingMetaId}` : '/api/admin/seo/meta';
    const method = editingMetaId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metaForm) });
    const data = await res.json();
    if (data.success) {
      invalidate('/api/admin/seo/meta');
      showToast(editingMetaId ? 'Meta updated' : 'Meta saved');
      setShowMetaModal(false);
      loadMetas();
    } else {
      showToast(data.error || 'Failed to save', 'error');
    }
  };

  const deleteMeta = async (id: string) => {
    if (!confirm('Delete this SEO meta entry?')) return;
    const res = await fetch(`/api/admin/seo/meta/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/seo/meta'); showToast('Deleted'); loadMetas(); }
    else showToast('Failed to delete', 'error');
  };

  // ── REDIRECT CRUD ──────────────────────────────────────────────────────

  const loadRedirects = useCallback(async () => {
    setRedirectLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/seo/redirects');
      if (data.success) setRedirects(data.data);
    } catch (err) { console.error(err); }
    setRedirectLoading(false);
  }, [fetchWithCache]);

  useEffect(() => { if (activeTab === 'redirects') loadRedirects(); }, [activeTab, loadRedirects]);

  const openRedirectModal = (r?: Redirect) => {
    if (r) {
      setRedirectForm({ fromPath: r.fromPath, toPath: r.toPath, type: r.type, isActive: r.isActive });
      setEditingRedirectId(r.id);
    } else {
      setRedirectForm(emptyRedirect);
      setEditingRedirectId(null);
    }
    setShowRedirectModal(true);
  };

  const saveRedirect = async () => {
    if (!redirectForm.fromPath || !redirectForm.toPath) return showToast('Both paths required', 'error');
    const url = editingRedirectId ? `/api/admin/seo/redirects/${editingRedirectId}` : '/api/admin/seo/redirects';
    const method = editingRedirectId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(redirectForm) });
    const data = await res.json();
    if (data.success) {
      invalidate('/api/admin/seo/redirects');
      showToast(editingRedirectId ? 'Redirect updated' : 'Redirect created');
      setShowRedirectModal(false);
      loadRedirects();
    } else {
      showToast(data.error || 'Failed to save', 'error');
    }
  };

  const deleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    const res = await fetch(`/api/admin/seo/redirects/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/seo/redirects'); showToast('Deleted'); loadRedirects(); }
    else showToast('Failed to delete', 'error');
  };

  // ── SCHEMA CRUD ────────────────────────────────────────────────────────

  const loadSchemas = useCallback(async () => {
    setSchemaLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/seo/schema');
      if (data.success) setSchemas(data.data);
    } catch (err) { console.error(err); }
    setSchemaLoading(false);
  }, [fetchWithCache]);

  useEffect(() => { if (activeTab === 'schema') loadSchemas(); }, [activeTab, loadSchemas]);

  const openSchemaModal = (s?: SchemaMarkup) => {
    setJsonError('');
    if (s) {
      setSchemaForm({ page: s.page, schemaType: s.schemaType, jsonLd: s.jsonLd, isActive: s.isActive });
      setEditingSchemaId(s.id);
    } else {
      setSchemaForm(emptySchema);
      setEditingSchemaId(null);
    }
    setShowSchemaModal(true);
  };

  const saveSchema = async () => {
    if (!schemaForm.page || !schemaForm.jsonLd) return showToast('Page and JSON-LD are required', 'error');
    try { JSON.parse(schemaForm.jsonLd); } catch { return showToast('Invalid JSON', 'error'); }
    const url = editingSchemaId ? `/api/admin/seo/schema/${editingSchemaId}` : '/api/admin/seo/schema';
    const method = editingSchemaId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schemaForm) });
    const data = await res.json();
    if (data.success) {
      invalidate('/api/admin/seo/schema');
      showToast(editingSchemaId ? 'Schema updated' : 'Schema saved');
      setShowSchemaModal(false);
      loadSchemas();
    } else {
      showToast(data.error || 'Failed to save', 'error');
    }
  };

  const deleteSchema = async (id: string) => {
    if (!confirm('Delete this schema markup?')) return;
    const res = await fetch(`/api/admin/seo/schema/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/seo/schema'); showToast('Deleted'); loadSchemas(); }
    else showToast('Failed to delete', 'error');
  };

  // ── SITEMAP CRUD ───────────────────────────────────────────────────────

  const loadOverrides = useCallback(async () => {
    setSitemapLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/seo/sitemap');
      if (data.success) setOverrides(data.data);
    } catch (err) { console.error(err); }
    setSitemapLoading(false);
  }, [fetchWithCache]);

  useEffect(() => { if (activeTab === 'sitemap') loadOverrides(); }, [activeTab, loadOverrides]);

  const openOverrideModal = (o?: SitemapOverride) => {
    if (o) {
      setOverrideForm({ urlPath: o.urlPath, priority: o.priority, changeFreq: o.changeFreq, isExcluded: o.isExcluded });
      setEditingOverrideId(o.id);
    } else {
      setOverrideForm(emptyOverride);
      setEditingOverrideId(null);
    }
    setShowOverrideModal(true);
  };

  const saveOverride = async () => {
    if (!overrideForm.urlPath) return showToast('URL path is required', 'error');
    const isEdit = !!editingOverrideId;
    const url = isEdit ? `/api/admin/seo/sitemap/${editingOverrideId}` : '/api/admin/seo/sitemap';
    const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(overrideForm) });
    const data = await res.json();
    if (data.success) {
      showToast('Sitemap override saved');
      invalidate('/api/admin/seo/sitemap');
      setShowOverrideModal(false);
      setEditingOverrideId(null);
      loadOverrides();
    } else {
      showToast(data.error || 'Failed to save', 'error');
    }
  };

  const generateSitemapUrls = async () => {
    setGeneratingSitemap(true);
    try {
      const res = await fetch('/api/admin/seo/sitemap/generate?format=json');
      const data = await res.json();
      if (data.success) {
        setSitemapPreview(data.data);
        showToast('Sitemap generated successfully!');
      } else {
        showToast(data.error || 'Failed to generate sitemap', 'error');
      }
    } catch (err) {
      showToast('Error generating sitemap', 'error');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  const downloadPdf = () => {
    if (!sitemapPreview) return showToast('Please generate the sitemap first', 'error');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return showToast('Popup blocked! Please allow popups.', 'error');

    const htmlContent = `
      <html>
        <head>
          <title>Mohit Sales Corporation Pvt. Ltd. - Sitemap URL Catalog</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #2d3748; }
            h1 { color: #1e2e5e; border-bottom: 2px solid #1e2e5e; padding-bottom: 10px; margin-bottom: 5px; font-size: 24px; }
            p.meta { color: #718096; font-size: 13px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background-color: #1e2e5e; color: white; text-align: left; padding: 10px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f7fafc; }
            .type { font-weight: bold; color: #4a5568; }
            .priority { text-align: center; }
            .changefreq { text-align: center; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
            .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .print-btn { background-color: #1e2e5e; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1>Sitemap URL Catalog Report</h1>
              <p class="meta">Generated on: ${new Date(sitemapPreview.generatedAt).toLocaleString()} | Total URLs: ${sitemapPreview.totalUrls}</p>
            </div>
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          
          <div style="margin-bottom: 20px; font-size: 14px;">
            <strong>Summary:</strong> 
            Static: ${sitemapPreview.stats.static} | 
            Categories: ${sitemapPreview.stats.categories} | 
            Products: ${sitemapPreview.stats.products} | 
            Legacy Products: ${sitemapPreview.stats.legacyProducts} | 
            Blogs: ${sitemapPreview.stats.blogs}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Type</th>
                <th>Name / URL</th>
                <th style="width: 10%; text-align: center;">Priority</th>
                <th style="width: 15%; text-align: center;">Frequency</th>
                <th style="width: 15%;">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              ${sitemapPreview.urls.map(u => `
                <tr>
                  <td class="type">${u.type}</td>
                  <td>
                    <div style="font-weight: 500;">${u.title}</div>
                    <div style="color: #718096; font-size: 11px;">${u.url}</div>
                  </td>
                  <td class="priority">${u.priority.toFixed(1)}</td>
                  <td class="changefreq">${u.changefreq}</td>
                  <td>${u.lastmod}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const deleteOverride = async (id: string) => {
    if (!confirm('Delete this sitemap override?')) return;
    const res = await fetch(`/api/admin/seo/sitemap/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/seo/sitemap'); showToast('Deleted'); loadOverrides(); }
    else showToast('Failed to delete', 'error');
  };

  // ── ROBOTS CRUD ────────────────────────────────────────────────────────

  const loadRobots = useCallback(async () => {
    setRobotsLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/seo/robots');
      if (data.success && data.data) {
        try { setRobotsRules(JSON.parse(data.data)); } catch { setRobotsRules([]); }
      } else {
        setRobotsRules([{ userAgent: '*', disallow: ['/admin'], allow: ['/'], crawlDelay: undefined }]);
      }
    } catch (err) { console.error(err); }
    setRobotsLoading(false);
  }, [fetchWithCache]);

  useEffect(() => { if (activeTab === 'robots') loadRobots(); }, [activeTab, loadRobots]);

  const saveRobots = async () => {
    setRobotsSaving(true);
    const res = await fetch('/api/admin/seo/robots', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rules: robotsRules }) });
    const data = await res.json();
    if (data.success) { invalidate('/api/admin/seo/robots'); showToast('Robots.txt rules saved'); }
    else showToast('Failed to save', 'error');
    setRobotsSaving(false);
  };

  const addRobotsRule = () => {
    setRobotsRules([...robotsRules, { userAgent: '*', disallow: [], allow: [] }]);
  };

  const removeRobotsRule = (i: number) => {
    setRobotsRules(robotsRules.filter((_, idx) => idx !== i));
  };

  const updateRobotsRule = (i: number, field: keyof RobotsRule, value: any) => {
    const updated = [...robotsRules];
    updated[i] = { ...updated[i], [field]: value };
    setRobotsRules(updated);
  };

  const updateRobotsRuleArray = (i: number, field: 'disallow' | 'allow', value: string) => {
    const updated = [...robotsRules];
    updated[i] = { ...updated[i], [field]: value.split('\n').map(v => v.trim()).filter(Boolean) };
    setRobotsRules(updated);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#38a169' : '#e53e3e', color: '#fff', padding: '12px 20px', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontWeight: 500, fontSize: 'calc(var(--admin-fs) - 1px)' }}>
          {toast.msg}
        </div>
      )}

      {/* ── TAB: WEBMASTER TOOLS ── */}
      {activeTab === 'webmaster' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>Webmaster Tools</h2>
          </div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 20 }}>
            Optimize your site's indexing status and search visibility by configuring search engine verification codes. Paste only the <strong>content</strong> value (e.g. key/ID) rather than the whole meta tag.
          </p>
          {webmasterLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              {[
                { key: 'webmaster_google', label: 'Google Search Console', placeholder: 'e.g. abc123xyz...' },
                { key: 'webmaster_bing', label: 'Bing Webmaster Tools', placeholder: 'e.g. 1A2B3C4D...' },
              ].map((tool) => {
                const setting = webmasterSettings.find(s => s.key === tool.key);
                if (!setting) return null;
                return (
                  <div key={tool.key} style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #edf2f7' }}>
                    <div style={{ width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                      {tool.key === 'webmaster_google' ? (
                        <svg viewBox="0 0 24 24" width="30" height="30">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85c-.22-.66-.35-1.36-.35-2.09z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="30" height="30">
                          <path fill="#008373" d="M19.34 16.03c-.22-.24-.59-.26-.83-.04L13.5 20.25V4.62c0-.33-.27-.6-.6-.6h-1.8c-.33 0-.6.27-.6.6v17.44c0 .41.45.65.79.4l7.98-6.6c.24-.22.26-.59.07-.83z" />
                          <path fill="#00A1F1" d="M10.5 4.02V2.62c0-.33-.27-.6-.6-.6H8.1c-.33 0-.6.27-.6.6v12.28c0 .2.1.39.27.49l2.25 1.35c.31.18.48.51.48.87v2.64l6.63-5.48c.24-.2.59-.18.8.06.21.24.19.59-.05.8l-7.38 6.1c-.24.2-.59.18-.8-.06-.08-.1-.13-.22-.13-.35v-3.71c0-.13-.07-.25-.18-.32l-2.82-1.69c-.43-.26-.69-.73-.69-1.23V2.62c0-.88.72-1.6 1.6-1.6H9.9c.88 0 1.6.72 1.6 1.6v1.4c0 .33-.27.6-.6.6z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>{tool.label}</div>
                      <input
                        value={webmasterValues[setting.id] || ''}
                        onChange={(e) => setWebmasterValues({ ...webmasterValues, [setting.id]: e.target.value })}
                        placeholder={tool.placeholder}
                        disabled={isReadOnly || !isAdmin}
                        style={{ ...inputStyle, width: '100%' }}
                      />
                    </div>
                    {!isReadOnly && isAdmin && (
                      <button
                        onClick={() => handleSaveSettingClick(setting)}
                        disabled={webmasterSaving === setting.id}
                        style={{ ...saveBtn, padding: '8px 16px', fontSize: 'calc(var(--admin-fs) - 2px)', alignSelf: 'flex-end', minWidth: 80 }}
                      >
                        {webmasterSaving === setting.id ? '...' : 'Save'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: Page Meta Tags ── */}
      {activeTab === 'meta' && (
        <div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16, lineHeight: 1.6, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: '10px 14px' }}>
            <strong>How to use:</strong> Add custom title, description & keywords for any page. Enter the page path like <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/about-us</code> or <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/polycab/fans</code>. These override the default meta tags on that page for better SEO ranking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>Page Meta Tags</h2>
            {!isReadOnly && (
              <button className="admin-btn" onClick={() => openMetaModal()} style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add Meta
              </button>
            )}
          </div>
          {metaLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : metas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
              No meta entries yet. Add one to override default page metadata.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7fafc', fontSize: 'calc(var(--admin-fs) - 2px)', color: '#4a5568' }}>
                    <th style={th}>Page Path</th>
                    <th style={th}>Title</th>
                    <th style={th}>Description</th>
                    <th style={th}>noIndex</th>
                    <th style={th}>noFollow</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metas.map(meta => (
                    <tr key={meta.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 3px)' }}>{meta.page}</code></td>
                      <td style={td}><span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.title || <span style={{ color: '#a0aec0' }}>—</span>}</span></td>
                      <td style={td}><span style={{ maxWidth: 220, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>{meta.description || '—'}</span></td>
                      <td style={{ ...td, textAlign: 'center' }}>{meta.noIndex ? <Badge color="#e53e3e">Yes</Badge> : <Badge color="#38a169">No</Badge>}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{meta.noFollow ? <Badge color="#e53e3e">Yes</Badge> : <Badge color="#38a169">No</Badge>}</td>
                      <td style={td}>
                        {!isReadOnly && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openMetaModal(meta)} style={editBtn}>Edit</button>
                            <button onClick={() => deleteMeta(meta.id)} style={delBtn}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: REDIRECTS ── */}
      {activeTab === 'redirects' && (
        <div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16, lineHeight: 1.6, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: '10px 14px' }}>
            <strong>How to use:</strong> Redirect old URLs to new ones. Example: From <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/old-product</code> → To <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/new-product</code>. Use 301 for permanent redirects (SEO value transfers) or 302 for temporary.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>URL Redirects</h2>
            {!isReadOnly && (
              <button onClick={() => openRedirectModal()} style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add Redirect
              </button>
            )}
          </div>
          {redirectLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : redirects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
              No redirects configured yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7fafc', fontSize: 'calc(var(--admin-fs) - 2px)', color: '#4a5568' }}>
                    <th style={th}>From Path</th>
                    <th style={th}>To Path</th>
                    <th style={th}>Type</th>
                    <th style={th}>Active</th>
                    <th style={th}>Hits</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 3px)' }}>{r.fromPath}</code></td>
                      <td style={td}><code style={{ background: '#ebf8ff', padding: '2px 6px', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 3px)', color: '#2b6cb0' }}>{r.toPath}</code></td>
                      <td style={{ ...td, textAlign: 'center' }}><Badge color={r.type === 301 ? '#38a169' : '#d69e2e'}>{r.type}</Badge></td>
                      <td style={{ ...td, textAlign: 'center' }}>{r.isActive ? <Badge color="#38a169">Active</Badge> : <Badge color="#718096">Off</Badge>}</td>
                      <td style={{ ...td, textAlign: 'center', color: '#718096', fontSize: 'calc(var(--admin-fs) - 2px)' }}>{r.hitCount}</td>
                      <td style={td}>
                        {!isReadOnly && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openRedirectModal(r)} style={editBtn}>Edit</button>
                            <button onClick={() => deleteRedirect(r.id)} style={delBtn}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SCHEMA MARKUP ── */}
      {activeTab === 'schema' && (
        <div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16, lineHeight: 1.6, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: '10px 14px' }}>
            <strong>How to use:</strong> Add structured data (JSON-LD) for rich snippets in Google. Select page path, schema type (e.g. Organization, Product), and paste valid JSON-LD. Example: <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>{`{"@type":"Organization","name":"Mohit Sales"}`}</code>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>Schema Markup (JSON-LD)</h2>
            {!isReadOnly && (
              <button onClick={() => openSchemaModal()} style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                + Add Schema
              </button>
            )}
          </div>
          {schemaLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : schemas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
              No schema markup configured yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7fafc', fontSize: 'calc(var(--admin-fs) - 2px)', color: '#4a5568' }}>
                    <th style={th}>Page</th>
                    <th style={th}>Schema Type</th>
                    <th style={th}>Active</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 3px)' }}>{s.page}</code></td>
                      <td style={td}><Badge color="#7c3aed">{s.schemaType}</Badge></td>
                      <td style={{ ...td, textAlign: 'center' }}>{s.isActive ? <Badge color="#38a169">Active</Badge> : <Badge color="#718096">Off</Badge>}</td>
                      <td style={td}>
                        {!isReadOnly && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openSchemaModal(s)} style={editBtn}>Edit</button>
                            <button onClick={() => deleteSchema(s.id)} style={delBtn}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: SITEMAP ── */}
      {activeTab === 'sitemap' && (
        <div>
          {/* Sitemap Generator Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 'calc(var(--admin-fs) + 1px)', fontWeight: 700, color: '#1e2e5e', marginBottom: 8 }}>Sitemap Generator & XML/PDF Export</h3>
            <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16 }}>
              Generate complete URLs for all products, categories, blogs, and static pages. You can preview all links and download them directly as a standard XML sitemap or format it as a PDF catalog.
            </p>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <button 
                onClick={generateSitemapUrls} 
                disabled={generatingSitemap}
                style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)' }}
              >
                {generatingSitemap ? 'Generating...' : '🔍 Generate sitemap URLs'}
              </button>
              
              {sitemapPreview && (
                <>
                  <a 
                    href="/api/admin/seo/sitemap/generate?format=xml" 
                    download="sitemap.xml"
                    style={{ background: '#2b6cb0', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    💾 Download XML
                  </a>
                  
                  <button 
                    onClick={downloadPdf} 
                    style={{ background: '#c53030', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)' }}
                  >
                    📄 Download PDF Report
                  </button>
                </>
              )}
            </div>

            {sitemapPreview && (
              <div style={{ background: '#f7fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
                <h4 style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 700, color: '#4a5568', marginBottom: 12 }}>Generation Stats:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #edf2f7', textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>Total URLs</div>
                    <div style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#1e2e5e' }}>{sitemapPreview.totalUrls}</div>
                  </div>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #edf2f7', textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>Products</div>
                    <div style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#48bb78' }}>{sitemapPreview.stats.products}</div>
                  </div>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #edf2f7', textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>Categories</div>
                    <div style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#3182ce' }}>{sitemapPreview.stats.categories}</div>
                  </div>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #edf2f7', textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>Static Pages</div>
                    <div style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#dd6b20' }}>{sitemapPreview.stats.static}</div>
                  </div>
                  <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #edf2f7', textAlign: 'center' }}>
                    <div style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>Blogs</div>
                    <div style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#805ad5' }}>{sitemapPreview.stats.blogs}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sitemap Overrides (custom priority / changeFreq / exclusion per URL) ── */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 'calc(var(--admin-fs) + 1px)', fontWeight: 700, color: '#1e2e5e', marginBottom: 4 }}>Sitemap Overrides</h3>
                <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', margin: 0 }}>
                  Set a custom priority / change frequency for a specific URL, or exclude it from the sitemap. These apply on top of the auto-generated links.
                </p>
              </div>
              <button onClick={() => openOverrideModal()} style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)', whiteSpace: 'nowrap' }}>
                + Add Override
              </button>
            </div>

            {sitemapLoading ? (
              <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', padding: '16px 0', margin: 0 }}>Loading overrides…</p>
            ) : overrides.length === 0 ? (
              <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', padding: '16px 0', margin: 0 }}>No overrides yet. Add one to customise a URL&apos;s sitemap entry.</p>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'calc(var(--admin-fs) - 2px)' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#718096', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 10px' }}>URL Path</th>
                      <th style={{ padding: '8px 10px' }}>Priority</th>
                      <th style={{ padding: '8px 10px' }}>Change Freq</th>
                      <th style={{ padding: '8px 10px' }}>Excluded</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrides.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e2e5e' }}>{o.urlPath}</td>
                        <td style={{ padding: '8px 10px' }}>{o.priority}</td>
                        <td style={{ padding: '8px 10px' }}>{o.changeFreq}</td>
                        <td style={{ padding: '8px 10px' }}>{o.isExcluded ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button onClick={() => openOverrideModal(o)} style={{ background: 'transparent', border: '1px solid #cbd5e0', color: '#2b6cb0', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 'calc(var(--admin-fs) - 3px)', marginRight: 8 }}>Edit</button>
                          <button onClick={() => deleteOverride(o.id)} style={{ background: 'transparent', border: '1px solid #fbb6b6', color: '#c53030', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 'calc(var(--admin-fs) - 3px)' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Generated URLs Preview Table */}
          {sitemapPreview && (
            <div style={{ marginTop: 24, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h4 style={{ fontSize: 'var(--admin-fs)', fontWeight: 700, color: '#1e2e5e', margin: 0 }}>Generated URLs List ({sitemapPreview.totalUrls} links)</h4>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <input 
                    type="text" 
                    placeholder="🔍 Search URLs..."
                    id="sitemapSearchInput"
                    style={{ ...inputStyle, paddingLeft: 12 }}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const rows = document.querySelectorAll('.sitemap-preview-row');
                      rows.forEach((row: any) => {
                        const text = row.innerText.toLowerCase();
                        if (text.includes(val)) {
                          row.style.display = '';
                        } else {
                          row.style.display = 'none';
                        }
                      });
                    }}
                  />
                </div>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '450px', border: '1px solid #edf2f7', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f7fafc', fontSize: 'calc(var(--admin-fs) - 2px)', color: '#4a5568', borderBottom: '1px solid #edf2f7', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ ...th, padding: '10px 14px' }}>Type</th>
                      <th style={th}>Page Title / URL Path</th>
                      <th style={{ ...th, textAlign: 'center' }}>Priority</th>
                      <th style={{ ...th, textAlign: 'center' }}>Frequency</th>
                      <th style={th}>Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sitemapPreview.urls.map((u, index) => (
                      <tr key={index} className="sitemap-preview-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ ...td, padding: '10px 14px' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            fontSize: 'calc(var(--admin-fs) - 4px)', 
                            fontWeight: 600,
                            background: u.type === 'Product' ? '#def7ec' : u.type === 'Category' ? '#e1f5fe' : u.type === 'Static Page' ? '#feecdc' : '#f3e8ff',
                            color: u.type === 'Product' ? '#03543f' : u.type === 'Category' ? '#0288d1' : u.type === 'Static Page' ? '#b45309' : '#6b21a8'
                          }}>
                            {u.type}
                          </span>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 600, color: '#2d3748' }}>{u.title}</div>
                          <div style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#718096' }}>{u.url.replace(process.env.NEXT_PUBLIC_BASE_URL || 'https://mohitscpl.com', '') || '/'}</div>
                        </td>
                        <td style={{ ...td, textAlign: 'center', fontWeight: 600, color: '#4a5568' }}>{u.priority.toFixed(1)}</td>
                        <td style={{ ...td, textAlign: 'center', color: '#4a5568' }}>{u.changefreq}</td>
                        <td style={{ ...td, fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>{u.lastmod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: ROBOTS.TXT ── */}
      {activeTab === 'robots' && (
        <div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16, lineHeight: 1.6, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: '10px 14px' }}>
            <strong>How to use:</strong> Control which pages search engines can crawl. Disallow paths like <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/admin</code> to block crawlers. Allow paths like <code style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>/</code> to permit crawling. Set crawl delay (seconds) to limit bot speed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>Robots.txt Rules</h2>
            {!isReadOnly && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addRobotsRule} style={{ background: '#e2e8f0', color: '#2d3748', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  + Add Rule
                </button>
                <button onClick={saveRobots} disabled={robotsSaving} style={{ background: '#1e2e5e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, opacity: robotsSaving ? 0.7 : 1 }}>
                  {robotsSaving ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            )}
          </div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 20 }}>
            These rules generate the live <code>/robots.txt</code> served to crawlers.
          </p>
          {robotsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {robotsRules.map((rule, i) => (
                <div key={i} style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <strong style={{ color: '#1a202c', fontSize: 'calc(var(--admin-fs) - 1px)' }}>Rule #{i + 1}</strong>
                    {!isReadOnly && (
                      <button onClick={() => removeRobotsRule(i)} style={{ ...delBtn, padding: '4px 10px', fontSize: 'calc(var(--admin-fs) - 3px)' }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>User-Agent</label>
                      <input
                        value={rule.userAgent}
                        onChange={e => updateRobotsRule(i, 'userAgent', e.target.value)}
                        disabled={isReadOnly}
                        style={inputStyle}
                        placeholder="* or Googlebot"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Disallow (one per line)</label>
                      <textarea
                        value={rule.disallow.join('\n')}
                        onChange={e => updateRobotsRuleArray(i, 'disallow', e.target.value)}
                        disabled={isReadOnly}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 'calc(var(--admin-fs) - 3px)' }}
                        placeholder="/admin&#10;/api"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Allow (one per line)</label>
                      <textarea
                        value={rule.allow.join('\n')}
                        onChange={e => updateRobotsRuleArray(i, 'allow', e.target.value)}
                        disabled={isReadOnly}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 'calc(var(--admin-fs) - 3px)' }}
                        placeholder="/"
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 10, maxWidth: 160 }}>
                    <label style={labelStyle}>Crawl-Delay (seconds)</label>
                    <input
                      type="number"
                      value={rule.crawlDelay ?? ''}
                      onChange={e => updateRobotsRule(i, 'crawlDelay', e.target.value ? Number(e.target.value) : undefined)}
                      disabled={isReadOnly}
                      style={inputStyle}
                      placeholder="optional"
                      min={0}
                    />
                  </div>
                </div>
              ))}
              {robotsRules.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0', background: '#fff', borderRadius: 8, border: '1px dashed #e2e8f0' }}>
                  No rules configured. Click &quot;Add Rule&quot; to get started.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: 404 DETECTED LOGS ── */}
      {activeTab === 'logs404' && (
        <div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16, lineHeight: 1.6, background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: '10px 14px' }}>
            <strong>How to use:</strong> Monitor broken links visitors are hitting. Review URLs, create redirects for important ones, and delete irrelevant entries. High hit-count URLs should be redirected to prevent SEO loss.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>404 Detection Logs</h2>
            {!isReadOnly && logs404.length > 0 && (
              <button onClick={clearAllLogs404} style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 2px)' }}>
                🗑️ Clear All Logs
              </button>
            )}
          </div>
          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', marginBottom: 16 }}>
            Track broken links and pages that users or search crawlers tried to access but could not find. Use the redirect option to map them to working pages.
          </p>
          {logs404Loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#718096' }}>Loading...</div>
          ) : logs404.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#a0aec0', background: '#f7fafc', borderRadius: 8 }}>
              No 404 logs recorded yet. Excellent page health!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7fafc', fontSize: 'calc(var(--admin-fs) - 2px)', color: '#4a5568' }}>
                    <th style={th}>Path</th>
                    <th style={th}>Referrer</th>
                    <th style={{ ...th, textAlign: 'center' }}>Hits</th>
                    <th style={th}>Last Detected</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs404.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={td}><code style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 3px)' }}>{log.path}</code></td>
                      <td style={td}>
                        <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'calc(var(--admin-fs) - 3px)', color: log.referrer ? '#4a5568' : '#a0aec0' }}>
                          {log.referrer || 'Direct / Unknown'}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>{log.hitCount}</td>
                      <td style={{ ...td, fontSize: 'calc(var(--admin-fs) - 3px)', color: '#718096' }}>{new Date(log.updatedAt).toLocaleString()}</td>
                      <td style={td}>
                        {!isReadOnly && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleCreateRedirectFrom404(log.path)} style={{ ...editBtn, background: '#ebf8ff', color: '#2b6cb0' }}>
                              ↪️ Redirect
                            </button>
                            <button onClick={() => deleteLog404(log.id)} style={delBtn}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── META MODAL ── */}
      {showMetaModal && (
        <Modal title={editingMetaId ? 'Edit Meta Tags' : 'Add Meta Tags'} onClose={() => setShowMetaModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Page Path <span style={{ color: '#e53e3e' }}>*</span></label>
              <input value={metaForm.page} onChange={e => setMetaForm({ ...metaForm, page: e.target.value })} style={inputStyle} placeholder="/about-us" />
              <span style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#a0aec0' }}>Exact path, e.g. / or /about-us or /industries/cables</span>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Meta Title</label>
              <input value={metaForm.title || ''} onChange={e => setMetaForm({ ...metaForm, title: e.target.value })} style={inputStyle} placeholder="Page title for search results" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Meta Description</label>
              <textarea value={metaForm.description || ''} onChange={e => setMetaForm({ ...metaForm, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="150–160 character description" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Keywords (comma-separated)</label>
              <input value={metaForm.keywords || ''} onChange={e => setMetaForm({ ...metaForm, keywords: e.target.value })} style={inputStyle} placeholder="Polycab, cables, distributor" />
            </div>
            <div>
              <label style={labelStyle}>OG Title</label>
              <input value={metaForm.ogTitle || ''} onChange={e => setMetaForm({ ...metaForm, ogTitle: e.target.value })} style={inputStyle} placeholder="Open Graph title" />
            </div>
            <div>
              <label style={labelStyle}>OG Image URL</label>
              <input value={metaForm.ogImage || ''} onChange={e => setMetaForm({ ...metaForm, ogImage: e.target.value })} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Canonical URL</label>
              <input value={metaForm.canonicalUrl || ''} onChange={e => setMetaForm({ ...metaForm, canonicalUrl: e.target.value })} style={inputStyle} placeholder="https://mohitscpl.com/..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="noIndex" checked={metaForm.noIndex} onChange={e => setMetaForm({ ...metaForm, noIndex: e.target.checked })} />
              <label htmlFor="noIndex" style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 500 }}>noindex (hide from search engines)</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="noFollow" checked={metaForm.noFollow} onChange={e => setMetaForm({ ...metaForm, noFollow: e.target.checked })} />
              <label htmlFor="noFollow" style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 500 }}>nofollow (don&apos;t follow links)</label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowMetaModal(false)} style={cancelBtn}>Cancel</button>
            <button onClick={saveMeta} style={saveBtn}>Save</button>
          </div>
        </Modal>
      )}

      {/* ── REDIRECT MODAL ── */}
      {showRedirectModal && (
        <Modal title={editingRedirectId ? 'Edit Redirect' : 'Add Redirect'} onClose={() => setShowRedirectModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>From Path <span style={{ color: '#e53e3e' }}>*</span></label>
              <input value={redirectForm.fromPath} onChange={e => setRedirectForm({ ...redirectForm, fromPath: e.target.value })} style={inputStyle} placeholder="/old-page" />
            </div>
            <div>
              <label style={labelStyle}>To Path <span style={{ color: '#e53e3e' }}>*</span></label>
              <input value={redirectForm.toPath} onChange={e => setRedirectForm({ ...redirectForm, toPath: e.target.value })} style={inputStyle} placeholder="/new-page or https://..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Redirect Type</label>
                <select value={redirectForm.type} onChange={e => setRedirectForm({ ...redirectForm, type: Number(e.target.value) })} style={inputStyle}>
                  <option value={301}>301 — Permanent</option>
                  <option value={302}>302 — Temporary</option>
                  <option value={307}>307 — Temporary (Method Preserved)</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                <input type="checkbox" id="isActive" checked={redirectForm.isActive} onChange={e => setRedirectForm({ ...redirectForm, isActive: e.target.checked })} />
                <label htmlFor="isActive" style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 500 }}>Active</label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowRedirectModal(false)} style={cancelBtn}>Cancel</button>
            <button onClick={saveRedirect} style={saveBtn}>Save</button>
          </div>
        </Modal>
      )}

      {/* ── SCHEMA MODAL ── */}
      {showSchemaModal && (
        <Modal title={editingSchemaId ? 'Edit Schema Markup' : 'Add Schema Markup'} onClose={() => setShowSchemaModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Page Path <span style={{ color: '#e53e3e' }}>*</span></label>
                <input value={schemaForm.page} onChange={e => setSchemaForm({ ...schemaForm, page: e.target.value })} style={inputStyle} placeholder="/about-us" />
              </div>
              <div>
                <label style={labelStyle}>Schema Type</label>
                <select value={schemaForm.schemaType} onChange={e => setSchemaForm({ ...schemaForm, schemaType: e.target.value })} style={inputStyle}>
                  {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>JSON-LD <span style={{ color: '#e53e3e' }}>*</span></label>
              <textarea
                value={schemaForm.jsonLd}
                onChange={e => {
                  setSchemaForm({ ...schemaForm, jsonLd: e.target.value });
                  try { JSON.parse(e.target.value); setJsonError(''); } catch { setJsonError('Invalid JSON'); }
                }}
                rows={10}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 'calc(var(--admin-fs) - 3px)' }}
                placeholder='{"@context":"https://schema.org","@type":"Organization",...}'
              />
              {jsonError && <span style={{ color: '#e53e3e', fontSize: 'calc(var(--admin-fs) - 3px)' }}>{jsonError}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="schemaActive" checked={schemaForm.isActive} onChange={e => setSchemaForm({ ...schemaForm, isActive: e.target.checked })} />
              <label htmlFor="schemaActive" style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 500 }}>Active (inject into page)</label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowSchemaModal(false)} style={cancelBtn}>Cancel</button>
            <button onClick={saveSchema} disabled={!!jsonError} style={{ ...saveBtn, opacity: jsonError ? 0.5 : 1 }}>Save</button>
          </div>
        </Modal>
      )}

      {/* ── SITEMAP OVERRIDE MODAL ── */}
      {showOverrideModal && (
        <Modal title={editingOverrideId ? 'Edit Sitemap Override' : 'Add Sitemap Override'} onClose={() => setShowOverrideModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>URL Path <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                value={overrideForm.urlPath}
                onChange={e => setOverrideForm({ ...overrideForm, urlPath: e.target.value })}
                style={{ ...inputStyle, ...(editingOverrideId ? { background: '#f7fafc', color: '#718096' } : {}) }}
                placeholder="/about-us"
                disabled={!!editingOverrideId}
                title={editingOverrideId ? 'URL path cannot be changed while editing' : ''}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Priority (0.0 – 1.0)</label>
                <input type="number" min={0} max={1} step={0.1} value={overrideForm.priority} onChange={e => setOverrideForm({ ...overrideForm, priority: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Change Frequency</label>
                <select value={overrideForm.changeFreq} onChange={e => setOverrideForm({ ...overrideForm, changeFreq: e.target.value })} style={inputStyle}>
                  {CHANGE_FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="isExcluded" checked={overrideForm.isExcluded} onChange={e => setOverrideForm({ ...overrideForm, isExcluded: e.target.checked })} />
              <label htmlFor="isExcluded" style={{ fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 500 }}>Exclude from sitemap</label>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowOverrideModal(false)} style={cancelBtn}>Cancel</button>
            <button onClick={saveOverride} style={saveBtn}>Save</button>
          </div>
        </Modal>
      )}

      {/* Password Verification Modal */}
      {confirmSetting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 450, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>🔐 Verify Administrator Password</h3>
              <button onClick={() => setConfirmSetting(null)} style={{ background: 'none', border: 'none', fontSize: 'calc(var(--admin-fs) + 7px)', cursor: 'pointer', color: '#718096', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleConfirmSave}>
              <p style={{ fontSize: 'calc(var(--admin-fs) - 1px)', color: '#4a5568', marginBottom: 16, lineHeight: 1.5 }}>
                You are saving changes to <strong>{confirmSetting.label || confirmSetting.key}</strong>. For security, please enter your password to authorize this update.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setConfirmSetting(null)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={webmasterSaving === confirmSetting.id} style={saveBtn}>
                  {webmasterSaving === confirmSetting.id ? 'Saving...' : 'Verify & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 700, color: '#1a202c' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 'calc(var(--admin-fs) + 7px)', cursor: 'pointer', color: '#718096', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ background: color, color: '#fff', fontSize: 'calc(var(--admin-fs) - 4px)', fontWeight: 700, padding: '2px 8px', borderRadius: 12, display: 'inline-block' }}>
      {children}
    </span>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 3px)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '12px 12px', fontSize: 'calc(var(--admin-fs) - 1px)', verticalAlign: 'middle' };
const editBtn: React.CSSProperties = { background: '#ebf8ff', color: '#2b6cb0', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600 };
const delBtn: React.CSSProperties = { background: '#fff5f5', color: '#c53030', border: 'none', padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600 };
const saveBtn: React.CSSProperties = { background: '#1e2e5e', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)' };
const cancelBtn: React.CSSProperties = { background: '#e2e8f0', color: '#2d3748', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 'calc(var(--admin-fs) - 1px)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 1px)', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, color: '#4a5568', marginBottom: 5 };
