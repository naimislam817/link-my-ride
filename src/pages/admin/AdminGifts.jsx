import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

/**
 * AdminGifts — Manage "gift with purchase" promotions.
 * Stores records in Supabase table: gift_items
 *
 * SQL to create table (run in Supabase SQL editor):
 * -------------------------------------------------
 * CREATE TABLE public.gift_items (
 *   id         bigserial PRIMARY KEY,
 *   title      text NOT NULL,
 *   description text,
 *   image_url  text,
 *   min_order  numeric DEFAULT 0,
 *   is_active  boolean DEFAULT true,
 *   created_at timestamptz DEFAULT now()
 * );
 */

const emptyGift = {
    title: '',
    description: '',
    image_url: '',
    min_order: 0,
    is_active: true,
};

const AdminGifts = () => {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(emptyGift);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const fetchGifts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('gift_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                setTableExists(false);
            }
        } else {
            setGifts(data || []);
            setTableExists(true);
        }
        setLoading(false);
    };

    useEffect(() => { fetchGifts(); }, []);

    const openCreate = () => {
        setForm(emptyGift);
        setIsEditing(true);
        setMsg(null);
    };

    const openEdit = (gift) => {
        setForm({ ...gift });
        setIsEditing(true);
        setMsg(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        const payload = {
            title:       form.title,
            description: form.description || null,
            image_url:   form.image_url   || null,
            min_order:   Number(form.min_order) || 0,
            is_active:   form.is_active,
        };

        let error;
        if (form.id) {
            ({ error } = await supabase.from('gift_items').update(payload).eq('id', form.id));
        } else {
            ({ error } = await supabase.from('gift_items').insert([payload]));
        }

        setSaving(false);
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: form.id ? 'Gift updated!' : 'Gift created!' });
            setTimeout(() => { setIsEditing(false); fetchGifts(); }, 800);
        }
    };

    const toggleActive = async (id, current) => {
        const { error } = await supabase.from('gift_items').update({ is_active: !current }).eq('id', id);
        if (!error) fetchGifts();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this gift item?')) return;
        const { error } = await supabase.from('gift_items').delete().eq('id', id);
        if (!error) fetchGifts();
    };

    /* ── Table not created yet ── */
    if (!tableExists) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Gift <span>Items</span></h1>
                </div>
                <div className="admin-card" style={{ borderColor: 'rgba(245,158,11,0.3)', maxWidth: '700px' }}>
                    <h3 style={{ color: 'var(--admin-warning)', marginBottom: '12px' }}>⚠ Database Table Required</h3>
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '16px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        The <code style={{ color: 'var(--admin-accent)', background: 'rgba(79,142,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>gift_items</code> table doesn't exist yet.
                        Run the following SQL in your Supabase SQL Editor:
                    </p>
                    <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '10px', fontSize: '0.78rem', color: '#a3e635', overflowX: 'auto', lineHeight: 1.7 }}>{`CREATE TABLE public.gift_items (
  id         bigserial PRIMARY KEY,
  title      text NOT NULL,
  description text,
  image_url  text,
  min_order  numeric DEFAULT 0,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);`}</pre>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '16px' }} onClick={fetchGifts}>
                        ↺ Retry
                    </button>
                </div>
            </div>
        );
    }

    /* ── Edit / Create Form ── */
    if (isEditing) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">{form.id ? 'Edit' : 'New'} <span>Gift Item</span></h1>
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setIsEditing(false)}>← Back</button>
                </div>
                <div className="admin-card" style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label className="admin-label">Gift Title *</label>
                            <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Free Phone Mount" />
                        </div>
                        <div>
                            <label className="admin-label">Description</label>
                            <textarea className="admin-input" rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description of the gift item…" />
                        </div>
                        <div>
                            <label className="admin-label">Image URL (optional)</label>
                            <input className="admin-input" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
                        </div>
                        <div>
                            <label className="admin-label">Minimum Order Value (৳)</label>
                            <input type="number" className="admin-input" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} placeholder="0 = always offered" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="gift-active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent)' }} />
                            <label htmlFor="gift-active" style={{ fontSize: '0.875rem', color: 'var(--admin-text)' }}>Active (visible on storefront)</label>
                        </div>

                        {msg && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', background: msg.type === 'error' ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)', color: msg.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)', border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                                {msg.text}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : (form.id ? 'Update Gift' : 'Create Gift')}
                            </button>
                            <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    /* ── List ── */
    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Gift <span>Items</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Manage free gifts offered with qualifying orders
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Gift</button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--admin-text-muted)', padding: '40px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px' }}>LOADING…</div>
            ) : gifts.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎁</div>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem' }}>No gift items yet. Add your first one!</p>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '20px' }} onClick={openCreate}>+ Add Gift Item</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {gifts.map(gift => (
                        <div key={gift.id} className="admin-card" style={{ opacity: gift.is_active ? 1 : 0.5 }}>
                            {gift.image_url && (
                                <img src={gift.image_url} alt={gift.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px', border: '1px solid var(--admin-border)' }} />
                            )}
                            {!gift.image_url && (
                                <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: 'rgba(79,142,247,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '14px', border: '1px dashed var(--admin-border)' }}>🎁</div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{gift.title}</h3>
                                <span className={`status-badge ${gift.is_active ? 'status-completed' : 'status-cancelled'}`} style={{ flexShrink: 0, marginLeft: '8px' }}>
                                    {gift.is_active ? 'Active' : 'Off'}
                                </span>
                            </div>
                            {gift.description && <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>{gift.description}</p>}
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-accent)', marginBottom: '14px', fontFamily: "'JetBrains Mono', monospace" }}>
                                Min order: ৳{Number(gift.min_order).toLocaleString()}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(gift)}>✎ Edit</button>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => toggleActive(gift.id, gift.is_active)}>
                                    {gift.is_active ? '⏸ Deactivate' : '▶ Activate'}
                                </button>
                                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(gift.id)}>✕ Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGifts;
