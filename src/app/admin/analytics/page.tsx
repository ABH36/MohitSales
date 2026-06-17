'use client';

import { useState, useEffect, useRef } from 'react';
import AdminShell from '../components/AdminShell';

interface AnalyticsData {
  overview: {
    products: { total: number; active: number };
    categories: { total: number };
    blogs: { total: number; views: number };
    inquiries: { total: number; status: { new: number; read: number; replied: number; archived: number } };
    media: { total: number; size: number };
  };
  inventory: {
    outOfStock: number;
    lowStock: number;
    alerts: Array<{ id: string; title: string; slug: string; stock: number }>;
  };
  categoriesDistribution: Array<{ name: string; count: number }>;
  inquiryTrend: Array<{ date: string; count: number }>;
  inquirySources: Array<{ source: string; count: number }>;
  inquiryLocales: Array<{ locale: string; count: number }>;
  topBlogs: Array<{ id: string; title: string; slug: string; views: number; isPublished: boolean; category: string }>;
  mediaTypes: Array<{ type: string; count: number; size: number }>;
  heaviestMedia: Array<{ id: string; filename: string; url: string; mimeType: string; size: number }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Line Chart state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format functions
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getReplyRate = () => {
    if (!data) return 0;
    const { total, status } = data.overview.inquiries;
    if (total === 0) return 100;
    return Math.round(((status.replied + status.archived) / total) * 100);
  };

  // SVG Line Chart coordinates generators
  const width = 640;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  let points: Array<{ x: number; y: number; count: number; date: string }> = [];
  let linePath = '';
  let areaPath = '';

