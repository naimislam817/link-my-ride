import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';
import { trackInitiateCheckout, trackPurchase } from '../lib/fbPixel';

const Checkout = () => {
    const { cart, clearCart } = useShop();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [invoiceNumber, setInvoiceNumber] = useState('');

    // Fire InitiateCheckout when user lands on checkout page
    useEffect(() => {
        if (cart.length > 0) {
            trackInitiateCheckout(cart, total);
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        
        setStatus('submitting');
        const invId = Math.floor(10000 + Math.random() * 90000);
        const invoiceNum = String(invId);
        
        try {
            const orderData = {
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                customer_address: formData.address,
                total_amount: total,
                items: cart,
                status: 'pending',
                invoice_number: invoiceNum
            };

            let { error } = await supabase.from('orders').insert([orderData]);
            
            if (error && (error.code === 'PGRST204' || String(error.message).includes('invoice_number'))) {
                // Fallback for when the SQL migration hasn't been run yet
                const { invoice_number, ...fallbackData } = orderData;
                const retryResult = await supabase.from('orders').insert([fallbackData]);
                if (retryResult.error) throw retryResult.error;
            } else if (error) {
                throw error;
            }
            
            setInvoiceNumber(`LMR-${invoiceNum}`);
            clearCart();
            setStatus('success');
            // Fire Purchase event on successful order
            trackPurchase(`LMR-${invoiceNum}`, total, cart);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="container section-padding animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="success-glass-card">
                    <div style={{ width: '76px', height: '76px', background: '#FFF3EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #E85000' }}>
                        <span style={{ fontSize: '2.8rem' }}>✔️</span>
                    </div>
                    <h2 style={{ fontFamily: "'Oswald', sans-serif", color: '#1A1A1A', fontSize: '2rem', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Order Confirmed!</h2>
                    <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#555555', fontSize: '1rem', marginBottom: '28px' }}>Your order has been successfully placed and is being processed.</p>
                    
                    <div style={{ background: '#F4F4F4', padding: '20px', borderRadius: 'var(--radius-sm)', marginBottom: '32px', display: 'inline-block', textAlign: 'left', minWidth: '240px' }}>
                        <div style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.82rem', color: '#999999', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoice Number</div>
                        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', color: '#E85000', fontWeight: 700, letterSpacing: '3px' }}>{invoiceNumber}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 10px' }}>
                        <a href="/" className="modern-submit-btn success-action-btn" style={{ textDecoration: 'none', background: '#1A1A1A', border: '1px solid #1A1A1A' }}>
                            <span className="btn-content">🏠 BACK TO HOME</span>
                        </a>
                        <a href="#catalog" className="modern-submit-btn success-action-btn" style={{ textDecoration: 'none' }}>
                            <span className="btn-content">🛒 CONTINUE SHOPPING</span>
                        </a>
                    </div>
                    
                    <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #E0E0E0', fontFamily: "'Open Sans', sans-serif", fontSize: '0.88rem', color: '#555555' }}>
                        Need help? Call us at <a href="tel:+8801622864377" style={{ color: '#E85000', textDecoration: 'none', fontWeight: 600 }}>📞 +880 1622 864377</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page container section-padding animate-fade-in" style={{ minHeight: '80vh' }}>
            <div className="checkout-header">
                <h1 className="catalog-title">SECURE <span className="text-accent">CHECKOUT</span></h1>
                <p className="catalog-desc">Complete your order details below to finalize your purchase.</p>
            </div>

            {cart.length === 0 ? (
                <div className="empty-checkout">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🛒</span>
                    <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1.1rem', color: '#555555' }}>Your cart is empty.</p>
                    <a href="#catalog" className="btn btn-primary" style={{ marginTop: '20px' }}>Return to Shop</a>
                </div>
            ) : (
                <div className="checkout-grid">
                    {/* Left: Form */}
                    <div className="checkout-form-container">
                        <form onSubmit={handleSubmit} className="checkout-form">
                            <h3 className="section-subtitle">Shipping Details</h3>
                            
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" className="modern-input" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" className="modern-input" placeholder="+880 1XXX-XXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="modern-input" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <textarea className="modern-input" rows="3" placeholder="House #, Street, Thana, City" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                            </div>
                        </form>
                    </div>
                    
                    {/* Right: Order Summary */}
                    <div className="checkout-summary-container">
                        <div className="summary-glass-card">
                            <h3 className="section-subtitle">Order Summary</h3>
                            
                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="summary-item-info">
                                            <span className="summary-item-name">{item.name}</span>
                                            <span className="summary-item-qty">x {item.quantity}</span>
                                        </div>
                                        <span className="summary-item-price">৳{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-total">
                                <span>Total Payable</span>
                                <span className="total-value">৳{total.toLocaleString()}</span>
                            </div>

                            <button 
                                onClick={handleSubmit} 
                                className="modern-submit-btn" 
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? (
                                    <span className="btn-content">PROCESSING...</span>
                                ) : (
                                    <span className="btn-content">
                                        PLACE ORDER <span className="btn-total">(৳{total.toLocaleString()})</span>
                                    </span>
                                )}
                            </button>
                            {status === 'error' && <p className="error-msg">Failed to place order. Please try again.</p>}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .checkout-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #FFFFFF;
                }
                .checkout-header {
                    text-align: center;
                    margin-bottom: 48px;
                }
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 56px;
                    align-items: start;
                }
                .success-glass-card {
                    animation: popupSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    padding: 48px 40px;
                    background: #FFFFFF;
                    border: 1px solid #E0E0E0;
                    border-radius: var(--radius-lg);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                }
                .success-action-btn {
                    display: inline-flex;
                    width: auto;
                    padding: 13px 26px;
                }
                @keyframes popupSlideIn {
                    0%   { transform: translateY(28px) scale(0.95); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @media (max-width: 900px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                        gap: 36px;
                    }
                    .checkout-header {
                        margin-bottom: 32px;
                    }
                }
                .section-subtitle {
                    font-family: 'Oswald', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 22px;
                    color: #1A1A1A;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #E85000;
                    display: inline-block;
                }
                .checkout-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }
                .form-group label {
                    font-family: 'Open Sans', sans-serif;
                    font-size: 0.75rem;
                    color: #555555;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .modern-input {
                    background: #FFFFFF;
                    border: 1px solid #E0E0E0;
                    border-radius: var(--radius-sm);
                    padding: 13px 16px;
                    color: #1A1A1A;
                    font-family: 'Open Sans', sans-serif;
                    font-size: 0.92rem;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                .modern-input:focus {
                    outline: none;
                    border-color: #E85000;
                    box-shadow: 0 0 0 3px rgba(232, 80, 0, 0.08);
                }
                .modern-input::placeholder {
                    color: #BBBBBB;
                }
                .summary-glass-card {
                    background: #FFFFFF;
                    border: 1px solid #E0E0E0;
                    border-radius: var(--radius-lg);
                    padding: 36px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                }
                .summary-glass-card .section-subtitle {
                    display: block;
                    padding-bottom: 10px;
                    margin-bottom: 22px;
                }
                .summary-items {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-bottom: 26px;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 14px;
                    border-bottom: 1px solid #E0E0E0;
                }
                .summary-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .summary-item-name {
                    font-family: 'Oswald', sans-serif;
                    font-weight: 600;
                    color: #1A1A1A;
                    font-size: 0.88rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .summary-item-qty {
                    font-family: 'Open Sans', sans-serif;
                    font-size: 0.78rem;
                    color: #999999;
                }
                .summary-item-price {
                    font-family: 'Oswald', sans-serif;
                    font-weight: 700;
                    color: #E85000;
                    font-size: 1rem;
                }
                .summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-top: 14px;
                    border-top: 1px solid #E0E0E0;
                }
                .summary-total span:first-child {
                    font-family: 'Oswald', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #999999;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .total-value {
                    font-family: 'Oswald', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #E85000;
                }
                .modern-submit-btn {
                    width: 100%;
                    padding: 17px;
                    border-radius: var(--radius-sm);
                    background: #E85000;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                    box-shadow: 0 8px 22px rgba(232, 80, 0, 0.28);
                }
                .modern-submit-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
                    transition: left 0.5s ease;
                }
                .modern-submit-btn:hover {
                    background: #FF6B1A;
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(232, 80, 0, 0.4);
                }
                .modern-submit-btn:hover::before {
                    left: 100%;
                }
                .modern-submit-btn:disabled {
                    background: #E0E0E0;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }
                .btn-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Oswald', sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #FFFFFF;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .btn-total {
                    background: rgba(0,0,0,0.15);
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                }
                .error-msg {
                    color: #E53333;
                    font-family: 'Open Sans', sans-serif;
                    text-align: center;
                    margin-top: 14px;
                    font-size: 0.88rem;
                }
                @media (max-width: 600px) {
                    .checkout-header {
                        margin-bottom: 22px;
                    }
                    .section-subtitle {
                        font-size: 0.95rem;
                        margin-bottom: 16px;
                    }
                    .summary-glass-card {
                        padding: 22px 16px;
                    }
                    .modern-input {
                        padding: 12px 14px;
                        font-size: 0.88rem;
                    }
                    .btn-content {
                        font-size: 0.92rem;
                    }
                    .modern-submit-btn {
                        padding: 15px;
                    }
                    .total-value {
                        font-size: 1.5rem;
                    }
                    .success-glass-card {
                        padding: 34px 18px;
                        border-radius: var(--radius-md);
                    }
                    .success-action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
                @media (max-width: 390px) {
                    .summary-glass-card {
                        padding: 16px 13px;
                    }
                    .modern-input {
                        padding: 11px 13px;
                    }
                    .success-glass-card {
                        padding: 26px 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
