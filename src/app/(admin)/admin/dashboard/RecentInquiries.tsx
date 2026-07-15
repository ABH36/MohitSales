'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export interface DashInquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  mobile: string;
  message: string;
  status: string;
  source: string;
  createdAt: string; // ISO string
}

/** Map a status to an existing admin-badge colour class. */
function statusBadge(status: string): string {
  switch (status) {
    case 'new': return 'admin-badge-info';
    case 'replied': return 'admin-badge-success';
    case 'closed': return 'admin-badge-danger';
    default: return 'admin-badge-warning'; // read
  }
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/**
 * Recent-inquiries panel for the dashboard. Rows are clickable — selecting one
 * opens a modal with the full inquiry, including the message the visitor sent.
 * Data is passed in from the server component (100% DB-driven).
 */
export default function RecentInquiries({ inquiries }: { inquiries: DashInquiry[] }) {
  const [selected, setSelected] = useState<DashInquiry | null>(null);

  // Close the modal on Escape for a polished feel.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <>
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3 className="admin-table-title">Recent Inquiries</h3>
          <Link href="/admin/inquiries" className="admin-btn admin-btn-outline admin-btn-sm">
            View All →
          </Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>
              <th aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr
                  key={inq.id}
                  className="admin-row-clickable"
                  onClick={() => setSelected(inq)}
                  title="Click to read the full query"
                >
                  <td style={{ fontWeight: 600 }}>{inq.name}</td>
                  <td>{inq.company || '—'}</td>
                  <td>{inq.email}</td>
                  <td>
                    <span className={`admin-badge ${statusBadge(inq.status)}`}>
                      {inq.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: 'calc(var(--admin-fs) - 3px)', whiteSpace: 'nowrap' }}>
                    {fmtDate(inq.createdAt)}
                  </td>
                  <td className="admin-row-cta">View →</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Inquiry from {selected.name}</h3>
              <button className="admin-modal-close" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-inq-grid">
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Company</span>
                  <span className="admin-inq-v">{selected.company || '—'}</span>
                </div>
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Status</span>
                  <span className="admin-inq-v">
                    <span className={`admin-badge ${statusBadge(selected.status)}`}>
                      {selected.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Email</span>
                  <span className="admin-inq-v">
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--admin-accent)' }}>{selected.email}</a>
                  </span>
                </div>
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Mobile</span>
                  <span className="admin-inq-v">
                    <a href={`tel:${selected.mobile}`} style={{ color: 'var(--admin-accent)' }}>{selected.mobile}</a>
                  </span>
                </div>
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Source</span>
                  <span className="admin-inq-v" style={{ textTransform: 'capitalize' }}>{selected.source}</span>
                </div>
                <div className="admin-inq-field">
                  <span className="admin-inq-k">Received</span>
                  <span className="admin-inq-v">{fmtDateTime(selected.createdAt)}</span>
                </div>
              </div>

              <div className="admin-inq-message-label">Message / Query</div>
              <div className="admin-inq-message">{selected.message}</div>
            </div>
            <div className="admin-modal-footer">
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-primary admin-btn-sm">
                Reply via Email
              </a>
              <Link href="/admin/inquiries" className="admin-btn admin-btn-outline admin-btn-sm">
                Manage in Inquiries
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
