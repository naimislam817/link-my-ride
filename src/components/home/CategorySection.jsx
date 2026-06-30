import React from 'react';
import './CategorySection.css';
import { useShop } from '../../context/ShopContext';

const CategorySection = () => {
    const { categories, loadingCategories } = useShop();

    if (loadingCategories) {
        return (
            <section className="container section-padding">
                <div className="section-header">
                    <h2 className="section-title">SHOP BY <span className="text-accent">CATEGORY</span></h2>
                </div>
                <div className="category-grid">
                    {[1, 2, 3].map((n) => (
                        <div className="category-card" key={n} style={{ height: '240px', background: '#f4f4f4', borderRadius: '8px', opacity: 0.5 }}></div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="container section-padding">
            <div className="section-header">
                <h2 className="section-title">SHOP BY <span className="text-accent">CATEGORY</span></h2>
                <a href="#catalog" className="view-all-link">VIEW ALL PRODUCTS</a>
            </div>

            <div className="category-grid">
                {categories.map((cat, i) => (
                    <div className="category-card reveal" key={cat.id} onClick={() => window.location.hash = `#catalog?category=${cat.id}`} style={{ transitionDelay: `${i * 100}ms` }}>
                        <div className="category-img-wrapper">
                            {cat.image ? (
                                <img src={cat.image} alt={cat.title} className="category-img" />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#2D2D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#666', fontFamily: "'Oswald', sans-serif" }}>📁 {cat.title.toUpperCase()}</div>
                            )}
                        </div>
                        <div className="category-overlay"></div>
                        <div className="category-content">
                            <span className="category-subtitle">{cat.subtitle || 'DISCOVER'}</span>
                            <h3 className="category-title">{cat.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
