'use client';

export default function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="admin-table-wrapper" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-box" style={{ width: '180px', height: '22px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton-box" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
          <div className="skeleton-box" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>
      <table className="admin-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: '12px 16px' }}>
                <div className="skeleton-box" style={{ width: `${60 + (i % 3) * 20}px`, height: '12px' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: '14px 16px' }}>
                  <div className="skeleton-box" style={{ width: `${50 + ((r + c) % 4) * 25}%`, maxWidth: '180px', height: '14px' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', padding: '4px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-table-wrapper" style={{ padding: '16px', overflow: 'hidden' }}>
          <div className="skeleton-box" style={{ width: '100%', height: '120px', borderRadius: '8px', marginBottom: '12px' }} />
          <div className="skeleton-box" style={{ width: '70%', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '40%', height: '12px' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '16px', marginBottom: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-table-wrapper" style={{ padding: '20px', overflow: 'hidden' }}>
          <div className="skeleton-box" style={{ width: '50%', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton-box" style={{ width: '70%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
