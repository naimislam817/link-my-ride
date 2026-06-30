import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'
    const [lightboxImg, setLightboxImg] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    products (
                        name
                    )
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews for admin:", err);
            alert("Failed to load reviews. " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (id) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ approved: true })
                .eq('id', id);
            
            if (error) throw error;
            
            // Update local state
            setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
        } catch (err) {
            console.error("Error approving review:", err);
            alert("Failed to approve review. " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this review?")) {
            try {
                const { error } = await supabase
                    .from('reviews')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                // Update local state
                setReviews(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                console.error("Error deleting review:", err);
                alert("Failed to delete review. " + err.message);
            }
        }
    };

    // Filter reviews
    const filteredReviews = reviews.filter(r => {
        if (statusFilter === 'pending') return !r.approved;
        if (statusFilter === 'approved') return r.approved;
        return true;
    });

    const pendingCount = reviews.filter(r => !r.approved).length;
    const approvedCount = reviews.filter(r => r.approved).length;

    if (loading) return <div className="admin-loading">Loading reviews…</div>;

    return (
        <div className="animate-fade-in">
            {/* Lightbox */}
            {lightboxImg && (
                <div
                    onClick={() => setLightboxImg(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, cursor: 'zoom-out', backdropFilter: 'blur(8px)'
                    }}
                >
                    <img
                        src={lightboxImg}
                        alt="Review photo full size"
                        style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxImg(null)}
                        style={{
                            position: 'absolute', top: '20px', right: '24px',
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: '#fff', fontSize: '1.5rem', width: '44px', height: '44px',
                            borderRadius: '50%', cursor: 'pointer'
                        }}
                    >✕</button>
                </div>
            )}

            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Review <span>Moderation</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        {reviews.length} total · {pendingCount} pending · {approvedCount} approved
                    </p>
                </div>
                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={fetchReviews}>
                    ↺ Refresh
                </button>
            </div>

            {/* Quick Stats */}
            <div className="orders-stats-grid">
                {[
                    { label: 'Total Reviews', value: reviews.length, color: 'var(--admin-accent)' },
                    { label: 'Pending Approval', value: pendingCount, color: 'var(--admin-warning)' },
                    { label: 'Approved Reviews', value: approvedCount, color: 'var(--admin-success)' },
                ].map((s, i) => (
                    <div key={i} className="admin-card" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="admin-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select 
                        className="admin-input" 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: '160px' }}
                    >
                        <option value="all">All Reviews</option>
                        <option value="pending">⏳ Pending Approval ({pendingCount})</option>
                        <option value="approved">✅ Approved ({approvedCount})</option>
                    </select>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Customer Name</th>
                                <th>Rating</th>
                                <th style={{ width: '32%' }}>Comment</th>
                                <th>Photos</th>
                                <th>Status</th>
                                <th>Submitted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-muted)' }}>
                                        No reviews found matching this filter
                                    </td>
                                </tr>
                            )}
                            {filteredReviews.map(rev => {
                                const productName = rev.products?.name || `Product ID: ${rev.product_id}`;
                                return (
                                    <tr key={rev.id}>
                                        {/* Product */}
                                        <td style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>
                                            {productName}
                                        </td>
                                        
                                        {/* Customer */}
                                        <td style={{ fontWeight: 500, color: '#fff' }}>
                                            {rev.customer_name}
                                        </td>

                                        {/* Rating */}
                                        <td style={{ color: 'var(--admin-warning)', fontFamily: 'monospace', letterSpacing: '1px', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                        </td>

                                        {/* Comment */}
                                        <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                            {rev.comment}
                                        </td>

                                        {/* Photos */}
                                        <td>
                                            {rev.images && rev.images.length > 0 ? (
                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '120px' }}>
                                                    {rev.images.map((url, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={url}
                                                            alt={`Photo ${idx + 1}`}
                                                            onClick={() => setLightboxImg(url)}
                                                            style={{
                                                                width: '44px',
                                                                height: '44px',
                                                                objectFit: 'cover',
                                                                borderRadius: '6px',
                                                                cursor: 'zoom-in',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                transition: 'opacity 0.2s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>—</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td>
                                            <span 
                                                className={`status-badge`} 
                                                style={{ 
                                                    background: rev.approved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)', 
                                                    color: rev.approved ? 'var(--admin-success)' : 'var(--admin-warning)',
                                                    border: `1px solid ${rev.approved ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '700',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {rev.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(rev.created_at).toLocaleDateString('en-GB')}
                                        </td>

                                        {/* Actions */}
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {!rev.approved && (
                                                    <button
                                                        onClick={() => handleApprove(rev.id)}
                                                        className="admin-btn"
                                                        style={{
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            color: 'var(--admin-success)',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            padding: '4px 10px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: '600',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(rev.id)}
                                                    className="admin-btn"
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.08)',
                                                        color: '#ef4444',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        padding: '4px 10px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: '600',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReviews;
