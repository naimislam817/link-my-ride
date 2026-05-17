import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

/* ── Status Timeline ─────────────────────────────────────────── */
const STATUS_STEPS = [
    { key: 'pending',    label: 'Pending',    icon: '🕐', color: '#f59e0b' },
    { key: 'processing', label: 'Processing', icon: '⚙️',  color: '#4f8ef7' },
    { key: 'completed',  label: 'Completed',  icon: '✅',  color: '#10b981' },
];
const CANCELLED = { key: 'cancelled', label: 'Cancelled', icon: '✕', color: '#ef4444' };

const StatusTimeline = ({ currentStatus }) => {
    const isCancelled = currentStatus === 'cancelled';
    const steps = isCancelled
        ? [STATUS_STEPS[0], CANCELLED]
        : STATUS_STEPS;

    const activeIdx = isCancelled
        ? (currentStatus === 'cancelled' ? 1 : 0)
        : STATUS_STEPS.findIndex(s => s.key === currentStatus);

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', fontWeight: 700 }}>
                Order Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {steps.map((step, i) => {
                    const isDone    = i <= activeIdx;
                    const isActive  = i === activeIdx;
                    const isLast    = i === steps.length - 1;
                    const stepColor = isDone ? step.color : 'rgba(255,255,255,0.12)';

                    return (
                        <React.Fragment key={step.key}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {/* Circle */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: isDone ? `${step.color}22` : 'rgba(255,255,255,0.04)',
                                    border: `2px solid ${stepColor}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.9rem',
                                    boxShadow: isActive ? `0 0 14px ${step.color}66` : 'none',
                                    transition: 'all 0.3s ease',
                                    zIndex: 1, position: 'relative',
                                }}>
                                    {isDone ? <span style={{ fontSize: '0.85rem' }}>{step.icon}</span>
                                            : <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'block' }} />}
                                </div>
                                {/* Label */}
                                <div style={{
                                    marginTop: '6px', fontSize: '0.65rem', fontWeight: isActive ? 700 : 500,
                                    color: isDone ? step.color : 'var(--admin-text-muted)',
                                    letterSpacing: '0.5px', whiteSpace: 'nowrap',
                                    textShadow: isActive ? `0 0 8px ${step.color}` : 'none',
                                }}>{step.label}</div>
                            </div>
                            {/* Connector line */}
                            {!isLast && (
                                <div style={{
                                    flex: 1, height: '2px', marginBottom: '20px',
                                    background: i < activeIdx
                                        ? `linear-gradient(90deg, ${steps[i].color}, ${steps[i+1].color})`
                                        : 'rgba(255,255,255,0.06)',
                                    transition: 'background 0.3s ease',
                                }} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

/* ── Admin Note Editor ───────────────────────────────────────── */
const OrderNoteEditor = ({ orderId, initialNote, onSaved }) => {
    const [note, setNote] = useState(initialNote || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase.from('orders').update({ admin_notes: note }).eq('id', orderId);
        setSaving(false);
        if (!error) {
            setSaved(true);
            onSaved(note);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
    };

    return (
        <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📝 Admin Notes
                <span style={{ fontSize: '0.58rem', color: 'var(--admin-text-muted)', fontWeight: 400, letterSpacing: '0.5px' }}>(Ctrl+Enter to save)</span>
            </div>
            <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add internal notes about this order — e.g. contacted customer, payment confirmed, out for delivery…"
                className="admin-input"
                rows={4}
                style={{ resize: 'vertical', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, fontSize: '0.82rem' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <button
                    className="admin-btn admin-btn-primary admin-btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Note'}
                </button>
                {note !== (initialNote || '') && !saving && !saved && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-warning)' }}>Unsaved changes</span>
                )}
            </div>
        </div>
    );
};

/* ── Main Component ─────────────────────────────────────────── */
const AdminOrders = () => {
    const { orders, fetchOrders, loading } = useShop();

    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate]     = useState('');
    const [endDate, setEndDate]         = useState('');
    const [sortOrder, setSortOrder]     = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [localNotes, setLocalNotes]   = useState({});

    const handleNoteSaved = useCallback((orderId, noteText) => {
        setLocalNotes(prev => ({ ...prev, [orderId]: noteText }));
    }, []);

    useEffect(() => { fetchOrders(); }, []);

    /* Derived / filtered data */
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Invoice search
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(o => {
                const invoice = `lmr-${String(o.invoice_number || o.id).padStart(5, '0')}`.toLowerCase();
                return (
                    invoice.includes(q) ||
                    (o.customer_name || '').toLowerCase().includes(q) ||
                    (o.customer_phone || '').toLowerCase().includes(q)
                );
            });
        }

        // Status filter
        if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);

        // Date range
        result = result.filter(o => {
            const d = new Date(o.created_at);
            if (startDate && d < new Date(startDate)) return false;
            if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
            return true;
        });

        // Sort
        result.sort((a, b) => {
            const dA = new Date(a.created_at).getTime();
            const dB = new Date(b.created_at).getTime();
            return sortOrder === 'desc' ? dB - dA : dA - dB;
        });

        return result;
    }, [orders, searchQuery, statusFilter, startDate, endDate, sortOrder]);

    const updateOrderStatus = async (id, status) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', id);
        if (error) alert('Failed to update status');
        else fetchOrders();
    };

    const pendingCount   = orders.filter(o => o.status === 'pending').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const totalRevenue   = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

    if (loading) return <div className="admin-loading">Loading orders…</div>;

    return (
        <div className="animate-fade-in">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Order <span>Management</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        {orders.length} total · {pendingCount} pending · {completedCount} completed
                    </p>
                </div>
                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => fetchOrders()}>
                    ↺ Refresh
                </button>
            </div>

            {/* ── Quick Stats ───────────────────────────────── */}
            <div className="orders-stats-grid">
                {[
                    { label: 'Total Orders', value: orders.length, color: 'var(--admin-accent)' },
                    { label: 'Pending', value: pendingCount, color: 'var(--admin-warning)' },
                    { label: 'Completed', value: completedCount, color: 'var(--admin-success)' },
                    { label: 'Revenue', value: `৳${Math.round(totalRevenue).toLocaleString()}`, color: '#a78bfa' },
                ].map((s, i) => (
                    <div key={i} className="admin-card" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                    </div>
                ))}
            </div>


            {/* ── Filters ───────────────────────────────────── */}
            <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Invoice / name search */}
                    <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '220px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
                        <input
                            className="admin-input"
                            placeholder="Search invoice, name, phone…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '34px' }}
                        />
                    </div>

                    {/* Status */}
                    <select className="admin-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: '130px' }}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Sort */}
                    <select className="admin-input" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                        style={{ width: 'auto', minWidth: '140px' }}>
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>

                    {/* Date range */}
                    <input type="date" className="admin-input" value={startDate} onChange={e => setStartDate(e.target.value)}
                        style={{ width: 'auto', colorScheme: 'dark' }} />
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>
                    <input type="date" className="admin-input" value={endDate} onChange={e => setEndDate(e.target.value)}
                        style={{ width: 'auto', colorScheme: 'dark' }} />

                    {(startDate || endDate || searchQuery || statusFilter !== 'all') && (
                        <button className="admin-btn admin-btn-outline admin-btn-sm"
                            onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); setStatusFilter('all'); }}>
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Orders Table ──────────────────────────────── */}
            <div className="admin-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                        SHOWING {filteredOrders.length} OF {orders.length} ORDERS
                    </span>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Customer</th>
                                <th>Items & Qty</th>
                                <th>Amount</th>
                                <th>Delivery</th>
                                <th>Status</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-muted)' }}>
                                        No orders match your filters
                                    </td>
                                </tr>
                            )}
                            {filteredOrders.map(order => {
                                const invoiceNum = order.invoice_number || String(order.id).padStart(5, '0');
                                const isExpanded = expandedOrder === order.id;
                                const items = Array.isArray(order.items) ? order.items : [];
                                const totalQty = items.reduce((s, it) => s + (it.quantity || 1), 0);

                                return (
                                    <React.Fragment key={order.id}>
                                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                            {/* Invoice */}
                                            <td>
                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--admin-accent)', fontSize: '0.82rem' }}>
                                                    LMR-{invoiceNum}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                                                </div>
                                                {/* Note indicator */}
                                                {(localNotes[order.id] !== undefined ? localNotes[order.id] : order.admin_notes) && (
                                                    <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)', color: 'var(--admin-warning)', border: '1px solid rgba(245,158,11,0.3)', padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>📝 NOTE</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Customer */}
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customer_name}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{order.customer_phone}</div>
                                            </td>

                                            {/* Items + Qty */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'white' }}>
                                                        {items.length} item{items.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <span style={{
                                                        background: 'rgba(79,142,247,0.15)', color: 'var(--admin-accent)',
                                                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                                                        border: '1px solid rgba(79,142,247,0.25)'
                                                    }}>
                                                        Qty: {totalQty}
                                                    </span>
                                                </div>
                                                {/* Inline mini list */}
                                                <div style={{ marginTop: '4px' }}>
                                                    {items.slice(0, 2).map((it, idx) => (
                                                        <div key={idx} style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                                            {it.name} <strong style={{ color: 'var(--admin-accent)' }}>×{it.quantity || 1}</strong>
                                                        </div>
                                                    ))}
                                                    {items.length > 2 && (
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)' }}>+{items.length - 2} more — click to expand</div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#a78bfa', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                ৳{Number(order.total_amount).toLocaleString()}
                                            </td>

                                            {/* Delivery zone */}
                                            <td>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                                                    {order.delivery_zone || order.city || '—'}
                                                </span>
                                            </td>

                                            {/* Status badge */}
                                            <td>
                                                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                            </td>

                                            {/* Status updater */}
                                            <td onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={order.status}
                                                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                                                    className="admin-input"
                                                    style={{ padding: '5px 8px', fontSize: '0.72rem', width: 'auto', minWidth: '110px' }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>

                                        {/* ── Expanded detail row ── */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: '0', border: 'none' }}>
                                                    <div className="order-expand-panel" style={{
                                                        background: 'rgba(8, 11, 20, 0.6)',
                                                        borderTop: '1px solid rgba(79,142,247,0.2)',
                                                        borderBottom: '1px solid rgba(79,142,247,0.2)',
                                                    }}>
                                                        {/* ── Status Timeline (full width) ── */}
                                                        <StatusTimeline currentStatus={order.status} />

                                                        <div className="order-detail-grid">

                                                            {/* Col 1: Order Items */}
                                                            <div>
                                                                <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 700 }}>
                                                                    Order Items
                                                                </div>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            {['Product', 'Qty', 'Price', 'Sub'].map(h => (
                                                                                <th key={h} style={{ textAlign: 'left', fontSize: '0.62rem', color: 'var(--admin-text-muted)', paddingBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {items.map((it, idx) => (
                                                                            <tr key={idx}>
                                                                                <td style={{ fontSize: '0.78rem', padding: '5px 0', color: 'white', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name}</td>
                                                                                <td style={{ fontSize: '0.78rem', padding: '5px 6px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--admin-accent)', fontWeight: 700 }}>×{it.quantity || 1}</td>
                                                                                <td style={{ fontSize: '0.75rem', padding: '5px 0', color: 'var(--admin-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>৳{Number(it.price || 0).toLocaleString()}</td>
                                                                                <td style={{ fontSize: '0.78rem', padding: '5px 0', color: '#a78bfa', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>৳{Number((it.price || 0) * (it.quantity || 1)).toLocaleString()}</td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr>
                                                                            <td colSpan={3} style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', paddingTop: '10px', borderTop: '1px solid var(--admin-border)' }}>Total</td>
                                                                            <td style={{ fontSize: '0.88rem', color: '#a78bfa', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, paddingTop: '10px', borderTop: '1px solid var(--admin-border)' }}>৳{Number(order.total_amount).toLocaleString()}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            {/* Col 2: Delivery Info */}
                                                            <div>
                                                                <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 700 }}>
                                                                    Delivery Info
                                                                </div>
                                                                {[
                                                                    ['Name',       order.customer_name],
                                                                    ['Phone',      order.customer_phone],
                                                                    ['Address',    order.address || order.delivery_address],
                                                                    ['City / Zone',order.city || order.delivery_zone],
                                                                    ['Customer Note', order.notes],
                                                                ].filter(([, v]) => v).map(([k, v]) => (
                                                                    <div key={k} style={{ display: 'flex', gap: '8px', marginBottom: '7px' }}>
                                                                        <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', minWidth: '76px', textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: '2px', flexShrink: 0 }}>{k}</span>
                                                                        <span style={{ fontSize: '0.8rem', color: 'white', lineHeight: 1.4 }}>{v}</span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Col 3: Admin Notes */}
                                                            <div onClick={e => e.stopPropagation()}>
                                                                <OrderNoteEditor
                                                                    orderId={order.id}
                                                                    initialNote={localNotes[order.id] !== undefined ? localNotes[order.id] : (order.admin_notes || '')}
                                                                    onSaved={(text) => handleNoteSaved(order.id, text)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
