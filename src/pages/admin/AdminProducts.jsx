import React, { useState, useRef, useCallback } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_NAME = 'product-images';

const AdminProducts = () => {
    const { products, refreshProducts, loading, categories } = useShop();
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({});
    const [uploadingImages, setUploadingImages] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [draggedThumbIdx, setDraggedThumbIdx] = useState(null);
    const fileInputRef = useRef(null);

    const handleEdit = (product) => {
        setCurrentProduct({
            ...product,
            images: product.images || (product.image ? [product.image] : [])
        });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentProduct({
            name: '',
            price: '',
            image: '',
            images: [],
            category: 'accessories',
            description: '',
            is_active: true,
            badge: '',
            stock: 0,
            specs: [],
            features: []
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if(error) alert('Failed to delete');
            else refreshProducts();
        }
    };

    const toggleActive = async (id, currentStatus) => {
        const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
        if(error) alert('Failed to update status');
        else refreshProducts();
    };

    // ── Image Upload Logic ──────────────────────────────────────
    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `"${file.name}" is not supported. Use JPG, PNG, or WebP.`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`;
        }
        return null;
    };

    const uploadFiles = async (files) => {
        const currentImages = currentProduct.images || [];
        const slotsAvailable = MAX_IMAGES - currentImages.length;

        if (slotsAvailable <= 0) {
            alert(`Maximum ${MAX_IMAGES} images allowed.`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, slotsAvailable);
        const errors = [];

        for (const file of filesToUpload) {
            const err = validateFile(file);
            if (err) errors.push(err);
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        setUploadingImages(true);
        const newUrls = [];

        for (const file of filesToUpload) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) {
                console.error('Upload error:', error);
                if (error.message.includes('Bucket not found')) {
                    alert(`Upload Failed: The storage bucket "${BUCKET_NAME}" does not exist in Supabase.\n\nPlease create a public bucket named "${BUCKET_NAME}" in your Supabase dashboard.`);
                } else {
                    alert(`Failed to upload "${file.name}": ${error.message}`);
                }
                continue;
            }

            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (urlData?.publicUrl) {
                newUrls.push(urlData.publicUrl);
            }
        }

        setCurrentProduct(prev => ({
            ...prev,
            images: [...(prev.images || []), ...newUrls],
            image: prev.images?.length === 0 && newUrls.length > 0 ? newUrls[0] : prev.image
        }));

        setUploadingImages(false);
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            uploadFiles(e.target.files);
        }
        e.target.value = '';
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    }, [currentProduct.images]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const removeImage = (index) => {
        setCurrentProduct(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                image: newImages.length > 0 ? newImages[0] : ''
            };
        });
    };

    // ── Thumbnail Drag Reorder ──────────────────────────────────
    const handleThumbDragStart = (idx) => {
        setDraggedThumbIdx(idx);
    };

    const handleThumbDragOver = (e, idx) => {
        e.preventDefault();
        if (draggedThumbIdx === null || draggedThumbIdx === idx) return;
        
        setCurrentProduct(prev => {
            const newImages = [...prev.images];
            const [removed] = newImages.splice(draggedThumbIdx, 1);
            newImages.splice(idx, 0, removed);
            setDraggedThumbIdx(idx);
            return { ...prev, images: newImages, image: newImages[0] || '' };
        });
    };

    const handleThumbDragEnd = () => {
        setDraggedThumbIdx(null);
    };

    // ── Save Product ────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        
        let specsToSave = currentProduct.specs;
        let featuresToSave = currentProduct.features;
        
        if (typeof specsToSave === 'string') {
            try { specsToSave = specsToSave.split(',').map(s => s.trim()); } catch(e) { specsToSave = []; }
        }

        const images = currentProduct.images || [];
        
        const payload = {
            name: currentProduct.name,
            price: Number(currentProduct.price) || 0,
            old_price: currentProduct.old_price || null,
            image: images.length > 0 ? images[0] : currentProduct.image,
            images: JSON.stringify(images),
            category: currentProduct.category,
            description: currentProduct.description,
            is_active: currentProduct.is_active,
            badge: currentProduct.badge || null,
            stock: Number(currentProduct.stock) || 0,
            specs: JSON.stringify(specsToSave || []),
            features: JSON.stringify(featuresToSave || [])
        };

        if (currentProduct.id) {
            const { error } = await supabase.from('products').update(payload).eq('id', currentProduct.id);
            if(error) alert(`Failed to update: ${error.message}`);
        } else {
            const { error } = await supabase.from('products').insert([payload]);
            if(error) alert(`Failed to create: ${error.message}`);
        }
        
        setIsEditing(false);
        refreshProducts();
    };

    if (loading) return <div className="admin-loading">Configuring Product Stream...</div>;

    if (isEditing) {
        const images = currentProduct.images || [];

        return (
            <div className="admin-card animate-fade-in" style={{ maxWidth: '800px' }}>
                <h2 style={{ marginBottom: '30px' }}>{currentProduct.id ? 'UPDATE SYSTEM ENTITY' : 'INITIALIZE NEW PRODUCT'}</h2>
                <form onSubmit={handleSave} className="admin-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="metric-label">Product Name</label>
                            <input type="text" className="admin-input" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="metric-label">Category</label>
                            <select className="admin-input" value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="metric-label">Market Price (TK)</label>
                            <input type="number" className="admin-input" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required />
                        </div>
                        <div>
                            <label className="metric-label">Old Price (TK) — optional</label>
                            <input type="number" className="admin-input" value={currentProduct.old_price || ''} onChange={e => setCurrentProduct({...currentProduct, old_price: Number(e.target.value) || null})} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="metric-label">Stock Level</label>
                            <input type="number" className="admin-input" value={currentProduct.stock || 0} onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} min="0" required />
                        </div>
                        <div>
                            <label className="metric-label">Identity Badge</label>
                            <input type="text" className="admin-input" value={currentProduct.badge || ''} onChange={e => setCurrentProduct({...currentProduct, badge: e.target.value})} placeholder="e.g. NEW, SALE" />
                        </div>
                    </div>

                    {/* ── Image Upload Zone ────────────────────────── */}
                    <div style={{ marginBottom: '20px' }}>
                        <label className="metric-label">Product Images ({images.length}/{MAX_IMAGES})</label>

                        {images.length > 0 && (
                            <div className="image-preview-grid">
                                {images.map((url, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`image-preview-item ${draggedThumbIdx === idx ? 'dragging' : ''}`}
                                        draggable
                                        onDragStart={() => handleThumbDragStart(idx)}
                                        onDragOver={(e) => handleThumbDragOver(e, idx)}
                                        onDragEnd={handleThumbDragEnd}
                                    >
                                        {idx === 0 && <span className="main-image-badge">MAIN</span>}
                                        <img src={url} alt={`Product ${idx + 1}`} />
                                        <button 
                                            type="button" 
                                            className="image-remove-btn" 
                                            onClick={() => removeImage(idx)}
                                            title="Remove image"
                                        >✕</button>
                                        <span className="image-order-badge">{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < MAX_IMAGES && (
                            <div 
                                className={`image-upload-zone ${dragOver ? 'drag-over' : ''} ${uploadingImages ? 'uploading' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !uploadingImages && fileInputRef.current?.click()}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.webp"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                {uploadingImages ? (
                                    <div className="upload-zone-content">
                                        <span className="upload-icon">⏳</span>
                                        <span className="upload-text">Uploading...</span>
                                    </div>
                                ) : (
                                    <div className="upload-zone-content">
                                        <span className="upload-icon">📁</span>
                                        <span className="upload-text">
                                            Drag & drop or click to upload
                                        </span>
                                        <span className="upload-hint">
                                            JPG, PNG, WebP &bull; Max 2MB each &bull; Up to {MAX_IMAGES - images.length} more
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="metric-label">Entity Description</label>
                        <textarea className="admin-input" rows="4" value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <label className="metric-label">Status</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                <input type="checkbox" checked={currentProduct.is_active} onChange={e => setCurrentProduct({...currentProduct, is_active: e.target.checked})} />
                                <span style={{ fontSize: '0.9rem' }}>Active in System</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="admin-btn admin-btn-primary">SAVE CHANGES</button>
                        <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditing(false)}>CANCEL</button>
                    </div>
                </form>
            </div>
        );
    }

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;

    return (
        <div className="admin-products animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">PRODUCT <span>INVENTORY</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Manage your catalog, stock levels, and product media
                    </p>
                </div>
                <button onClick={handleCreate} className="admin-btn admin-btn-primary">+ NEW ASSET</button>
            </div>

            {/* ── Quick Stats ───────────────────────────────── */}
            <div className="orders-stats-grid" style={{ marginBottom: '24px' }}>
                {[
                    { label: 'Total Products', value: totalProducts, color: 'var(--admin-accent)' },
                    { label: 'Active', value: activeProducts, color: 'var(--admin-success)' },
                    { label: 'Out of Stock', value: outOfStock, color: outOfStock > 0 ? 'var(--admin-danger)' : 'var(--admin-text-muted)' },
                    { label: 'Low Stock (< 5)', value: lowStock, color: lowStock > 0 ? 'var(--admin-warning)' : 'var(--admin-text-muted)' },
                ].map((s, i) => (
                    <div key={i} className="admin-card" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Images</th>
                                <th>Stream Status</th>
                                <th>Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} style={{ opacity: product.is_active ? 1 : 0.4 }}>
                                    <td>
                                        <img src={product.images?.[0] || product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text-muted)' }}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--admin-accent)', fontWeight: 700 }}>৳{Number(product.price).toLocaleString()}</td>
                                    <td>
                                        <span className="status-badge" style={{ 
                                            background: (product.stock || 0) === 0 ? 'rgba(239,68,68,0.1)' : ((product.stock || 0) <= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'), 
                                            color: (product.stock || 0) === 0 ? 'var(--admin-danger)' : ((product.stock || 0) <= 5 ? 'var(--admin-warning)' : 'var(--admin-success)') 
                                        }}>
                                            {product.stock || 0} unit{product.stock !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--admin-accent)' }}>
                                            {product.images?.length || 1} img
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => toggleActive(product.id, product.is_active)}
                                            className={`status-badge ${product.is_active ? 'status-completed' : 'status-cancelled'}`}
                                            style={{ cursor: 'pointer', border: 'none' }}
                                        >
                                            {product.is_active ? 'ONLINE' : 'OFFLINE'}
                                        </button>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleEdit(product)} className="admin-btn admin-btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>EDIT</button>
                                            <button onClick={() => handleDelete(product.id)} className="admin-btn admin-btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--admin-danger)' }}>ERASE</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
