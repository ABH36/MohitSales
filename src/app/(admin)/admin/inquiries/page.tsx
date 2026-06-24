'use client';

import { useState, useEffect } from 'react';
import AdminShell, { useAdmin } from '../components/AdminShell';
import { useAdminCache, getCached } from '../components/AdminCacheProvider';
import SkeletonTable from '../components/SkeletonTable';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  company: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  return (
    <AdminShell pageTitle="Inquiries">
      <AdminInquiriesPageInner />
    </AdminShell>
  );
}

function AdminInquiriesPageInner() {
  const { user } = useAdmin();
  const { fetchWithCache, invalidate } = useAdminCache();
  const isReadOnly = user?.role === 'VIEWER';
  const cached = getCached('/api/admin/inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>(cached?.success ? cached.data : []);
  const [loading, setLoading] = useState(!cached?.success);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'website' | 'feedback'>('all');

  const filteredInquiries = inquiries.filter(inq => {
    if (sourceFilter === 'all') return true;
    const src = (inq as any).source || 'website';
    return src.toLowerCase() === sourceFilter;
  });

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await fetchWithCache('/api/admin/inquiries');
      if (data.success) {
        setInquiries(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
        invalidate('/api/admin/inquiries');
        showToast('Status updated successfully', 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Error updating status', 'error');
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
            <div className="admin-stat-value">{inquiries.length}</div>
            <div className="admin-stat-label">Total Inquiries</div>
          </div>
          <div className="admin-stat-icon green">📩</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{inquiries.filter(i => i.status === 'new').length}</div>
            <div className="admin-stat-label">New (Unread)</div>
          </div>
          <div className="admin-stat-icon blue">🔵</div>
        </div>
        <div className="admin-stat-card">
          <div>
            <div className="admin-stat-value">{inquiries.filter(i => i.status === 'replied').length}</div>
            <div className="admin-stat-label">Replied</div>
          </div>
          <div className="admin-stat-icon green">✅</div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-table-title">All Inquiries</h3>
          <div>
            <label style={{ fontSize: '14px', marginRight: '8px', color: '#4a5568', fontWeight: 600 }}>Source:</label>
            <select 
              value={sourceFilter} 
              onChange={(e: any) => setSourceFilter(e.target.value)}
              className="admin-form-select"
              style={{ width: '160px', display: 'inline-block', padding: '6px 12px', fontSize: '13px' }}
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
              {filteredInquiries.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>No inquiries matching this filter.</td></tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ fontWeight: 600 }}>{inq.name}</td>
                    <td>{inq.company}</td>
                    <td><a href={`mailto:${inq.email}`} style={{ color: '#F7931E' }}>{inq.email}</a></td>
                    <td>{inq.mobile}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inq.message}
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        inq.status === 'new' ? 'admin-badge-info' :
                        inq.status === 'replied' ? 'admin-badge-success' :
                        inq.status === 'closed' ? 'admin-badge-secondary' :
                        'admin-badge-warning' // read
                      }`}>
                        {inq.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: '#718096', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <select 
                        value={inq.status} 
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        disabled={isReadOnly}
                        className="admin-form-select"
                        style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', display: 'inline-block', minWidth: '100px' }}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
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
