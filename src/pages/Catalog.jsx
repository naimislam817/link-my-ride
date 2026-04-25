import React, { useState, useEffect } from 'react';
import { categoriesContent } from '../data/siteContent';
import { useShop } from '../context/ShopContext';
import './Catalog.css';

const Catalog = () => {
    const { getProductsByCategory, loading, addToCart } = useShop();
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('?category=')) {
            const cat = hash.split('?category=')[1];
            setCategory(cat);
        } else {
            setCategory('all');
        }
        window.scrollTo(0, 0);
    }, []);

    const products = getProductsByCategory(category);

    return (
        <div className="catalog-page container section-padding animate-fade-in">
            <div className="catalog-header">
                <h1 className="catalog-title">OUR <span className="text-accent">CATALOG</span></h1>
                <p className="catalog-desc">Explore our full range of premium rider communication systems and smart accessories.</p>
            </div>

            <div className="catalog-filters">
                <button
                    className={`filter-btn ${category === 'all' ? 'active' : ''}`}
                    onClick={() => { setCategory('all'); window.location.hash = '#catalog'; }}
                >
                    ALL PRODUCTS
                </button>
                {categoriesContent.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${category === cat.id ? 'active' : ''}`}
                        onClick={() => { setCategory(cat.id); window.location.hash = `#catalog?category=${cat.id}`; }}
                    >
                        {cat.title.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="catalog-grid">
                {products.length > 0 ? products.map((product, i) => (
                    <div className="product-card" key={i}>
                        <div className="product-img-wrapper" onClick={() => window.location.hash = `#product/${product.id}`} style={{ cursor: 'pointer' }}>
                            {product.badge && <span className="product-badge">{product.badge}</span>}
                            <img src={product.image} alt={product.name} className="product-img" />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name" onClick={() => window.location.hash = `#product/${product.id}`} style={{ cursor: 'pointer' }}>{product.name}</h3>
                            <p className="product-desc">{product.description || product.desc}</p>
                            <div className="product-footer">
                                <span className="product-price">৳{product.price.toLocaleString()}</span>
                                <button onClick={() => addToCart(product)} className="cart-add-btn" aria-label="Add to cart" style={{ border: 'none', cursor: 'pointer' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="no-products">
                        <p>No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
