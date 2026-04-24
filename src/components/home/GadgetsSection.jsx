import React from 'react';
import './GadgetsSection.css';
import { useShop } from '../../context/ShopContext';

const GadgetsSection = () => {
    const { getFeaturedProducts } = useShop();
    const products = getFeaturedProducts();

    return (
        <section className="gadgets-section container section-padding">
            <div className="section-header">
                <h2 className="section-title">TOP TECH GADGETS</h2>
                <a href="#catalog" className="view-all-link">COMPARE MODELS</a>
            </div>

            <div className="gadgets-grid">
                {products.map((product, i) => (
                    <div className="product-card reveal" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                        <div className="product-img-wrapper" onClick={() => window.location.hash = `#product/${product.id}`} style={{ cursor: 'pointer' }}>
                            <span className="product-badge">{product.badge}</span>
                            <img src={product.image} alt={product.name} className="product-img" />
                        </div>
                        <div className="product-info">
                            <h3 className="product-name" onClick={() => window.location.hash = `#product/${product.id}`} style={{ cursor: 'pointer' }}>{product.name}</h3>
                            {/* <p className="product-desc">{product.description || product.desc}</p> */}
                            <div className="product-specs">
                                {product.specs.map((spec, j) => (
                                    <span className="spec-tag" key={j}>{spec}</span>
                                ))}
                            </div>
                            <div className="product-footer">
                                <span className="product-price">৳{product.price.toLocaleString()}</span>
                                <a href={`#product/${product.id}`} className="cart-add-btn" aria-label="Add to cart">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GadgetsSection;
