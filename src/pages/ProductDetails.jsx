import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    useEffect(() => {
        const loadProduct = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#product/')) {
                const id = hash.replace('#product/', '');
                const foundProduct = products.find(p => String(p.id) === String(id));
                
                if (foundProduct) {
                    setProduct(foundProduct);
                    setThumbsSwiper(null);
                    const rel = products.filter(p => String(p.id) !== String(id) && p.category === foundProduct.category).slice(0, 4);
                    setRelatedProducts(rel);
                    window.scrollTo(0, 0);
                }
            }
        };

        loadProduct();
        window.addEventListener('hashchange', loadProduct);
        return () => window.removeEventListener('hashchange', loadProduct);
    }, [products, window.location.hash]);

    if (loading || !product) return <div className="container section-padding">Loading...</div>;

    const deliveryFee = deliveryOption === 'inside' ? 60 : 100;
    const totalPayable = (product.price * quantity) + deliveryFee;

    // Get images — use images array, fall back to single image
    const productImages = product.images && product.images.length > 0 
        ? product.images 
        : (product.image ? [product.image] : []);

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

    const handleWebsiteOrder = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const orderData = {
                customer_name: formData.name,
                customer_email: 'website-order@no-email.com',
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
                <div className="product-showcase animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="product-img-box">
                        {product.badge && <span className="badge new-arrival-badge">{product.badge}</span>}
                        
                        {productImages.length <= 1 ? (
                            /* Single image — no slider */
                            <img src={productImages[0]} alt={product.name} />
                        ) : (
                            /* Multiple images — Swiper slider */
                            <div className="product-slider-wrapper">
                                <Swiper
                                    modules={[Navigation, Pagination, Thumbs, FreeMode]}
                                    navigation
                                    pagination={{ clickable: true }}
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    loop={productImages.length > 2}
                                    className="product-main-slider"
                                >
                                    {productImages.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <img src={img} alt={`${product.name} - ${idx + 1}`} className="slider-main-img" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip — only when multiple images */}
                    {productImages.length > 1 && (
                        <Swiper
                            modules={[FreeMode, Thumbs]}
                            onSwiper={setThumbsSwiper}
                            spaceBetween={10}
                            slidesPerView={Math.min(productImages.length, 5)}
                            freeMode
                            watchSlidesProgress
                            className="product-thumb-slider"
                        >
                            {productImages.map((img, idx) => (
                                <SwiperSlide key={idx}>
                                    <img src={img} alt={`Thumb ${idx + 1}`} className="slider-thumb-img" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}

                    <div className="product-main-info">
                        <h1 className="product-title">
                            {product.name ? product.name.split(' ').map((word, i) => {
                                if (i === 1) return <span key={i} className="text-accent"> {word} </span>;
                                return <em key={i}> {word} </em>;
                            }) : 'Product Details'}
                        </h1>
                        <div className="product-rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-text">4.9 (248 Reviews)</span>
                        </div>
                        <p className="product-description">
                            {product.description || product.desc}
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
                <div className="checkout-sidebar animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="checkout-card">
                        <div className="price-header">
                            <span className="price-label">PRODUCT PRICE</span>
                            <div className="price-display">
                                <span className="current-price">{product.price?.toLocaleString()} TK</span>
                                {product.old_price && <span className="old-price">{product.old_price?.toLocaleString()} TK</span>}
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
                                    <img src={p.images?.[0] || p.image} alt={p.name} className="product-img" />
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
