import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useShop } from '../../context/ShopContext';
import './AdminDashboard.css';

const emptySlide = {
    bgImg: '',
    pillText: '',
    pillClass: 'badge-moto',
    title: '',
    desc: '',
    buttonText: 'Shop Collection',
    buttonClass: 'btn-primary',
    buttonLink: '',
    isDarkText: false,
    overlayClass: 'dark-overlay',
};

const AdminHero = () => {
    const { heroSlides, refreshHeroSlides, saveHeroSlide, deleteHeroSlide } = useShop();
    const [loading, setLoading] = useState(true);
    const [tableExists, setTableExists] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(emptySlide);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const checkTableAndLoad = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('hero_slides')
                .select('id')
                .limit(1);

            if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
                setTableExists(false);
            } else {
                setTableExists(true);
                await refreshHeroSlides();
            }
        } catch (err) {
            setTableExists(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkTableAndLoad();
    }, []);

    const handleUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMsg({ type: 'error', text: 'Please select a valid image file.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMsg({ type: 'error', text: 'Image is too large. Max size is 5MB.' });
            return;
        }

        setUploading(true);
        setMsg(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `hero/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            setForm(prev => ({ ...prev, bgImg: publicUrl }));
            setMsg({ type: 'success', text: 'Image uploaded successfully!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Upload failed: ' + err.message });
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const openCreate = () => {
        setForm(emptySlide);
        setIsEditing(true);
        setMsg(null);
    };

    const openEdit = (slide) => {
        setForm(slide);
        setIsEditing(true);
        setMsg(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.bgImg) {
            setMsg({ type: 'error', text: 'Please upload a background image or provide a valid URL.' });
            return;
        }
        if (!form.title) {
            setMsg({ type: 'error', text: 'Slide title is required.' });
            return;
        }

        setSaving(true);
        setMsg(null);

        const res = await saveHeroSlide(form);
        setSaving(false);

        if (res.success) {
            setMsg({ type: 'success', text: form.id ? 'Slide updated!' : 'Slide created!' });
            setTimeout(() => {
                setIsEditing(false);
                checkTableAndLoad();
            }, 800);
        } else {
            setMsg({ type: 'error', text: res.error });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this hero slide?')) return;
        const res = await deleteHeroSlide(id);
        if (res.success) {
            checkTableAndLoad();
        } else {
            alert('Failed to delete slide: ' + res.error);
        }
    };

    if (!tableExists) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Hero <span>Banner</span></h1>
                </div>
                <div className="admin-card" style={{ borderColor: 'rgba(245,158,11,0.3)', maxWidth: '750px' }}>
                    <h3 style={{ color: 'var(--admin-warning)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️</span> Database Table Required
                    </h3>
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '16px', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        The <code style={{ color: 'var(--admin-accent)', background: 'rgba(79,142,247,0.1)', padding: '2px 6px', borderRadius: '4px' }}>hero_slides</code> table does not exist in your Supabase database.
                        To initialize this feature, please copy and paste the SQL command below into your Supabase SQL Editor and click **Run**:
                    </p>
                    <pre style={{ 
                        background: 'rgba(0,0,0,0.6)', 
                        padding: '18px', 
                        borderRadius: '10px', 
                        fontSize: '0.8rem', 
                        color: '#a3e635', 
                        overflowX: 'auto', 
                        lineHeight: 1.7,
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontFamily: "'JetBrains Mono', monospace"
                    }}>{`-- IMPORTANT: Drops old table to avoid column conflicts
DROP TABLE IF EXISTS public.hero_slides CASCADE;

CREATE TABLE public.hero_slides (
  id SERIAL PRIMARY KEY,
  bg_img text NOT NULL,
  pill_text text,
  pill_class text DEFAULT 'badge-moto',
  title text NOT NULL,
  "desc" text,
  button_text text DEFAULT 'Shop Collection',
  button_class text DEFAULT 'btn-primary',
  button_link text,
  is_dark_text boolean DEFAULT false,
  overlay_class text DEFAULT 'dark-overlay',
  created_at timestamptz DEFAULT now()
);

-- Seed initial slides for Link My Ride
INSERT INTO public.hero_slides (bg_img, pill_text, pill_class, title, "desc", button_text, button_class, button_link, is_dark_text, overlay_class)
VALUES 
('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1470', 'MOTO SERIES', 'badge-moto', 'Ride Free.<br />Stay<br /><span>Connected.</span>', 'Premium motorcycle communicators designed for crystal-clear audio and seamless mesh networking on the open road.', 'Shop Collection', 'btn-primary', '#catalog?category=communicators', false, 'dark-overlay'),
('https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?q=80&w=1470', 'AUTO SERIES', 'badge-auto', 'Your Eye<br />On The <span>Road.</span>', 'Capture every ride in crystal-clear 4K — even at night. Cloud-ready for ultimate security.', 'Shop Collection', 'btn-primary', '#catalog?category=dashcams', true, 'light-overlay');

-- 4. FIX PERMISSIONS & ROW LEVEL SECURITY
-- Disable Row Level Security (so standard API calls can read/write without restrictions)
ALTER TABLE public.hero_slides DISABLE ROW LEVEL SECURITY;

-- Grant standard permissions to API roles (anon and authenticated)
GRANT ALL ON TABLE public.hero_slides TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.hero_slides_id_seq TO postgres, anon, authenticated, service_role;`}</pre>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '20px' }} onClick={checkTableAndLoad}>
                        🔄 Verify Table Connection
                    </button>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="animate-fade-in">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">{form.id ? 'Edit' : 'New'} <span>Slide</span></h1>
                    <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setIsEditing(false)}>← Back</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', alignItems: 'start' }}>
                    <div className="admin-card">
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label className="admin-label">Pill / Badge Text (e.g. MOTO SERIES)</label>
                                <input className="admin-input" value={form.pillText || ''} onChange={e => setForm({ ...form, pillText: e.target.value })} placeholder="MOTO SERIES" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label className="admin-label">Pill Color Badge Style</label>
                                    <select className="admin-input" value={form.pillClass || 'badge-moto'} onChange={e => setForm({ ...form, pillClass: e.target.value })}>
                                        <option value="badge-moto">Orange (badge-moto)</option>
                                        <option value="badge-auto">Blue (badge-auto)</option>
                                        <option value="badge-primary">Theme Active</option>
                                        <option value="badge-outline">Outline Steel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="admin-label">Button Style Class</label>
                                    <select className="admin-input" value={form.buttonClass || 'btn-primary'} onChange={e => setForm({ ...form, buttonClass: e.target.value })}>
                                        <option value="btn-primary">Primary Fill (Orange/Solid)</option>
                                        <option value="btn-secondary">Secondary Outline</option>
                                        <option value="btn-dark">Dark Charcoal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Slide Main Title (Supports HTML like &lt;br /&gt; or &lt;span&gt;)</label>
                                <input className="admin-input" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ride Free.<br />Stay<br /><span>Connected.</span>" required />
                                <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '4px', display: 'block' }}>
                                    Tip: Wrap text in <code>&lt;span&gt;text&lt;/span&gt;</code> to highlight it in accent color, and <code>&lt;br /&gt;</code> to break lines.
                                </span>
                            </div>

                            <div>
                                <label className="admin-label">Description Text</label>
                                <textarea className="admin-input" rows="3" value={form.desc || ''} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Premium motorcycle communicators designed for crystal-clear mesh networking." />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label className="admin-label">Button Text</label>
                                    <input className="admin-input" value={form.buttonText || 'Shop Collection'} onChange={e => setForm({ ...form, buttonText: e.target.value })} placeholder="Shop Collection" />
                                </div>
                                <div>
                                    <label className="admin-label">Button Redirect Link</label>
                                    <input className="admin-input" value={form.buttonLink || ''} onChange={e => setForm({ ...form, buttonLink: e.target.value })} placeholder="#catalog?category=communicators" />
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Background Banner Image</label>
                                <div 
                                    className={`admin-dropzone ${dragging ? 'dragging' : ''}`}
                                    onDragOver={onDragOver}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ height: '140px' }}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={(e) => handleUpload(e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                    />
                                    {uploading ? (
                                        <div className="admin-dropzone-text">Uploading banner assets...</div>
                                    ) : form.bgImg ? (
                                        <>
                                            <img src={form.bgImg} alt="Preview bg" className="admin-dropzone-preview" style={{ filter: 'brightness(0.7)' }} />
                                            <div className="admin-dropzone-text" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                                Image Set! Click or drag to <span>replace</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="admin-dropzone-icon">🖼️</div>
                                            <div className="admin-dropzone-text">
                                                <span>Click to upload background image</span> or drag here<br/>
                                                <small>Min width 1200px recommended for high-res banners</small>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <label className="admin-label" style={{ fontSize: '0.72rem' }}>Or input absolute Image URL directly:</label>
                                    <input className="admin-input admin-input-sm" value={form.bgImg || ''} onChange={e => setForm({ ...form, bgImg: e.target.value })} placeholder="https://example.com/banner.jpg" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label className="admin-label" style={{ marginBottom: 0 }}>Banner Overlay</label>
                                    <select className="admin-input" value={form.overlayClass || 'dark-overlay'} onChange={e => setForm({ ...form, overlayClass: e.target.value })}>
                                        <option value="dark-overlay">Dark Overlay (increases white contrast)</option>
                                        <option value="light-overlay">Light Overlay (increases dark contrast)</option>
                                        <option value="none">No Overlay (plain image)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '15px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="slide-dark-text" 
                                        checked={form.isDarkText} 
                                        onChange={e => setForm({ ...form, isDarkText: e.target.checked })} 
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--admin-accent)' }} 
                                    />
                                    <label htmlFor="slide-dark-text" style={{ fontSize: '0.85rem', color: 'var(--admin-text)', cursor: 'pointer' }}>
                                        Force Dark Font Color
                                    </label>
                                </div>
                            </div>

                            {msg && (
                                <div style={{ 
                                    padding: '12px 16px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.8rem', 
                                    background: msg.type === 'error' ? 'var(--admin-danger-bg)' : 'var(--admin-success-bg)', 
                                    color: msg.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)', 
                                    border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` 
                                }}>
                                    {msg.text}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || uploading}>
                                    {saving ? 'Saving...' : (form.id ? 'Save Slide Changes' : 'Initialize Slide')}
                                </button>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>

                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 700 }}>Live Slider Preview</div>
                        <div style={{
                            borderRadius: '14px',
                            overflow: 'hidden',
                            border: '1px solid var(--admin-border)',
                            position: 'relative',
                            minHeight: '340px',
                            background: '#111',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                        }}>
                            {form.bgImg && (
                                <div style={{
                                    backgroundImage: `url(${form.bgImg})`,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    zIndex: 0
                                }} />
                            )}
                            {form.overlayClass === 'dark-overlay' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1 }} />
                            )}
                            {form.overlayClass === 'light-overlay' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.45)', zIndex: 1 }} />
                            )}
                            
                            <div style={{ position: 'relative', zIndex: 2, padding: '30px' }}>
                                {form.pillText && (
                                    <span style={{ 
                                        display: 'inline-block',
                                        background: form.pillClass === 'badge-auto' ? '#3b82f6' : (form.pillClass === 'badge-moto' ? 'var(--admin-accent)' : 'rgba(255,255,255,0.1)'),
                                        color: '#fff',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        padding: '3px 9px',
                                        borderRadius: '10px',
                                        letterSpacing: '1px',
                                        marginBottom: '12px'
                                    }}>
                                        {form.pillText}
                                    </span>
                                )}
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 900,
                                    color: form.isDarkText ? '#111827' : '#ffffff',
                                    lineHeight: 1.15,
                                    marginBottom: '10px'
                                }} dangerouslySetInnerHTML={{ __html: form.title || 'Welcome Slide' }} />
                                
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: form.isDarkText ? '#374151' : '#d1d5db',
                                    lineHeight: 1.4,
                                    marginBottom: '20px',
                                    maxWidth: '300px'
                                }}>
                                    {form.desc || 'No description supplied. Add one in the text field.'}
                                </p>

                                <button type="button" style={{
                                    padding: '8px 18px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: form.buttonClass === 'btn-primary' ? 'var(--admin-accent)' : 'transparent',
                                    color: '#fff',
                                    border: form.buttonClass === 'btn-secondary' ? '2px solid rgba(255,255,255,0.4)' : 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>
                                    {form.buttonText || 'Shop Collection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Hero <span>Banner</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Customize landing page slideshow headers, high-res graphics, overlays, and button CTAs.
                    </p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New Slide</button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--admin-text-muted)', padding: '40px', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '2px' }}>LOADING SLIDES…</div>
            ) : heroSlides.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🖼️</div>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>No sliders custom seeded yet. Site currently runs on static defaults.</p>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: '20px' }} onClick={openCreate}>+ Create First Slide</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                    {heroSlides.map(slide => (
                        <div key={slide.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px' }}>
                            <div style={{
                                width: '100%',
                                height: '140px',
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.bgImg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '15px'
                            }}>
                                <div style={{ width: '100%' }}>
                                    <span style={{
                                        background: slide.pillClass === 'badge-auto' ? '#3b82f6' : 'var(--admin-accent)',
                                        color: '#fff',
                                        fontSize: '0.58rem',
                                        fontWeight: 800,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        textTransform: 'uppercase'
                                    }}>{slide.pillText || 'MOTO'}</span>
                                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '6px 0 0 0', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }} dangerouslySetInnerHTML={{ __html: slide.title }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', minHeight: '36px', lineBreak: 'anywhere' }}>
                                {slide.desc ? (slide.desc.substring(0, 100) + (slide.desc.length > 100 ? '...' : '')) : 'No description.'}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(slide)}>✎ Edit</button>
                                <button className="admin-btn admin-btn-outline admin-btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDelete(slide.id)}>✕ Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminHero;
