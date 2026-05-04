import React from 'react';
import { useShop } from '../../context/ShopContext';
import './AdminDashboard.css';

const AdminOverview = () => {
    const { getAnalytics, loading } = useShop();
    const { totalRevenue, totalOrders, popularProducts, orders } = getAnalytics();

    if (loading) return <div className="admin-loading">Initializing Command Center...</div>;

    const recentOrders = orders.slice(0, 5);

    return (
        <div className="admin-overview animate-fade-in">
            <h1 className="admin-page-title" style={{ marginBottom: '32px', fontSize: '2rem', fontWeight: 800 }}>
                SYSTEM <span style={{ color: 'var(--admin-accent)' }}>OVERVIEW</span>
            </h1>

            {/* Metrics Dashboard */}
            <div className="metrics-grid">
                <div className="admin-card metric-card">
                    <span className="metric-label">Total Revenue</span>
                    <span className="metric-value">৳{totalRevenue.toLocaleString()}</span>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--admin-success)' }}>Lifetime earnings</div>
                </div>
                <div className="admin-card metric-card">
                    <span className="metric-label">Total Orders</span>
                    <span className="metric-value">{totalOrders}</span>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{orders.filter(o => o.status === 'pending').length} pending processing</div>
                </div>
                <div className="admin-card metric-card">
                    <span className="metric-label">Average Order Value</span>
                    <span className="metric-value">৳{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}</span>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--admin-accent)' }}>Per transaction</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* Recent Orders Section */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        RECENT DEPLOYMENTS (ORDERS)
                        <button className="admin-btn-outline" style={{ fontSize: '0.7rem' }}>VIEW LOGS</button>
                    </h3>
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
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.customer_name}</td>
                                        <td>৳{order.total_amount.toLocaleString()}</td>
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

                {/* Popular Products Sidebar */}
                <div className="admin-card">
                    <h3 style={{ marginBottom: '20px' }}>TOP PERFORMING TECH</h3>
                    <div className="popular-list">
                        {popularProducts.map((product, idx) => (
                            <div key={idx} style={{ 
                                padding: '15px 0', 
                                borderBottom: idx < popularProducts.length - 1 ? '1px solid var(--admin-border)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}>
                                <span style={{ color: 'var(--admin-accent)', fontWeight: 800, minWidth: '25px' }}>0{idx + 1}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{product.salesCount} units sold</div>
                                </div>
                                <div style={{ fontWeight: 700 }}>৳{product.price.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
