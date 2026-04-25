import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const AdminOrders = () => {
    const { orders, fetchOrders, loading } = useShop();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (id, status) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (error) {
            console.error('Error updating order:', error);
            alert('Failed to update status');
        } else {
            fetchOrders();
        }
    };

    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const filteredOrders = sortedOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate + 'T23:59:59')) return false;
        return true;
    });

    if (loading) return <div className="admin-loading">Intercepting Orders...</div>;

    return (
        <div className="admin-orders animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h1 className="admin-page-title" style={{ marginBottom: 0 }}>
                    ORDER <span style={{ color: 'var(--admin-accent)' }}>OPERATIONS</span>
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Sort */}
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Sort:</span>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="admin-input"
                        style={{ padding: '8px 12px', width: 'auto' }}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>

                    {/* Date range */}
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>From:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="admin-input"
                        style={{ padding: '8px 12px', width: 'auto', colorScheme: 'dark' }}
                    />
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>To:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="admin-input"
                        style={{ padding: '8px 12px', width: 'auto', colorScheme: 'dark' }}
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="admin-btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Client Details</th>
                                <th>Items</th>
                                <th>Total Yield</th>
                                <th>Status</th>
                                <th>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{new Date(order.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{order.customer_phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px' }}>
                                            {Array.isArray(order.items) ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        • {item.name} <span style={{ color: 'var(--admin-accent)' }}>x{item.quantity}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-danger)' }}>Error in Data</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--admin-accent)' }}>
                                        ৳{Number(order.total_amount).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                    </td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="admin-input"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto' }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                                        No orders found for the selected date range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
