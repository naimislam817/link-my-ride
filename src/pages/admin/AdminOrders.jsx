import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data);
        }
        setLoading(false);
    };

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

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Orders Management</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Customer</th>
                            <th style={{ padding: '12px' }}>Contact</th>
                            <th style={{ padding: '12px' }}>Items</th>
                            <th style={{ padding: '12px' }}>Total</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{order.customer_name}</td>
                                <td style={{ padding: '12px' }}>
                                    {order.customer_phone}<br/>
                                    <small>{order.customer_email}</small>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {Array.isArray(order.items) ? (
                                        <ul style={{ margin: 0, paddingLeft: '15px' }}>
                                            {order.items.map((item, idx) => (
                                                <li key={idx}><small>{item.name} (x{item.quantity})</small></li>
                                            ))}
                                        </ul>
                                    ) : (
                                        typeof order.items === 'string' ? "Old format mapping needed" : "Failed to parse Items"
                                    )}
                                </td>
                                <td style={{ padding: '12px' }}>৳{Number(order.total_amount).toLocaleString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                        background: order.status === 'pending' ? '#f39c12' : order.status === 'completed' ? '#27ae60' : '#e74c3c',
                                        color: '#fff'
                                    }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        style={{ padding: '5px', background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No orders yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
