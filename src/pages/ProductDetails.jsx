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
    const { getProductById, getProductsByCategory, loading, products, addToCart, deliverySettings } = useShop();
    const [deliveryOption, setDeliveryOption] = useState('inside');
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [generatedInvoice, setGeneratedInvoice] = useState('');

    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

    // Review System States
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Fetch reviews from Supabase
    const fetchReviews = async (productId) => {
        try {
            setReviewsLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('approved', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Calculate rating details
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : '0.0';

    const renderStars = (rating) => {
        const fullStars = Math.round(Number(rating));
        return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);

        try {
            const reviewData = {
                product_id: product.id,
                customer_name: reviewForm.name,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            };

            const { error } = await supabase.from('reviews').insert([reviewData]);
            if (error) throw error;

            setReviewForm({ name: '', rating: 5, comment: '' });
            await fetchReviews(product.id);
            alert("Thank you! Your review has been submitted and is pending admin approval.");
        } catch (err) {
            console.error("Review Submit Error:", err);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Fetch reviews when product changes
    useEffect(() => {
        if (product?.id) {
            fetchReviews(product.id);
        }
    }, [product?.id]);

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

    const deliveryFee = deliveryOption === 'inside' ? deliverySettings.inside : deliverySettings.outside;
    const totalPayable = (product.price * quantity) + deliveryFee;

    // Get images — use images array, fall back to single image, ensure array
    let productImages = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
        productImages = product.images;
    } else if (product.image) {
        productImages = [product.image];
    } else if (product.images && typeof product.images === 'string') {
        try {
            productImages = JSON.parse(product.images);
            if (!Array.isArray(productImages)) productImages = [];
        } catch (e) {
            productImages = [];
        }
    }

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

            const { data, error } = await supabase.from('orders').insert([orderData]).select();
            if (error) throw error;

            const insertedOrder = data?.[0];
            const orderId = insertedOrder?.id || Math.floor(10000 + Math.random() * 90000);
            setGeneratedInvoice(`LMR-${String(orderId).padStart(5, '0')}`);

            setShowSuccess(true);
            // setTimeout(() => setShowSuccess(false), 5000); // Do not auto-close so they can see invoice
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
                    <div className="success-popup-content" style={{ padding: '40px', background: 'rgba(15, 17, 26, 0.95)', border: '1px solid rgba(0, 210, 255, 0.3)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)', maxWidth: '500px', width: '90%' }}>
                        <div style={{ width: '70px', height: '70px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid var(--accent-cyan)' }}>
                            <span className="success-icon" style={{ margin: 0, fontSize: '2.5rem' }}>✔️</span>
                        </div>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Order Confirmed!</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>We have received your order for {quantity}x {product.name}.</p>
                        
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', margin: '25px 0', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Invoice Number</div>
                            <div style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', fontWeight: 800, letterSpacing: '1px' }}>{generatedInvoice}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => setShowSuccess(false)} className="action-btn" style={{ flex: '1 1 120px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>CLOSE</button>
                            <a href="/" className="action-btn" style={{ flex: '1 1 120px', background: 'var(--accent-cyan)', color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>HOME</a>
                        </div>
                        
                        <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Need help? Call us at <a href="tel:+8801622864377" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>📞 +880 1622 864377</a>
                        </div>
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
                            {typeof product.name === 'string' ? product.name.split(' ').map((word, i) => {
                                if (i === 1) return <span key={i} className="text-accent"> {word} </span>;
                                return <em key={i}> {word} </em>;
                            }) : (product.name || 'Product Details')}
                        </h1>
                        <div className="product-rating">
                            <span className="stars" style={{ color: 'var(--accent-cyan)' }}>
                                {renderStars(totalReviews > 0 ? averageRating : 5)}
                            </span>
                            <span className="rating-text" style={{ cursor: 'pointer' }} onClick={() => {
                                const el = document.getElementById('reviews-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}>
                                {totalReviews > 0 ? `${averageRating} (${totalReviews} Review${totalReviews !== 1 ? 's' : ''})` : 'No reviews yet'}
                            </span>
                        </div>


                        <div className="product-features-grid">
                            {Array.isArray(product.features) && product.features.map((feat, i) => (
                                <div className="feature-box" key={i}>
                                    <span className="feature-val">{typeof feat === 'object' ? feat.val : ''}</span>
                                    <span className="feature-label">{typeof feat === 'object' ? feat.label : feat}</span>
                                </div>
                            ))}
                        </div>

                        {product.description && (
                            <div className="product-description-section" style={{ marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '25px' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Product Description
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Checkout Form */}
                <div className="checkout-sidebar animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="checkout-card">
                        <div className="price-header">
                            <span className="price-label">PRODUCT PRICE</span>
                            <div className="price-display">
                                <span className="current-price">{Number(product.price || 0).toLocaleString()} TK</span>
                                {product.old_price && <span className="old-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '1rem', marginLeft: '10px' }}>{Number(product.old_price).toLocaleString()} TK</span>}
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
                                        <span className="small">{deliverySettings.inside} TK</span>
                                    </div>
                                    <div
                                        className={`delivery-btn ${deliveryOption === 'outside' ? 'active' : ''}`}
                                        onClick={() => setDeliveryOption('outside')}
                                    >
                                        <span className="bold">Outside Dhaka</span>
                                        <span className="small">{deliverySettings.outside} TK</span>
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
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="action-btn cart-add-btn" onClick={() => addToCart(product, quantity)} style={{ flex: 1, background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold' }}>
                                    <span>🛒</span> ADD TO CART
                                </button>
                                <button type="submit" className="action-btn website-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                                    <span>🛍️</span> {isSubmitting ? 'SUBMITTING...' : 'BUY NOW'}
                                </button>
                            </div>
                        </form>

                    </div>

                    <div className="trust-badges">
                        <div className="trust-item"><span>✔️</span> ORIGINAL</div>
                        <div className="trust-item"><span>🚚</span> FAST DELIVERY</div>
                        <div className="trust-item"><span>🛡️</span> 1-YEAR WARRANTY</div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section id="reviews-section" className="product-reviews-section" style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="reviews-grid">
                    
                    {/* Left Column: Reviews List */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Customer Reviews ({totalReviews})
                        </h3>

                        {reviewsLoading ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No reviews yet for this product. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            <div className="reviews-list">
                                {reviews.map((rev) => (
                                    <div key={rev.id} className="review-card">
                                        <div className="review-card-header">
                                            <strong className="review-author">{rev.customer_name}</strong>
                                            <span className="review-stars">
                                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                            </span>
                                        </div>
                                        <p className="review-text">
                                            {rev.comment}
                                        </p>
                                        <div className="review-date">
                                            {new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Write a Review Form */}
                    <div>
                        <div className="review-form-card">
                            <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Share Your Experience
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '25px' }}>
                                Your feedback helps other riders choose the best gear.
                            </p>

                            <form onSubmit={handleReviewSubmit}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. John Doe" 
                                        value={reviewForm.name} 
                                        onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} 
                                        required 
                                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((stars) => (
                                            <button
                                                key={stars}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: stars })}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    fontSize: '1.8rem', 
                                                    color: stars <= reviewForm.rating ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)',
                                                    padding: 0,
                                                    transition: 'transform 0.1s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Review</label>
                                    <textarea 
                                        placeholder="What did you like or dislike? How does it perform?" 
                                        rows="4" 
                                        value={reviewForm.comment} 
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                                        required
                                        style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical' }}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className="action-btn website-btn" 
                                    disabled={submittingReview} 
                                    style={{ width: '100%', background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold', border: 'none' }}
                                >
                                    {submittingReview ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

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
                                    <div className="product-footer" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {p.old_price && (
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                                                    ৳{Number(p.old_price).toLocaleString()}
                                                </span>
                                            )}
                                            <span className="product-price">৳{Number(p.price || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <style>{`
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
                
                /* Review System Styling */
                .reviews-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                .reviews-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    max-height: 500px;
                    overflow-y: auto;
                    padding-right: 10px;
                }
                /* Custom elegant scrollbar for reviews list */
                .reviews-list::-webkit-scrollbar {
                    width: 6px;
                }
                .reviews-list::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 3px;
                }
                .reviews-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .reviews-list::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-cyan);
                }
                .review-card {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.2s ease;
                }
                .review-card:hover {
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(0, 210, 255, 0.15);
                }
                .review-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .review-author {
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                }
                .review-stars {
                    color: var(--accent-cyan);
                    font-size: 0.9rem;
                    letter-spacing: 2px;
                }
                .review-text {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    line-height: 1.6;
                    margin: 0 0 10px 0;
                }
                .review-date {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.35);
                }
                .review-form-card {
                    background: rgba(255, 255, 255, 0.01);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 30px;
                    backdrop-filter: blur(10px);
                }
                
                @media (max-width: 768px) {
                    .reviews-grid {
                        grid-template-columns: 1fr !important;
                        gap: 30px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
