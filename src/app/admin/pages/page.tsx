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
  const [pages, setPages] = useState<PageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editHeading, setEditHeading] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const limit = 25;

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
      } else {
        alert(data.message || 'Error saving.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (editingPage) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Edit Page: /{editingPage.slug}</h2>
          <button onClick={() => setEditingPage(null)} style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Back to List
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Title</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Heading</label>
            <input value={editHeading} onChange={e => setEditHeading(e.target.value)} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Status</label>
            <select value={editActive ? 'active' : 'inactive'} onChange={e => setEditActive(e.target.value === 'active')} disabled={isReadOnly} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>HTML Content</label>
          {loadingContent ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading content...</div>
          ) : (
            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              disabled={isReadOnly}
              style={{ width: '100%', minHeight: 500, padding: 12, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
            />
          )}
        </div>

        {!isReadOnly && (
          <button onClick={saveChanges} disabled={saving} style={{ padding: '10px 28px', background: saving ? '#9ca3af' : '#1e2e5e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Page Content ({total})</h2>
        <input
          type="text"
          placeholder="Search by slug, title..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, width: 300, fontSize: 14 }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
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
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13 }}>/{p.slug}</td>
                  <td style={{ padding: '10px 12px' }}>{p.title || '—'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#166534' : '#991b1b' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button onClick={() => openEditor(p)} style={{ padding: '5px 14px', background: '#1e2e5e', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: 4, background: currentPage <= 1 ? '#f3f4f6' : '#fff', cursor: currentPage <= 1 ? 'default' : 'pointer' }}>Prev</button>
              <span style={{ padding: '6px 14px', fontSize: 14 }}>Page {currentPage} of {totalPages}</span>
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
