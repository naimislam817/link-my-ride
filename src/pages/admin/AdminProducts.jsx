import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';

const AdminProducts = () => {
    const { products, refreshProducts, loading } = useShop();
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({});

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentProduct({
            name: '',
            price: 0,
            image: '',
            category: 'accessories',
            description: '',
            is_active: true,
            badge: '',
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

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Ensure specs and features are valid JSON arrays for Supabase if they are being edited as strings.
        let specsToSave = currentProduct.specs;
        let featuresToSave = currentProduct.features;
        
        if (typeof specsToSave === 'string') {
            try { specsToSave = specsToSave.split(',').map(s => s.trim()); } catch(e) { specsToSave = []; }
        }
        
        // For features, it might be complex JSON. We assume it's valid if string, else we keep the array.
        // For a full implementation, you'd want proper nested inputs.
        
        const payload = {
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            category: currentProduct.category,
            description: currentProduct.description,
            is_active: currentProduct.is_active,
            // badge is not in DB originally, we might need a migration or skip it.
            specs: specsToSave,
            features: featuresToSave
        };

        if (currentProduct.id) {
            // Update
            const { error } = await supabase.from('products').update(payload).eq('id', currentProduct.id);
            if(error) alert('Failed to update');
        } else {
            // Insert
            const { error } = await supabase.from('products').insert([payload]);
            if(error) alert('Failed to create');
        }
        
        setIsEditing(false);
        refreshProducts();
    };


    if (loading) return <div>Loading products...</div>;

    if (isEditing) {
        return (
            <div>
                <h2>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '600px', marginTop: '20px' }}>
                    <div>
                        <label>Product Name</label>
                        <input type="text" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Price (TK)</label>
                            <input type="number" value={currentProduct.price || 0} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Category</label>
                            <select value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }}>
                                <option value="communicators">Communicators</option>
                                <option value="dashcams">Dashcams</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label>Image URL or Path</label>
                        <input type="text" value={currentProduct.image || ''} onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div>
                        <label>Description (Bio)</label>
                        <textarea rows="4" value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }}></textarea>
                    </div>
                    <div>
                        <label>Specs (comma separated)</label>
                        <input type="text" value={Array.isArray(currentProduct.specs) ? currentProduct.specs.join(', ') : currentProduct.specs} onChange={e => setCurrentProduct({...currentProduct, specs: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button type="submit" className="btn btn-primary">Save Product</button>
                        <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Products Management</h2>
                <button onClick={handleCreate} className="btn btn-primary">+ Add Product</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '12px', width: '60px' }}>Image</th>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Category</th>
                            <th style={{ padding: '12px' }}>Price</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: product.is_active ? 1 : 0.5 }}>
                                <td style={{ padding: '12px' }}>
                                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '12px' }}>{product.name}</td>
                                <td style={{ padding: '12px' }}>{product.category}</td>
                                <td style={{ padding: '12px' }}>৳{Number(product.price).toLocaleString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <button 
                                        onClick={() => toggleActive(product.id, product.is_active)}
                                        style={{ 
                                            background: product.is_active ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                                            color: product.is_active ? '#2ecc71' : '#e74c3c',
                                            border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                                        }}
                                    >
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleEdit(product)} style={{ background: 'transparent', color: 'var(--accent-cyan)', border: 'none', marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(product.id)} style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
