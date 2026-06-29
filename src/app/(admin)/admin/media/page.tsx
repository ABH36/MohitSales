'use client';

import { useState, useEffect, useRef } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache, getCached } from '../components/AdminCacheProvider';
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
  const { fetchWithCache, invalidate } = useAdminCache();
  const cached = getCached('/api/admin/media');
  const isReadOnly = user?.role === 'VIEWER';
  const [media, setMedia] = useState<MediaFile[]>(cached?.success ? cached.data : []);
  const [loading, setLoading] = useState(!cached?.success);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/media');
      if (data.success) {
        setMedia(data.data);
      } else {
        showToast(data.message || 'Failed to load media files', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch media', err);
      showToast('Error loading media files', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        invalidate('/api/admin/media');
        showToast('File uploaded successfully', 'success');
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

  const handleDelete = async (id: string) => {
    if (isReadOnly || deletingId) return;
    if (!confirm('Are you sure you want to delete this file?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        invalidate('/api/admin/media');
        showToast('File deleted successfully', 'success');
        fetchMedia();
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
            <div className="admin-stat-value">{media.length}</div>
            <div className="admin-stat-label">Total Files</div>
          </div>
          <div className="admin-stat-icon red">🖼️</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">
              {media.filter(m => m.mimeType.startsWith('image/')).length}
            </div>
            <div className="admin-stat-label">Images</div>
          </div>
          <div className="admin-stat-icon blue">📸</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">
              {media.filter(m => m.mimeType === 'application/pdf').length}
            </div>
            <div className="admin-stat-label">PDFs</div>
          </div>
          <div className="admin-stat-icon orange">📄</div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">All Media Files</h3>
          {!isReadOnly ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#718096', fontStyle: 'italic' }}>Read Only</span>
          )}
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
                    <div className="admin-empty-text">No media files uploaded yet.</div>
                  </div>
                </td></tr>
              ) : (
                media.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.mimeType.startsWith('image/') ? (
                        <img src={m.url} alt={m.filename} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📄</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.filename}</td>
                    <td><span className="admin-badge admin-badge-info">{m.mimeType.split('/')[1]?.toUpperCase()}</span></td>
                    <td style={{ color: '#718096' }}>{(m.size / 1024).toFixed(1)} KB</td>
                    <td style={{ color: '#718096', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(m.url);
                            showToast('URL copied!', 'success');
                          }}
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
      </div>
    </>
  );
}
