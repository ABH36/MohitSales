'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminShell from '../components/AdminShell';

interface AnalyticsData {
  overview: {
    products: { total: number; active: number };
    categories: { total: number };
    blogs: { total: number; views: number };
    inquiries: { total: number; status: { new: number; read: number; replied: number; closed: number } };
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

  // The two analytics views are driven by the sidebar sub-nav (?tab=google).
  const searchParams = useSearchParams();
  const tabParam: 'database' | 'google' = searchParams.get('tab') === 'google' ? 'google' : 'database';
  const [activeTab, setActiveTab] = useState<'database' | 'google'>(tabParam);
  useEffect(() => { setActiveTab(tabParam); }, [tabParam]);

  // Google Analytics API states
  const [gaData, setGaData] = useState<any>(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState<string | null>(null);

  const fetchGoogleAnalytics = async () => {
    setGaLoading(true);
    setGaError(null);
    try {
      const res = await fetch('/api/admin/analytics/google');
      const json = await res.json();
      if (json.success) {
        setGaData(json.data);
      } else {
        setGaError(json.message || 'Failed to fetch GA data.');
      }
    } catch (err) {
      console.error(err);
      setGaError('Failed to connect to Google Analytics API.');
    } finally {
      setGaLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'google') {
      fetchGoogleAnalytics();
    }
  }, [activeTab]);

  // Line Chart state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  // Google Analytics Trend Chart state
  const [gaHoverIndex, setGaHoverIndex] = useState<number | null>(null);
  const [gaTooltipPos, setGaTooltipPos] = useState({ x: 0, y: 0 });
  const gaChartSvgRef = useRef<SVGSVGElement | null>(null);

  const defaultGaTrendData = [
    { date: '19 May', count: 42 },
    { date: '20 May', count: 50 },
    { date: '21 May', count: 48 },
    { date: '22 May', count: 55 },
    { date: '23 May', count: 60 },
    { date: '24 May', count: 35 },
    { date: '25 May', count: 40 },
    { date: '26 May', count: 58 },
    { date: '27 May', count: 62 },
    { date: '28 May', count: 70 },
    { date: '29 May', count: 65 },
    { date: '30 May', count: 42 },
    { date: '31 May', count: 38 },
    { date: '01 Jun', count: 55 },
    { date: '02 Jun', count: 72 },
    { date: '03 Jun', count: 80 },
    { date: '04 Jun', count: 75 },
    { date: '05 Jun', count: 90 },
    { date: '06 Jun', count: 45 },
    { date: '07 Jun', count: 40 },
    { date: '08 Jun', count: 85 },
    { date: '09 Jun', count: 95 },
    { date: '10 Jun', count: 110 },
    { date: '11 Jun', count: 105 },
    { date: '12 Jun', count: 120 },
    { date: '13 Jun', count: 65 },
    { date: '14 Jun', count: 58 },
    { date: '15 Jun', count: 130 },
    { date: '16 Jun', count: 142 },
    { date: '17 Jun', count: 138 }
  ];

  const gaTrendData = gaData?.gaTrendData || defaultGaTrendData;

  // Dynamic variables resolved from gaData API
  const activeVisitors = gaData?.activeVisitors ?? 4;
  const weeklyPageviews = gaData?.weeklyPageviews ?? 1482;
  const avgEngagementTime = gaData?.avgEngagementTime ?? "2m 45s";
  const bounceRate = gaData?.bounceRate ?? "31.2%";

  const defaultChannels = [
    { name: 'Direct Traffic', count: '667 visitors', pct: 45, color: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' },
    { name: 'Organic Search (Google)', count: '519 visitors', pct: 35, color: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
    { name: 'Social Media', count: '178 visitors', pct: 12, color: 'linear-gradient(90deg, #8b5cf6 0%, #7d3aed 100%)' },
    { name: 'Referral & Other', count: '118 visitors', pct: 8, color: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' }
  ];
  const gaChannels = gaData?.channels?.map((c: any, idx: number) => ({
    ...c,
    color: idx === 0 ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' :
      idx === 1 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' :
        idx === 2 ? 'linear-gradient(90deg, #8b5cf6 0%, #7d3aed 100%)' :
          'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
  })) || defaultChannels;

  const defaultDevices = [
    { name: 'Mobile Devices', pct: 65, icon: '📱', color: '#10b981' },
    { name: 'Desktop Computers', pct: 30, icon: '💻', color: '#3b82f6' },
    { name: 'Tablets', pct: 5, icon: '📟', color: '#f59e0b' }
  ];
  const gaDevices = gaData?.devices?.map((d: any, idx: number) => ({
    ...d,
    color: d.name.toLowerCase().includes('mobile') ? '#10b981' : d.name.toLowerCase().includes('tablet') ? '#f59e0b' : '#3b82f6'
  })) || defaultDevices;

  // GA4 measurement id (env-driven, inlined at build; falls back to prod id)
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-FZF80T7820';

  // Top Cities + Top Pages come from the GA API (real when configured, demo
  // otherwise). These fall back to sensible defaults before the first fetch.
  const defaultGeo = [
    { city: 'Indore', sessions: 312, pct: 38 },
    { city: 'Mumbai', sessions: 198, pct: 24 },
    { city: 'Delhi', sessions: 142, pct: 17 },
    { city: 'Pune', sessions: 89, pct: 11 },
    { city: 'Ahmedabad', sessions: 67, pct: 8 },
    { city: 'Others', sessions: 16, pct: 2 },
  ];
  const gaGeo = gaData?.geoData || defaultGeo;

  const defaultTopPages = [
    { page: '/', title: 'Homepage', views: 482, avgTime: '3m 12s', bounceRate: '24%' },
    { page: '/polycab', title: 'Polycab Products', views: 267, avgTime: '2m 45s', bounceRate: '28%' },
    { page: '/dowells', title: 'Dowells Products', views: 189, avgTime: '2m 20s', bounceRate: '31%' },
    { page: '/contact-us', title: 'Contact Us', views: 156, avgTime: '4m 05s', bounceRate: '15%' },
    { page: '/pricelist', title: 'Price List', views: 134, avgTime: '1m 50s', bounceRate: '35%' },
    { page: '/cable-terminal', title: 'Cable Terminal', views: 98, avgTime: '2m 10s', bounceRate: '29%' },
  ];
  const gaTopPages = gaData?.topPages || defaultTopPages;


  // Google Analytics Trend Chart calculations
  const gaWidth = 640;
  const gaHeight = 240;
  const gaPaddingLeft = 40;
  const gaPaddingRight = 20;
  const gaPaddingTop = 20;
  const gaPaddingBottom = 30;
  const gaChartWidth = gaWidth - gaPaddingLeft - gaPaddingRight;
  const gaChartHeight = gaHeight - gaPaddingTop - gaPaddingBottom;

  let gaPoints: Array<{ x: number; y: number; count: number; date: string }> = [];
  let gaLinePath = '';
  let gaAreaPath = '';

  if (gaTrendData.length > 0) {
    const maxVal = Math.max(...gaTrendData.map((t: any) => t.count), 5);
    const gaDivisor = gaTrendData.length - 1;
    gaPoints = gaTrendData.map((val: any, idx: number) => {
      const x = gaDivisor <= 0
        ? gaPaddingLeft + gaChartWidth / 2
        : gaPaddingLeft + (idx * gaChartWidth) / gaDivisor;
      const y = gaPaddingTop + gaChartHeight - (val.count * gaChartHeight) / maxVal;
      return { x, y, count: val.count, date: val.date };
    });

    gaLinePath = gaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    gaAreaPath = `${gaLinePath} L ${gaPoints[gaPoints.length - 1].x} ${gaPaddingTop + gaChartHeight} L ${gaPoints[0].x} ${gaPaddingTop + gaChartHeight} Z`;
  }

  const handleGaMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!gaChartSvgRef.current || gaPoints.length === 0) return;
    const rect = gaChartSvgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find the closest point index
    let closestIdx = 0;
    let minDiff = Infinity;
    gaPoints.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setGaHoverIndex(closestIdx);
    setGaTooltipPos({ x: gaPoints[closestIdx].x, y: gaPoints[closestIdx].y - 10 });
  };

  const handleGaMouseLeave = () => {
    setGaHoverIndex(null);
  };

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
    return Math.round(((status.replied + status.closed) / total) * 100);
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
    const divisor = trend.length - 1;
    points = trend.map((val, idx) => {
      const x = divisor <= 0
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (idx * chartWidth) / divisor;
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
    <AdminShell pageTitle="Analytics Dashboard">
      {activeTab === 'database' && (
        <>
          <div className="analytics-header">
            <p className="analytics-subtitle">Real-time System Analysis | 100% accurate metrics aggregated from live database tables.</p>
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

                  <div className="chart-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: `${width} / ${height}` }}>
                    {points.length > 0 ? (
                      <svg
                        ref={chartSvgRef}
                        className="custom-svg-chart"
                        style={{ width: '100%', height: '100%' }}
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
                          fontSize: 'calc(var(--admin-fs) - 4px)',
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
                            <th style={{ padding: '8px 4px', fontSize: 'calc(var(--admin-fs) - 4px)', color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '8px 4px', fontSize: 'calc(var(--admin-fs) - 4px)', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '8px 4px', fontSize: 'calc(var(--admin-fs) - 4px)', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.inventory.alerts.map(prod => (
                            <tr key={prod.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                              <td style={{ padding: '10px 4px', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {prod.title}
                              </td>
                              <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                                <span className={`admin-badge ${prod.stock === 0 ? 'admin-badge-danger' : 'admin-badge-warning'}`} style={{ minWidth: '40px', justifyContent: 'center' }}>
                                  {prod.stock}
                                </span>
                              </td>
                              <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                                <a href={`/admin/products?search=${encodeURIComponent(prod.title)}`} className="admin-btn admin-btn-outline admin-btn-sm" style={{ padding: '4px 8px', fontSize: 'calc(var(--admin-fs) - 4px)' }}>
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
                            <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', fontSize: 'calc(var(--admin-fs) - 4px)', fontWeight: 'bold', color: '#475569', flexShrink: 0, justifyContent: 'center' }}>
                              {index + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: 'calc(var(--admin-fs) - 2px)' }}>
                                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={blog.title}>
                                  {blog.title}
                                </span>
                                <span style={{ fontWeight: 700, color: '#8b5cf6', flexShrink: 0, marginLeft: '6px' }}>{blog.views.toLocaleString()} views</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: 'calc(var(--admin-fs) - 5px)', color: '#64748b', background: '#f8fafc', padding: '1px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
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
                          <span className="admin-badge admin-badge-danger" style={{ fontSize: 'calc(var(--admin-fs) - 5px)', padding: '2px 8px', fontWeight: 'bold' }}>
                            Rank #{idx + 1}
                          </span>
                          <span style={{ fontSize: 'calc(var(--admin-fs) - 3px)', fontWeight: 'bold', color: '#e53e3e' }}>
                            {formatBytes(m.size)}
                          </span>
                        </div>

                        <div style={{ minWidth: 0, marginTop: '4px' }}>
                          <p style={{ fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0, color: '#1e293b' }} title={m.filename}>
                            {m.filename}
                          </p>
                          <span style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#64748b' }}>
                            MIME: {m.mimeType}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <a href={m.url} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline admin-btn-sm" style={{ padding: '6px 12px', fontSize: 'calc(var(--admin-fs) - 4px)', flex: 1, background: '#fff' }}>
                            🔗 Open File
                          </a>
                          <button
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            style={{ padding: '6px 12px', fontSize: 'calc(var(--admin-fs) - 4px)', flex: 1, background: '#fff' }}
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

              {/* Inquiry channels + Media breakdown (previously computed, now shown) */}
              <div className="analytics-row-double" style={{ marginTop: '28px' }}>
                {/* Inquiry Channels & Languages */}
                <div className="analytics-card">
                  <h4>Inquiry Channels &amp; Languages</h4>
                  <p className="card-subtitle-desc">Where inquiries originate, plus visitor language split.</p>
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {data.inquirySources.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No inquiries recorded yet.</div>
                    ) : (
                      data.inquirySources.map((s, idx) => {
                        const total = data.inquirySources.reduce((a: number, b) => a + b.count, 0) || 1;
                        const pct = Math.round((s.count / total) * 100);
                        const label = s.source === 'website' ? 'Contact Form (Website)'
                          : s.source === 'feedback' ? 'Feedback Form'
                          : s.source.charAt(0).toUpperCase() + s.source.slice(1);
                        return (
                          <div key={idx} className="category-bar-row">
                            <div className="category-bar-label-row">
                              <span className="category-bar-name">{label}</span>
                              <span className="category-bar-count"><b>{s.count}</b> ({pct}%)</span>
                            </div>
                            <div className="category-bar-track">
                              <div className="category-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' }}></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {data.inquiryLocales.length > 0 && (
                    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #edf2f7', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.inquiryLocales.map((l, idx) => (
                        <span key={idx} style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3px 10px' }}>
                          🌐 {l.locale.toUpperCase()}: <b>{l.count}</b>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media Library Breakdown */}
                <div className="analytics-card">
                  <h4>Media Library Breakdown</h4>
                  <p className="card-subtitle-desc">Uploaded assets grouped by file type.</p>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                    {data.mediaTypes.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No media uploaded.</div>
                    ) : (
                      data.mediaTypes.map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < data.mediaTypes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <span style={{ fontSize: 'calc(var(--admin-fs) + 1px)' }}>{m.type.startsWith('image') ? '🖼️' : m.type.includes('pdf') ? '📄' : '📁'}</span>
                            <span style={{ fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.type}>{m.type}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#64748b' }}><b>{m.count}</b> files</span>
                            <span style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#e53e3e', fontWeight: 600 }}>{formatBytes(m.size)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'google' && (
        <div className="google-analytics-container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header Stream Info Bar */}
          <div className="ga-stream-info-card glass-card" style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'calc(var(--admin-fs) + 11px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 'calc(var(--admin-fs) + 3px)', fontWeight: 800, color: '#0f172a' }}>Google Analytics (GA4) Stream</h3>
                  <p style={{ margin: 0, fontSize: 'calc(var(--admin-fs) - 2px)', color: '#64748b' }}>Connected Property: <b>Mohit Sales Corporation Web</b></p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 2px)' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>Stream ID:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>15108794799</span>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 2px)' }}>
                  <span style={{ color: '#64748b', marginRight: '6px' }}>Measurement ID:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{GA_MEASUREMENT_ID}</span>
                </div>
                {gaData && !gaData.isDemo ? (
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(16, 185, 129, 0.08)', color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    padding: '10px 16px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600
                  }}>
                    <span className="live-dot" style={{ marginRight: '8px' }}></span>
                    Live &amp; Connected
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                    padding: '10px 16px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600
                  }}>
                    <span style={{ marginRight: '8px' }}>ℹ️</span>
                    Demo Mode — add GA API keys
                  </div>
                )}
                <button
                  onClick={fetchGoogleAnalytics}
                  disabled={gaLoading}
                  title="Refresh Google Analytics data"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #dbeafe', color: '#2563eb', padding: '10px 16px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, cursor: gaLoading ? 'default' : 'pointer', opacity: gaLoading ? 0.6 : 1 }}
                >
                  <span style={{ display: 'inline-block', animation: gaLoading ? 'adminSpinner 0.8s linear infinite' : 'none' }}>🔄</span> {gaLoading ? 'Refreshing…' : 'Refresh'}
                </button>
                {gaError && (
                  <span title={gaError} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: 'calc(var(--admin-fs) - 3px)', fontWeight: 600 }}>
                    ⚠️ API error — showing demo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="analytics-kpi-grid">
            {/* Live Active Users Widget */}
            <div className="kpi-card glass-card" style={{ background: '#fff' }}>
              <div className="kpi-icon-row">
                <span className="kpi-icon blue" style={{ background: '#e0f2fe', color: '#0284c7' }}>⚡</span>
                <span className="kpi-trend success" style={{
                  background: gaData && !gaData.isDemo ? '#ecfdf5' : '#eff6ff',
                  color: gaData && !gaData.isDemo ? '#059669' : '#2563eb'
                }}>
                  {gaData && !gaData.isDemo ? 'Real-time' : 'Demo Mode'}
                </span>
              </div>
              <div className="kpi-value" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: 'calc(var(--admin-fs) + 17px)', fontWeight: 800 }}>
                {activeVisitors} <span style={{ fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Visitors</span>
              </div>
              <div className="kpi-label" style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#64748b', fontWeight: 600 }}>Users in last 30 minutes</div>

              {/* Animated Live Bars */}
              <div className="kpi-footer-metric" style={{ marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '24px' }}>
                  {[12, 16, 8, 22, 14, 28, 20, 10, 16, 24, 18, 32, 22, 14, 20].map((h, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: `${h}%`,
                      background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                      borderRadius: '2px',
                      opacity: i === 14 ? 1 : 0.6,
                      animation: i === 14 ? 'liveBarGrow 1.5s infinite alternate' : 'none'
                    }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Pageviews */}
            <div className="kpi-card glass-card" style={{ background: '#fff' }}>
              <div className="kpi-icon-row">
                <span className="kpi-icon orange" style={{ background: '#ffedd5', color: '#ea580c' }}>📈</span>
                <span className="kpi-trend success" style={{ background: '#ecfdf5', color: '#059669' }}>
                  {gaData && !gaData.isDemo ? 'GA4 Active' : 'Fallback Demo'}
                </span>
              </div>
              <div className="kpi-value" style={{ fontSize: 'calc(var(--admin-fs) + 17px)', fontWeight: 800 }}>{weeklyPageviews.toLocaleString()}</div>
              <div className="kpi-label" style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#64748b', fontWeight: 600 }}>Weekly Pageviews</div>
              <div className="kpi-footer-metric" style={{ marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                <span className="small-detail-text">
                  Aggregated pageviews across all products.
                </span>
              </div>
            </div>

            {/* Average Session Duration */}
            <div className="kpi-card glass-card" style={{ background: '#fff' }}>
              <div className="kpi-icon-row">
                <span className="kpi-icon purple" style={{ background: '#f3e8ff', color: '#7c3aed' }}>⏱️</span>
                <span className="kpi-trend success" style={{ background: '#ecfdf5', color: '#059669' }}>Good engagement</span>
              </div>
              <div className="kpi-value" style={{ fontSize: 'calc(var(--admin-fs) + 17px)', fontWeight: 800 }}>{avgEngagementTime}</div>
              <div className="kpi-label" style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#64748b', fontWeight: 600 }}>Avg. Engagement Time</div>
              <div className="kpi-footer-metric" style={{ marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                <span className="small-detail-text">
                  Average time a visitor spends on the site.
                </span>
              </div>
            </div>

            {/* Bounce Rate */}
            <div className="kpi-card glass-card" style={{ background: '#fff' }}>
              <div className="kpi-icon-row">
                <span className="kpi-icon red" style={{ background: '#fee2e2', color: '#dc2626' }}>📉</span>
                <span className="kpi-trend success" style={{ background: '#ecfdf5', color: '#059669' }}>Bounce tracked</span>
              </div>
              <div className="kpi-value" style={{ fontSize: 'calc(var(--admin-fs) + 17px)', fontWeight: 800 }}>{bounceRate}</div>
              <div className="kpi-label" style={{ fontSize: 'calc(var(--admin-fs) - 2px)', color: '#64748b', fontWeight: 600 }}>Bounce Rate</div>
              <div className="kpi-footer-metric" style={{ marginTop: '16px', borderTop: '1px solid #edf2f7', paddingTop: '12px' }}>
                <span className="small-detail-text">
                  Percentage of single-page visits.
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Trend Chart */}
          <div className="analytics-card trend-chart-card" style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)' }}>
            <div className="card-header-with-action">
              <div>
                <h4>Google Analytics Traffic Trends (Last 30 Days)</h4>
                <p className="card-subtitle-desc">Daily visitor sessions count mapping for Mohit Sales Corporation.</p>
              </div>
            </div>

            <div className="chart-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: `${gaWidth} / ${gaHeight}` }}>
              {gaPoints.length > 0 ? (
                <svg
                  ref={gaChartSvgRef}
                  className="custom-svg-chart"
                  style={{ width: '100%', height: '100%' }}
                  viewBox={`0 0 ${gaWidth} ${gaHeight}`}
                  onMouseMove={handleGaMouseMove}
                  onMouseLeave={handleGaMouseLeave}
                >
                  <defs>
                    <linearGradient id="gaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="gaLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = gaPaddingTop + (i * gaChartHeight) / 4;
                    const maxVal = Math.max(...gaTrendData.map((t: any) => t.count), 5);
                    const gridVal = Math.round(maxVal - (i * maxVal) / 4);
                    return (
                      <g key={i}>
                        <line
                          x1={gaPaddingLeft}
                          y1={y}
                          x2={gaWidth - gaPaddingRight}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          strokeDasharray="4,4"
                        />
                        <text
                          x={gaPaddingLeft - 8}
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
                  <path d={gaAreaPath} fill="url(#gaAreaGrad)" />
                  <path d={gaLinePath} fill="none" stroke="url(#gaLineGrad)" strokeWidth="3" strokeLinecap="round" />

                  {/* Interactive Circles & guideline */}
                  {gaPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={gaHoverIndex === idx ? 6 : 3}
                      fill={gaHoverIndex === idx ? '#3b82f6' : '#10b981'}
                      stroke="#fff"
                      strokeWidth="2"
                      style={{ transition: 'r 0.1s' }}
                    />
                  ))}

                  {gaHoverIndex !== null && (
                    <line
                      x1={gaPoints[gaHoverIndex].x}
                      y1={gaPaddingTop}
                      x2={gaPoints[gaHoverIndex].x}
                      y2={gaPaddingTop + gaChartHeight}
                      stroke="#64748b"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* X axis labels */}
                  {gaPoints.map((p, idx) => {
                    // Render every 5th label to avoid overlap
                    if (idx % 5 === 0 || idx === gaPoints.length - 1) {
                      return (
                        <text
                          key={idx}
                          x={p.x}
                          y={gaHeight - 10}
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
                <div className="no-chart-data">No traffic data recorded in the last 30 days.</div>
              )}

              {/* Chart HTML Tooltip on hover */}
              {gaHoverIndex !== null && gaPoints[gaHoverIndex] && (
                <div
                  className="chart-tooltip"
                  style={{
                    position: 'absolute',
                    left: `${gaTooltipPos.x + 10}px`,
                    top: `${gaTooltipPos.y - 35}px`,
                    transform: 'translate(-50%, -100%)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: 'calc(var(--admin-fs) - 4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{gaPoints[gaHoverIndex].date}</span>
                  <span>Sessions: <b>{gaPoints[gaHoverIndex].count}</b></span>
                </div>
              )}
            </div>
          </div>

          {/* Graphs / Acquisition Section */}
          <div className="analytics-row-double">
            {/* Left Side: Traffic Sources */}
            <div className="analytics-card" style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)' }}>
              <h4>Traffic Acquisition Channels</h4>
              <p className="card-subtitle-desc">Where your website visitors are coming from.</p>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {gaChannels.map((channel: any, idx: number) => (
                  <div key={idx} className="category-bar-row">
                    <div className="category-bar-label-row">
                      <span className="category-bar-name" style={{ fontWeight: 600, color: '#334155', fontSize: 'calc(var(--admin-fs) - 2px)' }}>{channel.name}</span>
                      <span className="category-bar-count" style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#64748b' }}><b>{channel.count}</b> ({channel.pct}%)</span>
                    </div>
                    <div className="category-bar-track" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="category-bar-fill" style={{ height: '100%', borderRadius: '4px', width: `${channel.pct}%`, background: channel.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Devices breakdown */}
            <div className="analytics-card" style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)' }}>
              <h4>Device Breakdown</h4>
              <p className="card-subtitle-desc">Devices used by your customers to access Mohit Sales Corporation.</p>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {gaDevices.map((device: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'calc(var(--admin-fs) + 3px)'
                    }}>
                      {device.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        <span>{device.name}</span>
                        <span style={{ color: '#0f172a' }}>{device.pct}%</span>
                      </div>
                      <div className="category-bar-track" style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div className="category-bar-fill" style={{ height: '100%', borderRadius: '4px', width: `${device.pct}%`, backgroundColor: device.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Cities + Top Pages (previously fetched from GA but never shown) */}
          <div className="analytics-row-double">
            {/* Top Cities */}
            <div className="analytics-card" style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)' }}>
              <h4>Top Cities</h4>
              <p className="card-subtitle-desc">Where your visitors are located (by sessions).</p>
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {gaGeo.map((c: any, idx: number) => (
                  <div key={idx} className="category-bar-row">
                    <div className="category-bar-label-row">
                      <span className="category-bar-name" style={{ fontWeight: 600, color: '#334155', fontSize: 'calc(var(--admin-fs) - 2px)' }}>📍 {c.city}</span>
                      <span className="category-bar-count" style={{ fontSize: 'calc(var(--admin-fs) - 3px)', color: '#64748b' }}><b>{c.sessions}</b> sessions ({c.pct}%)</span>
                    </div>
                    <div className="category-bar-track" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="category-bar-fill" style={{ height: '100%', borderRadius: '4px', width: `${c.pct}%`, background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="analytics-card" style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)' }}>
              <h4>Top Pages</h4>
              <p className="card-subtitle-desc">Most-viewed pages in the last 30 days.</p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                {gaTopPages.map((pg: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: idx < gaTopPages.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: '22px', height: '22px', background: '#eef2ff', color: '#4f46e5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'calc(var(--admin-fs) - 4px)', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pg.title}>{pg.title}</div>
                      <div style={{ fontSize: 'calc(var(--admin-fs) - 4px)', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pg.page}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 'calc(var(--admin-fs) - 2px)', fontWeight: 700, color: '#0f172a' }}>{pg.views.toLocaleString()}</div>
                      <div style={{ fontSize: 'calc(var(--admin-fs) - 5px)', color: '#64748b' }}>views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

                  </div>
      )}

      {/* Styled local CSS parameters specifically for premium look */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .analytics-subtitle {
          font-size: calc(var(--admin-fs) - 1px);
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
          background: #ffffff;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #e2e8f0;
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
          background: #ffffff;
        }
        .kpi-icon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .kpi-icon {
          font-size: calc(var(--admin-fs) + 5px);
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
          font-size: calc(var(--admin-fs) - 4.5px);
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          text-transform: uppercase;
        }
        .kpi-trend.success { background: #ecfdf5; color: #059669; }
        .kpi-trend.danger { background: #fef2f2; color: #dc2626; }
        .kpi-trend.info { background: #f0f9ff; color: #0369a1; }
        
        .kpi-value {
          font-size: calc(var(--admin-fs) + 13px);
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .kpi-label {
          font-size: calc(var(--admin-fs) - 2px);
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
          font-size: calc(var(--admin-fs) - 4px);
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
          font-size: calc(var(--admin-fs) - 4px);
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
          font-size: calc(var(--admin-fs) + 1px);
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .card-subtitle-desc {
          font-size: calc(var(--admin-fs) - 3px);
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
          font-size: calc(var(--admin-fs) - 2.5px);
        }
        .category-bar-name {
          font-weight: 600;
          color: #334155;
        }
        .category-bar-count {
          font-size: calc(var(--admin-fs) - 3.5px);
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
          font-size: calc(var(--admin-fs) + 9px);
        }
        .stock-all-good-box p {
          font-size: calc(var(--admin-fs) - 3px);
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
          font-size: calc(var(--admin-fs) + 25px);
        }
        .analytics-error-box h4 {
          color: #c53030;
          margin: 0;
          font-size: calc(var(--admin-fs) + 3px);
          font-weight: 700;
        }
        .analytics-error-box p {
          color: #742a2a;
          font-size: calc(var(--admin-fs) - 2px);
          margin-bottom: 12px;
        }

        /* Light container layout for GA + Database tabs (matches admin light theme) */
        .google-analytics-container,
        .analytics-dashboard-container {
          background: transparent;
          margin: -24px;
          padding: 28px;
        }

        /* Tab bar */
        .analytics-tabs-bar {
          border-bottom-color: #e2e8f0 !important;
        }
        .analytics-header { margin-bottom: 24px !important; }
        .analytics-subtitle { color: #64748b !important; }

        .analytics-error-box {
          background: rgba(239,68,68,0.08) !important;
          border-color: rgba(239,68,68,0.2) !important;
        }

        /* Google Analytics dashboard custom styles */
        .google-analytics-container {
          animation: gaFadeIn 0.4s ease-out;
        }
        @keyframes gaFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: livePulse 1.5s infinite;
        }
        @keyframes livePulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        .analytics-tab-btn:hover {
          color: #3b82f6 !important;
        }
        @keyframes liveBarGrow {
          from {
            height: 15%;
          }
          to {
            height: 90%;
          }
        }
        @keyframes adminSpinner {
          to { transform: rotate(360deg); }
        }
      `}} />
    </AdminShell>
  );
}
