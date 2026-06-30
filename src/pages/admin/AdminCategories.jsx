import React, { useState, useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const BUCKET_NAME = 'product-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const AdminCategories = () => {
    const { categories, refreshCategories, products, loadingCategories } = useShop();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleEdit = (category) => {
        setCurrentCategory({ ...category });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentCategory({
            id: '',
            title: '',
            subtitle: '',
            image: ''
        });
        setIsEditing(true);
    };

    const getProductCount = (categoryId) => {
        return products.filter(p => p.category === categoryId).length;
    };

    const handleDelete = async (category) => {
        const productCount = getProductCount(category.id);
        if (productCount > 0) {
            alert(`Cannot delete category "${category.title}". There are still ${productCount} product(s) assigned to this category. Please reassign or delete the products first.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the category "${category.title}"?`)) {
            const { error } = await supabase.from('categories').delete().eq('id', category.id);
            if (error) {
                alert(`Failed to delete: ${error.message}`);
            } else {
                refreshCategories();
            }
        }
    };

    // Slug generation utility
    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        // Only auto-generate slug if it's a new category
        if (!currentCategory.created_at) {
            setCurrentCategory({
                ...currentCategory,
                title,
                id: generateSlug(title)
            });
        } else {
            setCurrentCategory({
                ...currentCategory,
                title
            });
        }
    };

    // ── Image Upload ──────────────────────────────────────────
    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert(`"${file.name}" is not supported. Use JPG, PNG, or WebP.`);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert(`"${file.name}" is too large. Max 2MB allowed.`);
            return;
        }

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `categories/${fileName}`;

            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            setCurrentCategory(prev => ({
                ...prev,
                image: publicUrl
            }));
        } catch (err) {
            console.error("Image upload failed:", err);
            alert(`Image upload failed: ${err.message}`);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!currentCategory.id.trim()) {
            alert("Category ID / Slug is required.");
            return;
        }

        const payload = {
            id: currentCategory.id.trim().toLowerCase(),
            title: currentCategory.title.trim(),
            subtitle: currentCategory.subtitle?.trim() || null,
            image: currentCategory.image || null
        };

        // Check if creating a new category and slug already exists
        if (!currentCategory.created_at) {
            const exists = categories.some(c => c.id === payload.id);
            if (exists) {
                alert(`A category with ID/Slug "${payload.id}" already exists. Please choose a different title or custom ID.`);
                return;
            }
        }

        try {
            let error;
            if (currentCategory.created_at) {
                // Editing existing
                const { error: err } = await supabase
                    .from('categories')
                    .update({
                        title: payload.title,
                        subtitle: payload.subtitle,
                        image: payload.image
                    })
                    .eq('id', currentCategory.id);
                error = err;
            } else {
                // Creating new
                const { error: err } = await supabase
                    .from('categories')
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;

            setIsEditing(false);
            refreshCategories();
        } catch (err) {
            console.error("Save category failed:", err);
            alert(`Failed to save category: ${err.message}`);
        }
    };

    if (loadingCategories) return <div className="admin-loading">Loading Categories...</div>;

    if (isEditing) {
        return (
            <div className="admin-card animate-fade-in" style={{ maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '30px' }}>
                    {currentCategory.created_at ? 'UPDATE CATEGORY' : 'CREATE NEW CATEGORY'}
                </h2>
                <form onSubmit={handleSave} className="admin-form">
                    <div style={{ marginBottom: '20px' }}>
                        <label className="metric-label">Category Title</label>
                        <input 
                            type="text" 
                            className="admin-input" 
                            value={currentCategory.title || ''} 
                            onChange={handleTitleChange} 
                            placeholder="e.g. Smart Helmets" 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="metric-label">Category ID / Slug (URL Path)</label>
                        <input 
                            type="text" 
                            className="admin-input" 
                            value={currentCategory.id || ''} 
                            onChange={e => setCurrentCategory({ ...currentCategory, id: generateSlug(e.target.value) })} 
                            placeholder="e.g. smart-helmets" 
                            disabled={!!currentCategory.created_at} // Cannot change slug after creation to avoid breaking links
                            required 
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', display: 'block', marginTop: '4px' }}>
                            {currentCategory.created_at 
                                ? "Slug cannot be changed once created as it is used in links." 
                                : "This slug determines the page link (e.g., #catalog?category=slug)."}
                        </span>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="metric-label">Category Subtitle</label>
                        <input 
                            type="text" 
                            className="admin-input" 
                            value={currentCategory.subtitle || ''} 
                            onChange={e => setCurrentCategory({ ...currentCategory, subtitle: e.target.value })} 
                            placeholder="e.g. RIDE IN STYLE" 
                        />
                    </div>

                    {/* Image Uploader */}
                    <div style={{ marginBottom: '30px' }}>
                        <label className="metric-label">Category Banner Image</label>
                        {currentCategory.image ? (
                            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--admin-border)' }}>
                                <img src={currentCategory.image} alt="Category preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                    type="button" 
                                    className="image-remove-btn" 
                                    onClick={() => setCurrentCategory(prev => ({ ...prev, image: '' }))}
                                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                                >✕</button>
                            </div>
                        ) : (
                            <div 
                                className={`image-upload-zone ${dragOver ? 'drag-over' : ''} ${uploadingImage ? 'uploading' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => !uploadingImage && fileInputRef.current?.click()}
                                style={{ height: '140px' }}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                {uploadingImage ? (
                                    <div className="upload-zone-content">
                                        <span className="upload-icon">⏳</span>
                                        <span className="upload-text">Uploading image...</span>
                                    </div>
                                ) : (
                                    <div className="upload-zone-content">
                                        <span className="upload-icon">📁</span>
                                        <span className="upload-text">Click or drag banner image to upload</span>
                                        <span className="upload-hint">JPG, PNG, WebP &bull; Max 2MB</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button type="submit" className="admin-btn admin-btn-primary">SAVE CATEGORY</button>
                        <button type="button" className="admin-btn admin-btn-outline" onClick={() => setIsEditing(false)}>CANCEL</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="admin-categories animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">PRODUCT <span>CATEGORIES</span></h1>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                        Manage product taxonomy, dynamic homepage navigation grids, and catalog filters
                    </p>
                </div>
                <button onClick={handleCreate} className="admin-btn admin-btn-primary">+ NEW CATEGORY</button>
            </div>

            <div className="admin-card">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Banner</th>
                                <th>Category Name</th>
                                <th>Slug / URL Key</th>
                                <th>Subtitle</th>
                                <th style={{ textAlign: 'center' }}>Products Count</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-text-muted)' }}>
                                        No categories found. Click "+ New Category" to create one.
                                    </td>
                                </tr>
                            ) : (
                                categories.map(category => (
                                    <tr key={category.id}>
                                        <td>
                                            <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#2D2D2D', border: '1px solid var(--admin-border)' }}>
                                                {category.image ? (
                                                    <img src={category.image} alt={category.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#666' }}>📁</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'white' }}>{category.title}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--admin-accent)' }}>
                                                {category.id}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                                                {category.subtitle || '—'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                fontFamily: "'JetBrains Mono', monospace", 
                                                background: getProductCount(category.id) > 0 ? 'rgba(79,142,247,0.1)' : 'rgba(255,255,255,0.03)',
                                                color: getProductCount(category.id) > 0 ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.78rem',
                                                border: getProductCount(category.id) > 0 ? '1px solid rgba(79,142,247,0.2)' : '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {getProductCount(category.id)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button 
                                                    className="admin-btn admin-btn-outline admin-btn-sm" 
                                                    onClick={() => handleEdit(category)}
                                                    style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="admin-btn admin-btn-outline admin-btn-sm" 
                                                    onClick={() => handleDelete(category)}
                                                    style={{ 
                                                        padding: '4px 10px', 
                                                        fontSize: '0.72rem', 
                                                        color: '#ef4444', 
                                                        borderColor: 'rgba(239, 68, 68, 0.2)' 
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
