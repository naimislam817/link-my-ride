import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

/**
 * AdminOffers — Manage current promotional offers / discount banners.
 * Stores records in Supabase table: offers
 *
 * SQL to create table (run in Supabase SQL editor):
 * -------------------------------------------------
 * CREATE TABLE public.offers (
 *   id          bigserial PRIMARY KEY,
 *   title       text NOT NULL,
 *   subtitle    text,
 *   discount_pct numeric DEFAULT 0,
 *   code        text,
 *   valid_until date,
 *   bg_color    text DEFAULT '#1e293b',
 *   badge       text,
 *   is_active   boolean DEFAULT true,
 *   created_at  timestamptz DEFAULT now()
 * );
 */

const emptyOffer = {
    title:        '',
    subtitle:     '',
    discount_pct: '',
    code:         '',
    valid_until:  '',
    bg_color:     '#1e293b',
    badge:        '',
    is_active:    true,
};

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(emptyOffer);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    const fetchOffers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                setTableExists(false);
            }
        } else {
            setOffers(data || []);
            setTableExists(true);
        }
        setLoading(false);
    };

    useEffect(() => { fetchOffers(); }, []);

    const openCreate = () => { setForm(emptyOffer); setIsEditing(true); setMsg(null); };
    const openEdit   = (o)  => { setForm({ ...o, valid_until: o.valid_until?.split('T')[0] || '' }); setIsEditing(true); setMsg(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        const payload = {
            title:        form.title,
            subtitle:     form.subtitle     || null,
            discount_pct: Number(form.discount_pct) || 0,
            code:         form.code         || null,
            valid_until:  form.valid_until  || null,
            bg_color:     form.bg_color     || '#1e293b',
            badge:        form.badge        || null,
            is_active:    form.is_active,
        };

        let error;
        if (form.id) {
            ({ error } = await supabase.from('offers').update(payload).eq('id', form.id));
        } else {
            ({ error } = await supabase.from('offers').insert([payload]));
        }

        setSaving(false);
        if (error) {
            setMsg({ type: 'error', text: error.message });
        } else {
            setMsg({ type: 'success', text: form.id ? 'Offer updated!' : 'Offer created!' });
            setTimeout(() => { setIsEditing(false); fetchOffers(); }, 800);
        }
    };

    const toggleActive = async (id, current) => {
        await supabase.from('offers').update({ is_active: !current }).eq('id', id);
        fetchOffers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this offer?')) return;
        await supabase.from('offers').delete().eq('id', id);
        fetchOffers();
    };

    const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

    /* ── Table not created ── */
    if (!tableExists) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Current <span>Offers</span></h1>
                </div>
                <div className="admin-card" style={{ borderColor: 'rgba(245,158,11,0.3)', maxWidth: '700px' }}>
                    <h3 style={{ color: 'var(--admin-warning)', marginBottom: '12px' }}>⚠ Database Table Required</h3>
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '16px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        The <code style={{ color: 'var(--admin-accent)', background: 'rgba(79,142,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>offers</code> table doesn't exist yet.
                        Run the SQL below in your Supabase SQL Editor:
                    </p>
                    <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '10px', fontSize: '0.78rem', color: '#a3e635', overflowX: 'auto', lineHeight: 1.7 }}>{`CREATE TABLE public.offers (
  id          bigserial PRIMARY KEY,
  title       text NOT NULL,
  subtitle    text,
  discount_pct numeric DEFAULT 0,
  code        text,
  valid_until date,
  bg_color    text DEFAULT '#1e293b',
  badge       text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);`}</pre>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '16px' }} onClick={fetchOffers}>↺ Retry</button>
                </div>
            </div>
        );
    }

    /* ── Edit / Create Form ── */
    if (isEditing) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">{form.id ? 'Edit' : 'New'} <span>Offer</span></h1>
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setIsEditing(false)}>← Back</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
                    <div className="admin-card">
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="admin-label">Offer Title *</label>
                                    <input className="admin-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Ramadan Flash Sale" />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="admin-label">Subtitle / Description</label>
                                    <input className="admin-input" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. Up to 30% off on all dashcams" />
                                </div>
                                <div>
                                    <label className="admin-label">Discount %</label>
                                    <input type="number" min="0" max="100" className="admin-input" value={form.discount_pct} onChange={e => setForm({ ...form, discount_pct: e.target.value })} placeholder="e.g. 20" />
                                </div>
                                <div>
                                    <label className="admin-label">Promo Code (optional)</label>
                                    <input className="admin-input" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" />
                                </div>
                                <div>
                                    <label className="admin-label">Valid Until</label>
                                    <input type="date" className="admin-input" value={form.valid_until || ''} onChange={e => setForm({ ...form, valid_until: e.target.value })} style={{ colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label className="admin-label">Badge Label</label>
                                    <input className="admin-input" value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. HOT DEAL" />
                                </div>
                                <div>
                                    <label className="admin-label">Card Background Color</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="color" value={form.bg_color || '#1e293b'} onChange={e => setForm({ ...form, bg_color: e.target.value })}
                                            style={{ width: '44px', height: '40px', border: '1px solid var(--admin-border)', borderRadius: '8px', background: 'none', cursor: 'pointer', padding: '2px' }} />
                                        <input className="admin-input" value={form.bg_color || ''} onChange={e => setForm({ ...form, bg_color: e.target.value })} placeholder="#1e293b" style={{ flex: 1 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
                                    <input type="checkbox" id="offer-active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: 'var(--admin-accent)' }} />
                                    <label htmlFor="offer-active" style={{ fontSize: '0.875rem', color: 'var(--admin-text)' }}>Active (show on storefront)</label>
                                </div>
                            </div>

                            {msg && (
                                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', background: msg.type === 'error' ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)', color: msg.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)', border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                                    {msg.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                                    {saving ? 'Saving…' : (form.id ? 'Update Offer' : 'Create Offer')}
                                </button>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>

                    {/* Live Preview Card */}
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 700 }}>Live Preview</div>
                        <OfferCard offer={form} preview />
                    </div>
                </div>
            </div>
        );
    }

    /* ── List ── */
    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Current <span>Offers</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Manage promotional banners and discount campaigns
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Offer</button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--admin-text-muted)', padding: '40px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px' }}>LOADING…</div>
            ) : offers.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏷️</div>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem' }}>No offers yet. Create your first campaign!</p>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '20px' }} onClick={openCreate}>+ Create Offer</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {offers.map(offer => (
                        <div key={offer.id} style={{ opacity: offer.is_active ? 1 : 0.5 }}>
                            <OfferCard offer={offer} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(offer)}>✎ Edit</button>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => toggleActive(offer.id, offer.is_active)}>
                                    {offer.is_active ? '⏸ Pause' : '▶ Activate'}
                                </button>
                                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(offer.id)}>✕ Delete</button>
                                {isExpired(offer.valid_until) && (
                                    <span className="status-badge status-cancelled">EXPIRED</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── Offer Preview Card ────────────────────────────────────── */
const OfferCard = ({ offer, preview }) => {
    const expired = offer.valid_until && new Date(offer.valid_until) < new Date();

    return (
        <div style={{
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: offer.bg_color || '#1e293b',
            position: 'relative',
            minHeight: '140px',
            padding: '20px',
        }}>
            {/* Decorative glow */}
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

            {offer.badge && (
                <span style={{ display: 'inline-block', background: 'rgba(239,68,68,0.9)', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {offer.badge}
                </span>
            )}

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '4px', lineHeight: 1.2 }}>
                {offer.title || 'Offer Title'}
            </h3>
            {offer.subtitle && (
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', marginBottom: '12px', lineHeight: 1.4 }}>{offer.subtitle}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {offer.discount_pct > 0 && (
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#facc15', lineHeight: 1 }}>
                        {offer.discount_pct}% OFF
                    </span>
                )}
                {offer.code && (
                    <span style={{ background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.3)', color: 'white', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', letterSpacing: '1px' }}>
                        {offer.code}
                    </span>
                )}
            </div>

            {offer.valid_until && (
                <div style={{ marginTop: '12px', fontSize: '0.68rem', color: expired ? '#ef4444' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {expired ? '⚠ EXPIRED' : '⏳'} Valid until {new Date(offer.valid_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            )}
        </div>
    );
};

export default AdminOffers;
