/**
 * Google Analytics API Route — /api/admin/analytics/google
 * =======================================================
 * GET: Fetches real GA4 metrics dynamically using Google Cloud JWT auth when configured,
 *      or returns simulated live-updating dashboard statistics when keys are absent.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Helper to format Google's date string YYYYMMDD to "DD MMM"
function formatGoogleDate(dateStr: string): string {
  if (dateStr.length !== 8) return dateStr;
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Helper to convert duration in seconds to "Xm Ys"
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

// Exchange Service Account credentials for Google OAuth2 Access Token using JWT
async function getGoogleAccessToken(clientEmail: string, privateKeyPem: string) {
  const privateKey = await jose.importPKCS8(privateKeyPem, 'RS256');
  const jwt = await new jose.SignJWT({
    iss: clientEmail,
    sub: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Auth Failed: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Role validation
    const userRole = request.headers.get('x-user-role');
    if (!userRole) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    if (userRole !== 'ADMIN' && userRole !== 'EDITOR') 
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKeyRaw = process.env.GA_PRIVATE_KEY;

    const credentialsConfigured = !!(propertyId && clientEmail && privateKeyRaw);

    if (credentialsConfigured) {
      const privateKeyPem = privateKeyRaw.replace(/\\n/g, '\n');
      const accessToken = await getGoogleAccessToken(clientEmail, privateKeyPem);

      // Execute Google Analytics Data API calls in parallel
      const [realtimeRes, trafficRes, channelsRes, devicesRes, geoRes, pagesRes] = await Promise.all([
        // A. Real-time Active Users
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: [{ name: 'activeUsers' }] }),
        }),
        // B. 30-Day Daily Traffic & Overview
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' },
              { name: 'sessions' }
            ],
            dimensions: [{ name: 'date' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
          }),
        }),
        // C. Traffic Acquisition Channels
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [{ name: 'sessions' }],
            dimensions: [{ name: 'sessionDefaultChannelGroup' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          }),
        }),
        // D. Device Breakdown
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [{ name: 'sessions' }],
            dimensions: [{ name: 'deviceCategory' }],
          }),
        }),
        // E. Geographic Distribution
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [{ name: 'sessions' }],
            dimensions: [{ name: 'city' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 6,
          }),
        }),
        // F. Top Landing Pages
        fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            metrics: [
              { name: 'screenPageViews' },
              { name: 'averageSessionDuration' },
              { name: 'bounceRate' }
            ],
            dimensions: [
              { name: 'pagePath' },
              { name: 'pageTitle' }
            ],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 6,
          }),
        }),
      ]);

      // Check responses sanity
      if (!realtimeRes.ok || !trafficRes.ok || !channelsRes.ok || !devicesRes.ok || !geoRes.ok || !pagesRes.ok) {
        throw new Error('Google Analytics API returned error code inside data endpoints.');
      }

      const [realtime, traffic, channels, devices, geo, pages] = await Promise.all([
        realtimeRes.json(),
        trafficRes.json(),
        channelsRes.json(),
        devicesRes.json(),
        geoRes.json(),
        pagesRes.json(),
      ]);

      // Parse Active Users
      const activeVisitors = parseInt(realtime.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

      // Parse Overview & Daily sessions
      let totalViews = 0;
      let durationSum = 0;
      let bounceSum = 0;
      let rowsCount = 0;

      const gaTrendData = (traffic.rows || []).map((row: any) => {
        const dateRaw = row.dimensionValues?.[0]?.value || '';
        const pageviews = parseInt(row.metricValues?.[0]?.value || '0', 10);
        const avgDur = parseFloat(row.metricValues?.[1]?.value || '0');
        const bounce = parseFloat(row.metricValues?.[2]?.value || '0');
        const sessions = parseInt(row.metricValues?.[3]?.value || '0', 10);

        totalViews += pageviews;
        durationSum += avgDur;
        bounceSum += bounce;
        rowsCount++;

        return {
          date: formatGoogleDate(dateRaw),
          count: sessions,
        };
      });

      const weeklyPageviews = Math.round(totalViews / 4.3) || totalViews; // Estimated weekly from 30 day aggregate
      const avgEngagementTime = formatDuration(rowsCount > 0 ? durationSum / rowsCount : 0);
      const bounceRate = `${((rowsCount > 0 ? bounceSum / rowsCount : 0) * 100).toFixed(1)}%`;

      // Parse channels
      const totalSessionsForChannels = (channels.rows || []).reduce((acc: number, r: any) => acc + parseInt(r.metricValues?.[0]?.value || '0', 10), 0) || 1;
      const parsedChannels = (channels.rows || []).map((r: any) => {
        const name = r.dimensionValues?.[0]?.value || 'Direct';
        const count = parseInt(r.metricValues?.[0]?.value || '0', 10);
        const pct = Math.round((count / totalSessionsForChannels) * 100);
        return { name, count: `${count} visitors`, pct };
      });

      // Parse devices
      const totalSessionsForDevices = (devices.rows || []).reduce((acc: number, r: any) => acc + parseInt(r.metricValues?.[0]?.value || '0', 10), 0) || 1;
      const parsedDevices = (devices.rows || []).map((r: any) => {
        const name = r.dimensionValues?.[0]?.value || 'desktop';
        const count = parseInt(r.metricValues?.[0]?.value || '0', 10);
        const pct = Math.round((count / totalSessionsForDevices) * 100);
        const icon = name.toLowerCase() === 'mobile' ? '📱' : name.toLowerCase() === 'tablet' ? '📟' : '💻';
        return { name: name.charAt(0).toUpperCase() + name.slice(1) + ' Devices', pct, icon };
      });

      // Parse cities
      const totalSessionsForGeo = (geo.rows || []).reduce((acc: number, r: any) => acc + parseInt(r.metricValues?.[0]?.value || '0', 10), 0) || 1;
      const parsedGeo = (geo.rows || []).map((r: any) => {
        const city = r.dimensionValues?.[0]?.value || 'Others';
        const count = parseInt(r.metricValues?.[0]?.value || '0', 10);
        const pct = Math.round((count / totalSessionsForGeo) * 100);
        return { city: city === '(not set)' ? 'Others' : city, sessions: count, pct };
      });

      // Parse top pages
      const parsedPages = (pages.rows || []).map((r: any) => {
        const path = r.dimensionValues?.[0]?.value || '/';
        const title = r.dimensionValues?.[1]?.value || 'Page';
        const views = parseInt(r.metricValues?.[0]?.value || '0', 10);
        const avgTime = formatDuration(parseFloat(r.metricValues?.[1]?.value || '0'));
        const bounce = `${(parseFloat(r.metricValues?.[2]?.value || '0') * 100).toFixed(0)}%`;
        return { page: path, title, views, avgTime, bounceRate: bounce };
      });

      return NextResponse.json({
        success: true,
        isDemo: false,
        data: {
          activeVisitors,
          weeklyPageviews,
          avgEngagementTime,
          bounceRate,
          gaTrendData,
          channels: parsedChannels.length ? parsedChannels : null,
          devices: parsedDevices.length ? parsedDevices : null,
          geoData: parsedGeo.length ? parsedGeo : null,
          topPages: parsedPages.length ? parsedPages : null,
        }
      });
    }

    // ─── Demo / Fallback Mode with simulated dynamic values ───
    const currentHour = new Date().getHours();

    // Fluctuating real-time active users (higher during business hours 9-18)
    const baseActive = (currentHour >= 9 && currentHour <= 18) ? 5 : 2;
    const activeVisitors = baseActive + Math.floor(Math.sin(Date.now() / 60000) * 2) + Math.floor(Math.random() * 2);

    // Pageviews and core metrics
    const weeklyPageviews = 1482;
    const avgEngagementTime = "2m 45s";
    const bounceRate = `${(31.2 + Math.sin(Date.now() / 50000) * 1.5).toFixed(1)}%`;

    // Dynamic 30 days sessions trend curve
    const gaTrendData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      
      // Weekly trend shape: lower on weekends (Saturday=6, Sunday=0)
      const dayFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;
      
      // Dynamic baseline count that slowly grows over time
      const dateKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const baseline = 60 + (30 - i) * 1.5;
      const randomNoise = Math.floor(Math.sin(d.getTime()) * 12) + Math.floor(Math.cos(d.getTime() / 2) * 6);
      
      gaTrendData.push({
        date: dateKey,
        count: Math.round((baseline + randomNoise) * dayFactor),
      });
    }

    return NextResponse.json({
      success: true,
      isDemo: true,
      data: {
        activeVisitors: Math.max(activeVisitors, 1),
        weeklyPageviews,
        avgEngagementTime,
        bounceRate,
        gaTrendData,
        channels: [
          { name: 'Direct Traffic', count: '667 visitors', pct: 45 },
          { name: 'Organic Search (Google)', count: '519 visitors', pct: 35 },
          { name: 'Social Media', count: '178 visitors', pct: 12 },
          { name: 'Referral & Other', count: '118 visitors', pct: 8 }
        ],
        devices: [
          { name: 'Mobile Devices', pct: 65, icon: '📱' },
          { name: 'Desktop Computers', pct: 30, icon: '💻' },
          { name: 'Tablets', pct: 5, icon: '📟' }
        ],
        geoData: [
          { city: 'Indore', sessions: 312, pct: 38 },
          { city: 'Mumbai', sessions: 198, pct: 24 },
          { city: 'Delhi', sessions: 142, pct: 17 },
          { city: 'Pune', sessions: 89, pct: 11 },
          { city: 'Ahmedabad', sessions: 67, pct: 8 },
          { city: 'Others', sessions: 16, pct: 2 },
        ],
        topPages: [
          { page: '/', title: 'Homepage', views: 482, avgTime: '3m 12s', bounceRate: '24%' },
          { page: '/polycab', title: 'Polycab Products', views: 267, avgTime: '2m 45s', bounceRate: '28%' },
          { page: '/dowells', title: 'Dowells Products', views: 189, avgTime: '2m 20s', bounceRate: '31%' },
          { page: '/contact-us', title: 'Contact Us', views: 156, avgTime: '4m 05s', bounceRate: '15%' },
          { page: '/pricelist', title: 'Price List', views: 134, avgTime: '1m 50s', bounceRate: '35%' },
          { page: '/cable-terminal', title: 'Cable Terminal', views: 98, avgTime: '2m 10s', bounceRate: '29%' },
        ]
      }
    });

  } catch (error: any) {
    console.error('[Google Analytics API GET]', error);
    return NextResponse.json({ success: false, message: 'Google Analytics query failed' }, { status: 500 });
  }
}
