'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import SkeletonTable from '../components/SkeletonTable';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  company: string | null;
  message: string;
  status: string;
  source?: string;
  createdAt: string;
}

const LIMIT = 25;

function statusBadge(status: string): string {
  switch (status) {
    case 'new': return 'admin-badge-info';
    case 'replied': return 'admin-badge-success';
    case 'closed': return 'admin-badge-danger';
    default: return 'admin-badge-warning'; // read
  }
}
const sourceLabel = (s?: string) => (s === 'feedback' ? 'Feedback Form' : 'Contact Form');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminInquiriesPage() {
  return (
    <AdminShell pageTitle="Inquiries">
      <AdminInquiriesPageInner />
    </AdminShell>
  );
}

function AdminInquiriesPageInner() {
  const { user } = useAdmin();
  const isReadOnly = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN'; // clear-all is admin-only

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState({ total: 0, new: 0, replied: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'feedback'>('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const showToast = (msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(LIMIT), source: sourceFilter });
      const res = await fetch(`/api/admin/inquiries?${params}`);
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    }
    setLoading(false);
  }, [currentPage, sourceFilter]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);
  // Reset to the first page whenever the source filter changes.
  useEffect(() => { setCurrentPage(1); }, [sourceFilter]);
  // Close the modal on Escape.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Status updated successfully');
        setSelected((s) => (s && s.id === id ? { ...s, status: newStatus } : s));
        fetchInquiries();
      } else showToast('Failed to update status', 'error');
    } catch { showToast('Error updating status', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Inquiry deleted successfully');
        setSelected(null);
        fetchInquiries();
      } else showToast(data.message || 'Failed to delete inquiry', 'error');
    } catch { showToast('Error deleting inquiry', 'error'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('WARNING: Delete ALL inquiries? This permanently wipes every inquiry log from the database.')) return;
    try {
      const res = await fetch('/api/admin/inquiries', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('All inquiries cleared successfully');
        setCurrentPage(1);
        fetchInquiries();
      } else showToast(data.message || 'Failed to clear inquiries', 'error');
    } catch { showToast('Error clearing inquiries', 'error'); }
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
            <div className="admin-stat-label">Total Inquiries</div>
          </div>
          <div className="admin-stat-icon green">📩</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{counts.new}</div>
            <div className="admin-stat-label">New (Unread)</div>
          </div>
          <div className="admin-stat-icon blue">🔵</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{counts.replied}</div>
            <div className="admin-stat-label">Replied</div>
          </div>
          <div className="admin-stat-icon green">✅</div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-table-title">All Inquiries</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAdmin && counts.total > 0 && (
              <button
                onClick={handleClearAll}
                className="admin-btn"
                style={{ padding: '6px 14px', fontSize: 'calc(var(--admin-fs) - 2px)', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
              >
                🗑️ Clear All
              </button>
            )}
            <label style={{ fontSize: 'calc(var(--admin-fs) - 1px)', color: '#4a5568', fontWeight: 600 }}>Source:</label>
            <select
              value={sourceFilter}
              onChange={(e: any) => setSourceFilter(e.target.value)}
              className="admin-form-select"
              style={{ width: '160px', display: 'inline-block', padding: '6px 12px', fontSize: 'calc(var(--admin-fs) - 2px)', margin: 0 }}
            >
              <option value="all">All Sources</option>
              <option value="website">Contact Form</option>
              <option value="feedback">Feedback Form</option>
            </select>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No inquiries matching this filter.</td></tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq.id} className="admin-row-clickable" onClick={() => setSelected(inq)} title="Click to read the full query">
                    <td style={{ fontWeight: 600 }}>{inq.name}</td>
                    <td>{inq.company || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}><a href={`mailto:${inq.email}`} style={{ color: '#F7931E' }}>{inq.email}</a></td>
                    <td>{inq.mobile}</td>
                    <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inq.message}
                    </td>
                    <td>
                      <span className={`admin-badge ${statusBadge(inq.status)}`}>{inq.status.toUpperCase()}</span>
                    </td>
                    <td style={{ color: '#718096', fontSize: 'calc(var(--admin-fs) - 3px)', whiteSpace: 'nowrap' }}>{fmtDate(inq.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          disabled={isReadOnly}
                          className="admin-form-select"
                          style={{ padding: '4px 8px', fontSize: 'calc(var(--admin-fs) - 3px)', width: 'auto', display: 'inline-block', minWidth: '100px', margin: 0 }}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="closed">Closed</option>
                        </select>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleDelete(inq.id)}
                            title="Delete Inquiry"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'calc(var(--admin-fs) + 1px)', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fed7d7')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            🗑️
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
            <span style={{ padding: '6px 14px', fontSize: 14 }}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="admin-btn admin-btn-outline admin-btn-sm" style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        )}
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Inquiry from {selected.name}</h3>
              <button className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-inq-grid">
                <div className="admin-inq-field"><span className="admin-inq-k">Company</span><span className="admin-inq-v">{selected.company || '—'}</span></div>
                <div className="admin-inq-field"><span className="admin-inq-k">Status</span><span className="admin-inq-v"><span className={`admin-badge ${statusBadge(selected.status)}`}>{selected.status.toUpperCase()}</span></span></div>
                <div className="admin-inq-field"><span className="admin-inq-k">Email</span><span className="admin-inq-v"><a href={`mailto:${selected.email}`} style={{ color: 'var(--admin-accent)' }}>{selected.email}</a></span></div>
                <div className="admin-inq-field"><span className="admin-inq-k">Mobile</span><span className="admin-inq-v"><a href={`tel:${selected.mobile}`} style={{ color: 'var(--admin-accent)' }}>{selected.mobile}</a></span></div>
                <div className="admin-inq-field"><span className="admin-inq-k">Source</span><span className="admin-inq-v">{sourceLabel(selected.source)}</span></div>
                <div className="admin-inq-field"><span className="admin-inq-k">Received</span><span className="admin-inq-v">{fmtDateTime(selected.createdAt)}</span></div>
              </div>
              <div className="admin-inq-message-label">Message / Query</div>
              <div className="admin-inq-message">{selected.message}</div>
            </div>
            <div className="admin-modal-footer">
              {!isReadOnly && (
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(selected.id, e.target.value)}
                  className="admin-form-select"
                  style={{ width: 'auto', minWidth: 120, margin: 0 }}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              )}
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-primary admin-btn-sm">Reply via Email</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
