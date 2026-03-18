import React, { useState, useEffect } from 'react';
import './ProductDetails.css';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';
import '../components/home/GadgetsSection.css';

const ProductDetails = () => {
    const { getProductById, getProductsByCategory, loading, products } = useShop();
    const [deliveryOption, setDeliveryOption] = useState('inside');
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Form states
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#product/')) {
            const id = hash.replace('#product/', '');
            const foundProduct = getProductById(id);
            if (foundProduct) {
                setProduct(foundProduct);
                
                // Fetch related featured products
                const categoryProducts = getProductsByCategory(foundProduct.category);
                const related = categoryProducts.filter(p => p.id !== foundProduct.id && p.featured).slice(0, 4);
                setRelatedProducts(related);

                window.scrollTo(0, 0);
                return;
            }
        }
        // Fallback
        setProduct(products[0]);
    }, [products]);

    if (loading || !product) return <div className="container section-padding">Loading...</div>;

    const deliveryFee = deliveryOption === 'inside' ? 60 : 100;
    const totalPayable = (product.price * quantity) + deliveryFee;

    const handleQuantityChange = (amount) => {
        setQuantity(prev => {
            const newQ = prev + amount;
            return newQ < 1 ? 1 : newQ;
        });
    };

    const handleWhatsAppOrder = () => {
        const message = `Hello LinkMyRide! I want to order:\n\nProduct: *${product.name}*\nQuantity: *${quantity}*\nDelivery: *${deliveryOption === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}*\nTotal Price payable: *${totalPayable} TK*\n\nPlease confirm my order.`;
        const waLink = `https://wa.me/8801622864377?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWebsiteOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const orderData = {
                customer_name: formData.name,
                customer_email: 'website-order@no-email.com', // Placeholder or add email field
                customer_phone: formData.phone,
                customer_address: formData.address,
                total_amount: totalPayable,
                items: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity
                }],
                status: 'pending'
            };

            const { error } = await supabase.from('orders').insert([orderData]);
            if (error) throw error;

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
            setFormData({ name: '', address: '', phone: '' });
            setQuantity(1);
        } catch (err) {
            console.error("Order Error:", err);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="product-page container section-padding">
            {showSuccess && (
                <div className="success-popup animate-fade-in">
                    <div className="success-popup-content">
                        <span className="success-icon">✔️</span>
                        <h3>Order Submitted Successfully!</h3>
                        <p>We have received your order for {quantity}x {product.name}. Our team will contact you shortly.</p>
                        <button onClick={() => setShowSuccess(false)} className="btn btn-primary" style={{ marginTop: '15px' }}>DONE</button>
                    </div>
                </div>
            )}

            <div className="product-layout animate-fade-in">

                {/* Left Side: Product Image & Info */}
                <div className="product-showcase reveal">
                    <div className="product-img-box">
                        {product.badge && <span className="badge new-arrival-badge">{product.badge}</span>}
                        <img
                            src={product.image}
                            alt={product.name}
                        />
                    </div>

                    <div className="product-main-info">
                        <h1 className="product-title">
                            {product.name.split(' ').map((word, i) => {
                                if (i === 1) return <span key={i} className="text-accent"> {word} </span>;
                                return <em key={i}> {word} </em>;
                            })}
                        </h1>
                        <div className="product-rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-text">4.9 (248 Reviews)</span>
                        </div>
                        <p className="product-description">
                            {product.desc}
                        </p>

                        <div className="product-features-grid">
                            {product.features && product.features.map((feat, i) => (
                                <div className="feature-box" key={i}>
                                    <span className="feature-val">{feat.val}</span>
                                    <span className="feature-label">{feat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Checkout Form */}
                <div className="checkout-sidebar reveal">
                    <div className="checkout-card">
                        <div className="price-header">
                            <span className="price-label">PRODUCT PRICE</span>
                            <div className="price-display">
                                <span className="current-price">{product.price.toLocaleString()} TK</span>
                                {product.oldPrice && <span className="old-price">{product.oldPrice.toLocaleString()} TK</span>}
                            </div>
                        </div>

                        <form className="checkout-form" onSubmit={handleWebsiteOrder}>

                            <div className="form-group quantity-group">
                                <label>QUANTITY</label>
                                <div className="quantity-selector">
                                    <button type="button" onClick={() => handleQuantityChange(-1)} className="qty-btn">-</button>
                                    <span className="qty-display">{quantity}</span>
                                    <button type="button" onClick={() => handleQuantityChange(1)} className="qty-btn">+</button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>FULL NAME</label>
                                <input type="text" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>DELIVERY ADDRESS</label>
                                <textarea placeholder="House #, Street, Thana, City" rows="3" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required></textarea>
                            </div>
                            <div className="form-group">
                                <label>PHONE NUMBER</label>
                                <input type="tel" placeholder="+880 1XXX-XXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>

                            <div className="form-group">
                                <label>DELIVERY OPTION</label>
                                <div className="delivery-options">
                                    <div
                                        className={`delivery-btn ${deliveryOption === 'inside' ? 'active' : ''}`}
                                        onClick={() => setDeliveryOption('inside')}
                                    >
                                        <span className="bold">Inside Dhaka</span>
                                        <span className="small">60 TK</span>
                                    </div>
                                    <div
                                        className={`delivery-btn ${deliveryOption === 'outside' ? 'active' : ''}`}
                                        onClick={() => setDeliveryOption('outside')}
                                    >
                                        <span className="bold">Outside Dhaka</span>
                                        <span className="small">100 TK</span>
                                    </div>
                                </div>
                                <p className="delivery-note">Inside Dhaka delivery is free from advance payment.</p>
                            </div>

                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Product Total ({quantity}x)</span>
                                    <span>{(product.price * quantity).toLocaleString()} TK</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span className="text-accent">+{deliveryFee} TK</span>
                                </div>
                                <div className="summary-row total-row">
                                    <span>TOTAL PAYABLE</span>
                                    <span className="total-price text-accent">
                                        {totalPayable.toLocaleString()} TK
                                    </span>
                                </div>
                            </div>

                            <button type="button" className="action-btn whatsapp-btn" onClick={handleWhatsAppOrder}>
                                <span>💬</span> ORDER ON WHATSAPP
                            </button>
                            <button type="submit" className="action-btn website-btn" disabled={isSubmitting}>
                                <span>🛍️</span> {isSubmitting ? 'SUBMITTING...' : 'ORDER NOW (WEBSITE)'}
                            </button>
                        </form>

                    </div>

                    <div className="trust-badges">
                        <div className="trust-item"><span>✔️</span> ORIGINAL</div>
                        <div className="trust-item"><span>🚚</span> FAST DELIVERY</div>
                        <div className="trust-item"><span>🛡️</span> 1-YEAR WARRANTY</div>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className="related-products-section" style={{ marginTop: '80px' }}>
                    <div className="section-header" style={{ marginBottom: '30px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
                        <h2 className="section-title" style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Related Products</h2>
                    </div>

                    <div className="gadgets-grid">
                        {relatedProducts.map((p, i) => (
                            <div className="product-card" key={i} onClick={() => window.location.hash = `#product/${p.id}`} style={{ cursor: 'pointer' }}>
                                <div className="product-img-wrapper">
                                    {p.badge && <span className="product-badge">{p.badge}</span>}
                                    <img src={p.image} alt={p.name} className="product-img" />
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{p.name}</h3>
                                    <p className="product-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.desc}</p>
                                    <div className="product-footer" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                                        <span className="product-price">৳{p.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <style jsx>{`
                .success-popup {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(11, 15, 25, 0.9);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .success-popup-content {
                    background: var(--bg-secondary);
                    padding: 40px;
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--accent-green);
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }
                .success-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 20px;
                }
                .success-popup-content h3 {
                    font-size: 1.5rem;
                    color: var(--accent-green);
                    margin-bottom: 10px;
                }
                .success-popup-content p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }
                .quantity-selector {
                    display: flex;
                    align-items: center;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                    width: fit-content;
                }
                .qty-btn {
                    background: transparent;
                    color: var(--text-primary);
                    padding: 10px 20px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    transition: var(--transition);
                }
                .qty-btn:hover {
                    background: rgba(0, 210, 255, 0.1);
                    color: var(--accent-cyan);
                }
                .qty-display {
                    padding: 0 20px;
                    font-weight: bold;
                    font-size: 1.1rem;
                    border-left: 1px solid var(--border-color);
                    border-right: 1px solid var(--border-color);
                }
                .quantity-group {
                    margin-bottom: 20px;
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
