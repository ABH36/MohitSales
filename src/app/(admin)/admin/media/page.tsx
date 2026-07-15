'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { SkeletonCards } from '../components/SkeletonTable';

interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  return (
    <AdminShell pageTitle="Media Library">
      <AdminMediaPageInner />
    </AdminShell>
  );
}

function AdminMediaPageInner() {
  const { user } = useAdmin();
  const isReadOnly = user?.role === 'VIEWER';
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [counts, setCounts] = useState({ total: 0, images: 0, pdfs: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'pdf'>('all');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: '24', search, type: typeFilter });
      const data = await fetch(`/api/admin/media?${params}`).then((r) => r.json());
      if (data.success) {
        setMedia(data.data);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
      } else {
        showToast(data.message || 'Failed to load media files', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch media', err);
      showToast('Error loading media files', 'error');
    }
    setLoading(false);
  }, [currentPage, search, typeFilter]);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);
  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);
  // Reset to page 1 when the type filter changes.
  useEffect(() => { setCurrentPage(1); }, [typeFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        showToast('File uploaded successfully', 'success');
        setCurrentPage(1);
        fetchMedia();
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, force = false) => {
    if (isReadOnly || deletingId) return;
    if (!force && !confirm('Are you sure you want to delete this file?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media?id=${id}${force ? '&force=true' : ''}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('File deleted successfully', 'success');
        fetchMedia();
      } else if (res.status === 409 && data.inUse) {
        setDeletingId(null);
        if (window.confirm(`⚠️ ${data.message}\n\nDelete it anyway?`)) {
          handleDelete(id, true);
        }
        return;
      } else {
        showToast(data.message || 'Failed to delete file', 'error');
      }
    } catch (error) {
      showToast('Error deleting file', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', background: toast.type === 'error' ? '#f56565' : '#48bb78', color: 'white', borderRadius: '4px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {toast.msg}
        </div>
      )}

      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{counts.total}</div>
            <div className="admin-stat-label">Total Files</div>
          </div>
          <div className="admin-stat-icon red">🖼️</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{counts.images}</div>
            <div className="admin-stat-label">Images</div>
          </div>
          <div className="admin-stat-icon blue">📸</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{counts.pdfs}</div>
            <div className="admin-stat-label">PDFs</div>
          </div>
          <div className="admin-stat-icon orange">📄</div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h3 className="admin-table-title">All Media Files</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search filename…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 'calc(var(--admin-fs) - 2px)', width: 200 }}
            />
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="admin-form-select"
              style={{ width: 130, padding: '7px 10px', fontSize: 'calc(var(--admin-fs) - 2px)', margin: 0 }}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
            </select>
            {!isReadOnly ? (
              <>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                <button className="admin-btn admin-btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </>
            ) : (
              <span style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#718096', fontStyle: 'italic' }}>Read Only</span>
            )}
          </div>
        </div>

        {loading ? (
          <SkeletonCards count={6} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Filename</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                  <div className="admin-empty">
                    <div className="admin-empty-icon">🖼️</div>
                    <div className="admin-empty-text">{search || typeFilter !== 'all' ? 'No media matches this filter.' : 'No media files uploaded yet.'}</div>
                  </div>
                </td></tr>
              ) : (
                media.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.mimeType.startsWith('image/') ? (
                        <img src={m.url} alt={m.filename} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'calc(var(--admin-fs) + 5px)' }}>📄</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.filename}</td>
                    <td><span className="admin-badge admin-badge-info">{m.mimeType.split('/')[1]?.toUpperCase()}</span></td>
                    <td style={{ color: '#718096' }}>{(m.size / 1024).toFixed(1)} KB</td>
                    <td style={{ color: '#718096', fontSize: 'calc(var(--admin-fs) - 3px)', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => { navigator.clipboard.writeText(m.url); showToast('URL copied!', 'success'); }}
                        >
                          Copy URL
                        </button>
                        {!isReadOnly && (
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => handleDelete(m.id)}
                            disabled={deletingId === m.id}
                          >
                            {deletingId === m.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '18px 0' }}>
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)} className="admin-btn admin-btn-outline admin-btn-sm" style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}>Prev</button>
            <span style={{ padding: '6px 14px', fontSize: 'calc(var(--admin-fs) - 1px)' }}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="admin-btn admin-btn-outline admin-btn-sm" style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>
    </>
  );
}