  if (data && data.inquiryTrend && data.inquiryTrend.length > 0) {
    const trend = data.inquiryTrend;
    const maxVal = Math.max(...trend.map(t => t.count), 5);
    points = trend.map((val, idx) => {
      const x = paddingLeft + (idx * chartWidth) / (trend.length - 1);
      const y = paddingTop + chartHeight - (val.count * chartHeight) / maxVal;
      return { x, y, count: val.count, date: val.date };
    });

    linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current || points.length === 0) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find the closest point index
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    setTooltipPos({ x: points[closestIdx].x, y: points[closestIdx].y - 10 });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Render Section
  return (
    <AdminShell pageTitle="Real-time Analytics">
      <div className="analytics-header">
        <p className="analytics-subtitle">实时系统分析 | 100% accurate metrics aggregated from live database tables.</p>
        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchAnalytics} disabled={loading} style={{ background: '#fff' }}>
          🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        /* Shimmer Loading Skeleton */
        <div className="skeleton-grid">
          <div className="skeleton-card header-skeleton"></div>
          <div className="skeleton-card header-skeleton"></div>
          <div className="skeleton-card header-skeleton"></div>
          <div className="skeleton-card header-skeleton"></div>
          <div className="skeleton-chart"></div>
          <div className="skeleton-list"></div>
          <div className="skeleton-list"></div>
        </div>
      ) : error || !data ? (
        <div className="analytics-error-box">
          <span className="error-icon">⚠️</span>
          <h4>Analytics Fetch Error</h4>
          <p>{error || 'No database stats response received.'}</p>
          <button className="admin-btn admin-btn-primary" onClick={fetchAnalytics}>Try Again</button>
        </div>
      ) : (
        /* Premium Dashboard Content */
        <div className="analytics-dashboard-container">
          
          {/* Glassmorphic Indicator Cards Grid */}
          <div className="analytics-kpi-grid">
            
            {/* KPI Card 1: Inquiries volume */}
            <div className="kpi-card glass-card">
              <div className="kpi-icon-row">
                <span className="kpi-icon orange">📩</span>
                <span className="kpi-trend success">+{data.overview.inquiries.status.new} new</span>
              </div>
              <div className="kpi-value">{data.overview.inquiries.total}</div>
              <div className="kpi-label">Total Inquiries Received</div>
              <div className="kpi-footer-metric">
                <div className="reply-rate-bar-container">
                  <div className="reply-rate-label">
                    <span>Reply Efficiency</span>
                    <span>{getReplyRate()}%</span>
                  </div>
                  <div className="reply-rate-track">
                    <div className="reply-rate-fill" style={{ width: `${getReplyRate()}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Card 2: Catalog Products */}
            <div className="kpi-card glass-card">
              <div className="kpi-icon-row">
                <span className="kpi-icon blue">📦</span>
                {data.inventory.lowStock > 0 ? (
                  <span className="kpi-trend danger" style={{ background: '#fef2f2', color: '#dc2626' }}>
                    {data.inventory.lowStock} Low Stock Alert
                  </span>
                ) : (
                  <span className="kpi-trend success">All stocked</span>
                )}
              </div>
              <div className="kpi-value">{data.overview.products.total}</div>
              <div className="kpi-label">Total Live Products</div>
              <div className="kpi-footer-metric">
                <span className="small-detail-text">
                  <b>{data.overview.products.active}</b> active in catalog | <b>{data.overview.categories.total}</b> categories
                </span>
              </div>
            </div>

            {/* KPI Card 3: Blog Engagement */}
            <div className="kpi-card glass-card">
              <div className="kpi-icon-row">
                <span className="kpi-icon purple">📝</span>
                <span className="kpi-trend success">Views active</span>
              </div>
              <div className="kpi-value">{data.overview.blogs.views.toLocaleString()}</div>
              <div className="kpi-label">Accumulated Blog Views</div>
              <div className="kpi-footer-metric">
                <span className="small-detail-text">
                  Across <b>{data.overview.blogs.total}</b> published posts and news alerts.
                </span>
              </div>
            </div>

            {/* KPI Card 4: Media storage size */}
            <div className="kpi-card glass-card">
              <div className="kpi-icon-row">
                <span className="kpi-icon red">🖼️</span>
                <span className="kpi-trend info">{data.overview.media.total} assets</span>
              </div>
              <div className="kpi-value">{formatBytes(data.overview.media.size)}</div>
              <div className="kpi-label">Media Assets Storage Size</div>
              <div className="kpi-footer-metric">
                <span className="small-detail-text">
                  Uploaded images, catalogues & PDF datasheets.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Trend Graph & Segment Analysis */}
          <div className="analytics-row-double">
            
            {/* Inquiry Trend Custom SVG Area Chart */}
            <div className="analytics-card trend-chart-card">
              <div className="card-header-with-action">
                <div>
                  <h4>Inquiry Volumetric Trends (Last 30 Days)</h4>
                  <p className="card-subtitle-desc">Daily count mapping of customer feedback and business inquiries.</p>
                </div>
              </div>
              
              <div className="chart-wrapper" style={{ position: 'relative', height: `${height}px` }}>
                {points.length > 0 ? (
                  <svg
                    ref={chartSvgRef}
                    className="custom-svg-chart"
                    viewBox={`0 0 ${width} ${height}`}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const y = paddingTop + (i * chartHeight) / 4;
                      const maxVal = Math.max(...data.inquiryTrend.map(t => t.count), 5);
                      const gridVal = Math.round(maxVal - (i * maxVal) / 4);
                      return (
                        <g key={i}>
                          <line
                            x1={paddingLeft}
                            y1={y}
                            x2={width - paddingRight}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                          <text
                            x={paddingLeft - 8}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#64748b"
                          >
                            {gridVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* SVG paths */}
                    <path d={areaPath} fill="url(#areaGrad)" />
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />

                    {/* Interactive Circles & guideline */}
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r={hoverIndex === idx ? 6 : 3}
                        fill={hoverIndex === idx ? '#ff5e14' : '#3B82F6'}
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ transition: 'r 0.1s' }}
                      />
                    ))}

                    {hoverIndex !== null && (
                      <line
                        x1={points[hoverIndex].x}
                        y1={paddingTop}
                        x2={points[hoverIndex].x}
                        y2={paddingTop + chartHeight}
                        stroke="#64748b"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}

                    {/* X axis labels */}
                    {points.map((p, idx) => {
                      // Render every 5th label to avoid overlap
                      if (idx % 5 === 0 || idx === points.length - 1) {
                        return (
                          <text
                            key={idx}
                            x={p.x}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748b"
                          >
                            {p.date}
                          </text>
                        );
                      }
                      return null;
                    })}
                  </svg>
                ) : (
                  <div className="no-chart-data">No inquiry events in the last 30 days.</div>
                )}

                {/* Chart HTML Tooltip on hover */}
                {hoverIndex !== null && points[hoverIndex] && (
                  <div
                    className="chart-tooltip"
                    style={{
                      position: 'absolute',
                      left: `${tooltipPos.x + 10}px`,
                      top: `${tooltipPos.y - 35}px`,
                      transform: 'translate(-50%, -100%)',
                      background: 'rgba(15, 23, 42, 0.95)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{points[hoverIndex].date}</span>
                    <span>Count: <b>{points[hoverIndex].count}</b></span>
                  </div>
                )}
              </div>
            </div>

            {/* Category product distribution */}
            <div className="analytics-card">
              <h4>Category popularities</h4>
              <p className="card-subtitle-desc">Ranking categories by total products count.</p>
              
              <div className="categories-list-bars" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.categoriesDistribution.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No category products mapping.</div>
                ) : (
                  data.categoriesDistribution.map((cat, idx) => {
                    const maxCount = Math.max(...data.categoriesDistribution.map(c => c.count), 1);
                    const pct = Math.round((cat.count / maxCount) * 100);
                    return (
                      <div key={idx} className="category-bar-row">
                        <div className="category-bar-label-row">
                          <span className="category-bar-name">{cat.name}</span>
                          <span className="category-bar-count"><b>{cat.count}</b> products</span>
                        </div>
                        <div className="category-bar-track">
                          <div className="category-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Alerts and Lists */}
          <div className="analytics-row-double" style={{ marginTop: '28px' }}>
            
            {/* Out of stock & stock warnings */}
            <div className="analytics-card">
              <div className="card-header-with-badge">
                <h4>Stock replenishments alerts</h4>
                {data.inventory.outOfStock > 0 && (
                  <span className="admin-badge admin-badge-danger">
                    {data.inventory.outOfStock} Out of Stock
                  </span>
                )}
              </div>
              <p className="card-subtitle-desc">Products with low or depleted stock levels needing attention.</p>
              
              <div className="inventory-alerts-table-container" style={{ marginTop: '16px' }}>
                {data.inventory.alerts.length === 0 ? (
                  <div className="stock-all-good-box">
                    <span>✅</span>
                    <p>All stock levels healthy! No products below 10 units.</p>
                  </div>
                ) : (
                  <table className="alerts-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 4px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                        <th style={{ padding: '8px 4px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Stock</th>
                        <th style={{ padding: '8px 4px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.inventory.alerts.map(prod => (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: '10px 4px', fontSize: '13px', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prod.title}
                          </td>
                          <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                            <span className={`admin-badge ${prod.stock === 0 ? 'admin-badge-danger' : 'admin-badge-warning'}`} style={{ minWidth: '40px', justifyContent: 'center' }}>
                              {prod.stock}
                            </span>
                          </td>
                          <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                            <a href={`/admin/products?search=${encodeURIComponent(prod.title)}`} className="admin-btn admin-btn-outline admin-btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>
                              Edit Stock
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Top Articles by Viewcount */}
            <div className="analytics-card">
              <h4>Top reading blog articles</h4>
              <p className="card-subtitle-desc">Highest read blog posts published by editors.</p>
              
              <div className="top-blogs-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {data.topBlogs.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No blog post reads recorded.</div>
                ) : (
                  data.topBlogs.map((blog, index) => {
                    const maxViews = Math.max(...data.topBlogs.map(b => b.views), 1);
                    const viewPct = Math.round((blog.views / maxViews) * 100);
                    return (
                      <div key={blog.id} className="blog-views-row" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#475569', flexShrink: 0, justifyContent: 'center' }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '13px' }}>
                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={blog.title}>
                              {blog.title}
                            </span>
                            <span style={{ fontWeight: 700, color: '#8b5cf6', flexShrink: 0, marginLeft: '6px' }}>{blog.views.toLocaleString()} views</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                              {blog.category}
                            </span>
                            <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                              <div style={{ width: `${viewPct}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Heaviest Storage files alerts */}
          <div className="analytics-card" style={{ marginTop: '28px' }}>
            <h4>Heavy storage assets alert</h4>
            <p className="card-subtitle-desc">The largest files in the media library. Consider reducing their resolution or compressing them to improve site responsiveness.</p>
            
            <div className="heavy-media-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {data.heaviestMedia.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '20px', textAlign: 'center', color: '#64748b' }}>No media assets uploaded.</div>
              ) : (
                data.heaviestMedia.map((m, idx) => (
                  <div key={m.id} className="heavy-media-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="admin-badge admin-badge-danger" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 'bold' }}>
                        Rank #{idx + 1}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#e53e3e' }}>
                        {formatBytes(m.size)}
                      </span>
                    </div>
                    
                    <div style={{ minWidth: 0, marginTop: '4px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, color: '#1e293b' }} title={m.filename}>
                        {m.filename}
                      </p>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        MIME: {m.mimeType}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <a href={m.url} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline admin-btn-sm" style={{ padding: '6px 12px', fontSize: '11px', flex: 1, background: '#fff' }}>
                        🔗 Open File
                      </a>
                      <button 
                        className="admin-btn admin-btn-outline admin-btn-sm" 
                        style={{ padding: '6px 12px', fontSize: '11px', flex: 1, background: '#fff' }}
                        onClick={() => {
                          navigator.clipboard.writeText(m.url);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        📋 Copy URL
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled local CSS parameters specifically for premium look */}
      <style dangerouslySetInnerHTML={{ __html: `
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .analytics-subtitle {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .analytics-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.06);
          background: rgba(255, 255, 255, 0.85);
        }
        .kpi-icon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .kpi-icon {
          font-size: 20px;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-icon.orange { background: #fff8eb; color: #ff8c42; }
        .kpi-icon.blue { background: #ebf5ff; color: #3b82f6; }
        .kpi-icon.purple { background: #faf5ff; color: #8b5cf6; }
        .kpi-icon.red { background: #fff5f5; color: #ef4444; }
        
        .kpi-trend {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .kpi-trend.success { background: #ecfdf5; color: #059669; }
        .kpi-trend.danger { background: #fef2f2; color: #dc2626; }
        .kpi-trend.info { background: #f0f9ff; color: #0369a1; }
        
        .kpi-value {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .kpi-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .kpi-footer-metric {
          margin-top: auto;
          border-top: 1px solid #edf2f7;
          padding-top: 10px;
        }
        .small-detail-text {
          font-size: 11px;
          color: #64748b;
        }
        .reply-rate-bar-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .reply-rate-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
        }
        .reply-rate-track {
          height: 6px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }
        .reply-rate-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff8c42 0%, #ff5e14 100%);
          border-radius: 4px;
          transition: width 0.8s ease;
        }

        .analytics-row-double {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }
        @media (max-width: 991px) {
          .analytics-row-double {
            grid-template-columns: 1fr;
          }
        }
        .analytics-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .analytics-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .card-subtitle-desc {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .custom-svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        
        /* Category bars styling */
        .category-bar-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .category-bar-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
        }
        .category-bar-name {
          font-weight: 600;
          color: #334155;
        }
        .category-bar-count {
          font-size: 11.5px;
          color: #64748b;
        }
        .category-bar-track {
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }
        .category-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }

        /* Stock alerts styling */
        .stock-all-good-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          text-align: center;
          gap: 6px;
        }
        .stock-all-good-box span {
          font-size: 24px;
        }
        .stock-all-good-box p {
          font-size: 12px;
          color: #15803d;
          font-weight: 600;
        }
        .card-header-with-badge,
        .card-header-with-action {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        /* Shimmer skeleton styling */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .skeleton-card {
          background: #e2e8f0;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .header-skeleton {
          height: 130px;
        }
        .skeleton-chart {
          grid-column: 1 / 3;
          height: 280px;
          background: #e2e8f0;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          margin-top: 24px;
        }
        .skeleton-list {
          grid-column: 3 / 5;
          height: 280px;
          background: #e2e8f0;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          margin-top: 24px;
        }
        .skeleton-card::after,
        .skeleton-chart::after,
        .skeleton-list::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmerSweep 1.5s infinite;
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .analytics-error-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: #fff5f5;
          border: 1px dashed #feb2b2;
          border-radius: 16px;
          text-align: center;
          gap: 12px;
          margin-top: 20px;
        }
        .error-icon {
          font-size: 40px;
        }
        .analytics-error-box h4 {
          color: #c53030;
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .analytics-error-box p {
          color: #742a2a;
          font-size: 13px;
          margin-bottom: 12px;
        }
      `}} />
    </AdminShell>
  );
}
