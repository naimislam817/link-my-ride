import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import './AdminDashboard.css';

/* ── SVG Bar Chart ─────────────────────────────────────────────── */
const BarChart = ({ data, label, color = 'var(--admin-accent)' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 480, H = 110, PAD = 32, GAP = 6;
  const barW = (W - PAD * 2 - GAP * (data.length - 1)) / Math.max(data.length, 1);
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.5, 1].map((f, i) => (
          <line key={i} x1={PAD} y1={PAD + (1 - f) * (H - PAD)} x2={W - PAD} y2={PAD + (1 - f) * (H - PAD)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const bH = max > 0 ? (d.value / max) * (H - PAD) : 0;
          const x = PAD + i * (barW + GAP);
          const y = PAD + (H - PAD) - bH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH} rx="4" fill={color} opacity="0.85" />
              {d.value > 0 && <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)">{d.value}</text>}
              <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── SVG Line Chart ────────────────────────────────────────────── */
const LineChart = ({ data, label, color = '#10b981', unit = '' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 480, H = 110, PAD = 32;
  const stepX = (W - PAD * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({ x: PAD + i * stepX, y: PAD + (1 - d.value / max) * (H - PAD) }));
  const poly = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = pts.length > 1
    ? `M${pts[0].x},${H} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${H} Z`
    : '';
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>{label}</div>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#lg-${color.replace('#','')})`} />}
        {pts.length > 1 && <polyline points={poly} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={color} />
            {data[i].value > 0 && <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.55)">{unit}{data[i].value}</text>}
            <text x={p.x} y={H + 16} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.3)">{data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/* ── Data helpers ──────────────────────────────────────────────── */
const getLast7Days = (orders) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    return { label, value: orders.filter(o => o.created_at?.startsWith(dateStr)).length };
  });
};

const getLast7Revenue = (orders) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    const value = orders.filter(o => o.created_at?.startsWith(dateStr)).reduce((s, o) => s + (o.total_amount || 0), 0);
    return { label, value: Math.round(value / 100) };
  });
};

const getLast6Months = (orders) => {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const y = d.getFullYear(), m = d.getMonth();
    return { label, value: orders.filter(o => { const od = new Date(o.created_at); return od.getFullYear() === y && od.getMonth() === m; }).length };
  });
};

/* ── Main Component ────────────────────────────────────────────── */
const AdminOverview = () => {
  const { getAnalytics, loading } = useShop();
  const { totalRevenue, totalOrders, popularProducts, orders } = getAnalytics();
  const [chartTab, setChartTab] = useState('daily');

  const chartData = useMemo(() => ({
    daily:   getLast7Days(orders),
    revenue: getLast7Revenue(orders),
    monthly: getLast6Months(orders),
  }), [orders]);

  if (loading) return (
    <div style={{ color: 'var(--admin-text-muted)', padding: '40px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px' }}>LOADING DATA…</div>
  );

  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const recentOrders   = orders.slice(0, 6);

  return (
    <div className="animate-fade-in">

      {/* ── Metric Cards ─── */}
      <div className="metrics-grid">
        {[
          { icon: '💰', label: 'Total Revenue',   value: `৳${totalRevenue.toLocaleString()}`,   sub: '↑ Lifetime', subColor: 'var(--admin-success)' },
          { icon: '📦', label: 'Total Orders',    value: totalOrders,                           sub: `${pendingCount} pending`, subColor: 'var(--admin-warning)' },
          { icon: '✅', label: 'Completed',        value: completedCount,                        sub: `${Math.round(completedCount / Math.max(totalOrders, 1) * 100)}% rate`, subColor: 'var(--admin-success)' },
          { icon: '⚡', label: 'Avg Order Value',  value: `৳${avgOrderValue.toLocaleString()}`,  sub: 'Per transaction', subColor: 'var(--admin-accent)' },
        ].map((m, i) => (
          <div key={i} className="admin-card metric-card">
            <div className="metric-icon">{m.icon}</div>
            <div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
            </div>
            <div className="metric-sub" style={{ color: m.subColor }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Analytics Charts ─── */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--admin-text-dim)', textTransform: 'uppercase' }}>
            Sales Analytics
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'daily',   label: 'Orders / Day' },
              { key: 'revenue', label: 'Revenue / Day' },
              { key: 'monthly', label: 'Monthly' },
            ].map(t => (
              <button key={t.key} onClick={() => setChartTab(t.key)}
                className={`admin-btn admin-btn-sm ${chartTab === t.key ? 'admin-btn-primary' : 'admin-btn-outline'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {chartTab === 'daily'   && <BarChart  data={chartData.daily}   label="Orders per day — last 7 days"         color="var(--admin-accent)" />}
        {chartTab === 'revenue' && <LineChart data={chartData.revenue} label="Revenue per day ×100 BDT — last 7 days" color="#a78bfa" unit="৳" />}
        {chartTab === 'monthly' && <BarChart  data={chartData.monthly} label="Orders per month — last 6 months"      color="#10b981" />}
      </div>

      {/* ── Recent Orders + Top Products ─── */}
      <div className="overview-bottom-grid">

        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--admin-text-dim)', textTransform: 'uppercase' }}>Recent Orders</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>LAST {recentOrders.length}</span>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '24px' }}>No orders yet</td></tr>
                  : recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--admin-accent)', fontWeight: 700 }}>
                        LMR-{String(order.invoice_number || order.id).padStart(5, '0')}
                      </td>
                      <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa' }}>৳{order.total_amount?.toLocaleString()}</td>
                      <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--admin-text-dim)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Top Products
          </h3>
          {popularProducts.length === 0
            ? <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No data yet</p>
            : popularProducts.map((p, idx) => (
              <div key={idx} style={{ padding: '11px 0', borderBottom: idx < popularProducts.length - 1 ? '1px solid var(--admin-border)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--admin-accent)', minWidth: '20px' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: '1px' }}>{p.salesCount} units sold</div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>৳{p.price?.toLocaleString()}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
