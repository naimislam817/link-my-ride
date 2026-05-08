import React from 'react';
import { useShop } from '../../context/ShopContext';
import './AdminDashboard.css';

const AdminOverview = () => {
  const { getAnalytics, loading } = useShop();
  const { totalRevenue, totalOrders, popularProducts, orders } = getAnalytics();

  if (loading) return <div style={{ color: 'var(--admin-text-muted)', padding: '40px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px' }}>LOADING DATA…</div>;

  const pendingCount   = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const recentOrders   = orders.slice(0, 6);

  return (
    <div className="animate-fade-in">

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="admin-card metric-card">
          <div className="metric-icon">💰</div>
          <div>
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">৳{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="metric-sub" style={{ color: 'var(--admin-success)' }}>↑ Lifetime earnings</div>
        </div>

        <div className="admin-card metric-card">
          <div className="metric-icon">📦</div>
          <div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-value">{totalOrders}</div>
          </div>
          <div className="metric-sub">{pendingCount} pending · {completedCount} completed</div>
        </div>

        <div className="admin-card metric-card">
          <div className="metric-icon">⚡</div>
          <div>
            <div className="metric-label">Avg. Order Value</div>
            <div className="metric-value">৳{avgOrderValue.toLocaleString()}</div>
          </div>
          <div className="metric-sub" style={{ color: 'var(--admin-accent)' }}>Per transaction</div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>

        {/* Recent Orders */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--admin-text-dim)', textTransform: 'uppercase' }}>
              Recent Orders
            </h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              LAST {recentOrders.length}
            </span>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '24px' }}>
                      No orders yet
                    </td>
                  </tr>
                ) : recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--admin-accent)' }}>
                      ৳{order.total_amount?.toLocaleString()}
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--admin-text-dim)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Top Products
          </h3>
          <div>
            {popularProducts.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>No data yet</p>
            ) : popularProducts.map((product, idx) => (
              <div key={idx} style={{
                padding: '13px 0',
                borderBottom: idx < popularProducts.length - 1 ? '1px solid var(--admin-border)' : 'none',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--admin-accent)', minWidth: '22px',
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                    {product.salesCount} sold
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                  ৳{product.price?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
