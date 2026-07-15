'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';

interface PageItem {
  id: string;
  slug: string;
  legacyPath: string | null;
  title: string | null;
  heading: string | null;
  isActive: boolean;
  updatedAt: string;
}

function PagesContent() {
  const { user } = useAdmin();
  const isReadOnly = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';
  const [pages, setPages] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editHeading, setEditHeading] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const limit = 25;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Debounce the search box so we don't fire an API call on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/pages?${params}`);
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const openEditor = async (page: PageItem) => {
    setEditingPage(page);
    setEditTitle(page.title || '');
    setEditHeading(page.heading || '');
    setEditActive(page.isActive);
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`);
      const data = await res.json();
      if (data.success) {
        setHtmlContent(data.data.htmlContent || '');
      }
    } catch (err) {
      console.error('Error loading page content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const saveChanges = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          htmlContent,
          title: editTitle || null,
          heading: editHeading || null,
          isActive: editActive
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingPage(null);
        fetchPages();
        showToast('Page saved successfully.');
      } else {
        showToast(data.message || 'Error saving.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (p: PageItem) => {
    if (!window.confirm(`Delete /${p.slug}? This permanently removes the page and cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/admin/pages/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Page deleted.');
        fetchPages();
      } else {
        showToast(data.message || 'Failed to delete.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // Fixed toast shown in both the list and editor views.
  const toastEl = toast && (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, padding: '12px 22px', borderRadius: 8, color: '#fff', fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: toast.type === 'error' ? '#ef4444' : '#16a34a' }}>
      {toast.msg}
    </div>
  );

  if (editingPage) {
    return (
      <div>
        {toastEl}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 'calc(var(--admin-fs) + 5px)' }}>Edit Page: /{editingPage.slug}</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={`/${editingPage.slug}`} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#eef2ff', color: '#1e2e5e', border: '1px solid #c7d2fe', borderRadius: 6, cursor: 'pointer', fontSize: 'calc(var(--admin-fs) - 1px)', fontWeight: 600, textDecoration: 'none' }}>
              View on site ↗
            </a>
            <button onClick={() => setEditingPage(null)} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Back to List
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, marginBottom: 4 }}>Title</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 1px)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, marginBottom: 4 }}>Heading</label>
            <input value={editHeading} onChange={e => setEditHeading(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 1px)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, marginBottom: 4 }}>Status</label>
            <select value={editActive ? 'active' : 'inactive'} onChange={e => setEditActive(e.target.value === 'active')} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 1px)' }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, marginBottom: 4 }}>HTML Content</label>
          {loadingContent ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading content...</div>
          ) : (
            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              disabled={isReadOnly}
              style={{ width: '100%', minHeight: 500, padding: 12, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 2px)', fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
            />
          )}
        </div>

        {!isReadOnly && (
          <button onClick={saveChanges} disabled={saving} style={{ padding: '10px 28px', background: saving ? '#9ca3af' : '#1e2e5e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 'var(--admin-fs)', fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {toastEl}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 'calc(var(--admin-fs) + 5px)' }}>Page Content ({total})</h2>
        <input
          type="text"
          placeholder="Search by slug, title..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, width: 300, fontSize: 'calc(var(--admin-fs) - 1px)' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'calc(var(--admin-fs) - 1px)' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Slug</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Updated</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 'calc(var(--admin-fs) - 2px)' }}>/{p.slug}</td>
                  <td style={{ padding: '10px 12px' }}>{p.title || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 'calc(var(--admin-fs) - 3px)', fontWeight: 600, background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#166534' : '#991b1b' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 'calc(var(--admin-fs) - 3px)', color: '#6b7280' }}>
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button onClick={() => openEditor(p)} style={{ padding: '5px 14px', background: '#1e2e5e', color: '#fff', border: 'none', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 2px)', cursor: 'pointer' }}>
                        Edit
                      </button>
                      {isAdmin && (
                        <button onClick={() => deletePage(p)} disabled={deletingId === p.id} title="Delete page (admin only)" style={{ padding: '5px 12px', background: deletingId === p.id ? '#fca5a5' : '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 4, fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, cursor: deletingId === p.id ? 'default' : 'pointer' }}>
                          {deletingId === p.id ? '…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: currentPage <= 1 ? '#f3f4f6' : '#fff', cursor: currentPage <= 1 ? 'default' : 'pointer' }}>Prev</button>
              <span style={{ padding: '6px 14px', fontSize: 'calc(var(--admin-fs) - 1px)' }}>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: currentPage >= totalPages ? '#f3f4f6' : '#fff', cursor: currentPage >= totalPages ? 'default' : 'pointer' }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminShell pageTitle="Page Content">
      <PagesContent />
    </AdminShell>
  );
}
