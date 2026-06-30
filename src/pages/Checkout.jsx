import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';
import { trackInitiateCheckout, trackPurchase } from '../lib/fbPixel';

const Checkout = () => {
    const { cart, clearCart } = useShop();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [placedOrder, setPlacedOrder] = useState(null);

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
        
        // Strict programmatic validation check
        if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.address.trim()) {
            alert("Please fill in all required shipping details.");
            return;
        }
        
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
                items: [...cart], // clone the cart items before clearing
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
            setPlacedOrder(orderData);
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
            <div className="container section-padding animate-fade-in success-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', padding: '40px 20px' }}>
                
                <div className="success-title-block" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ width: '76px', height: '76px', background: '#FFF3EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid #E85000', boxShadow: '0 4px 10px rgba(232, 80, 0, 0.15)' }}>
                        <span style={{ fontSize: '2.5rem', color: '#E85000' }}>✓</span>
                    </div>
                    <h2 style={{ fontFamily: "'Oswald', sans-serif", color: '#1A1A1A', fontSize: '2.2rem', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Order Confirmed!</h2>
                    <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#555555', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>Thank you for your purchase. Your order has been successfully placed and is being processed.</p>
                </div>

                {/* Printable Invoice Card */}
                <div className="printable-invoice" style={{
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '12px',
                    padding: '36px',
                    maxWidth: '600px',
                    width: '100%',
                    margin: '0 auto 30px',
                    textAlign: 'left',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    position: 'relative'
                }}>
                    {/* Invoice Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #E85000', paddingBottom: '20px', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ color: '#1A1A1A', margin: 0, fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 700, letterSpacing: '1px', lineHeight: 1.1 }}>LINK MY RIDE</h2>
                            <span style={{ fontSize: '0.78rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Official Sales Invoice</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice Number</span>
                            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', color: '#E85000', fontWeight: 700, letterSpacing: '1.5px', marginTop: '2px', marginBottom: '4px' }}>{invoiceNumber}</div>
                            <div style={{ fontSize: '0.78rem', color: '#555555' }}>Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div style={{ marginBottom: '28px', background: '#F8F9FA', padding: '18px 20px', borderRadius: '8px', borderLeft: '4px solid #E85000' }}>
                        <h4 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 700 }}>Shipping & Delivery Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: '8px', fontSize: '0.88rem', lineHeight: 1.4, color: '#333' }}>
                            <strong style={{ color: '#666' }}>Name:</strong> <span>{placedOrder?.customer_name}</span>
                            <strong style={{ color: '#666' }}>Phone:</strong> <span>{placedOrder?.customer_phone}</span>
                            <strong style={{ color: '#666' }}>Email:</strong> <span>{placedOrder?.customer_email}</span>
                            <strong style={{ color: '#666' }}>Address:</strong> <span style={{ whiteSpace: 'pre-line' }}>{placedOrder?.customer_address}</span>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div style={{ marginBottom: '28px' }}>
                        <h4 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.9rem', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 700 }}>Ordered Items</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E0E0E0', paddingBottom: '8px' }}>
                                    <th style={{ textAlign: 'left', paddingBottom: '8px', color: '#999999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Item Description</th>
                                    <th style={{ textAlign: 'center', paddingBottom: '8px', color: '#999999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', width: '60px' }}>Qty</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '8px', color: '#999999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', width: '90px' }}>Price</th>
                                    <th style={{ textAlign: 'right', paddingBottom: '8px', color: '#999999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', width: '100px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {placedOrder?.items?.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F0F0F0' }}>
                                        <td style={{ padding: '12px 0', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'center', color: '#333', fontFamily: "'JetBrains Mono', monospace" }}>{item.quantity}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#555', fontFamily: "'JetBrains Mono', monospace" }}>৳{Number(item.price).toLocaleString()}</td>
                                        <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: '#1A1A1A', fontFamily: "'JetBrains Mono', monospace" }}>৳{Number(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Total */}
                    <div style={{ borderTop: '2px double #E0E0E0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#1A1A1A', letterSpacing: '1px' }}>TOTAL PAYABLE</span>
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: '#E85000' }}>৳{Number(placedOrder?.total_amount).toLocaleString()}</span>
                    </div>

                    {/* Rip Line Style Bottom Decal */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '-5px', 
                        left: '0', 
                        right: '0', 
                        height: '10px', 
                        backgroundImage: 'radial-gradient(circle, #F8F9FA 5px, transparent 6px)', 
                        backgroundSize: '16px 16px',
                        backgroundPosition: 'top center'
                    }} />
                </div>

                {/* Actions Button Row */}
                <div className="success-actions-row" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '600px', padding: '0 10px' }}>
                    <button 
                        onClick={() => window.print()} 
                        className="modern-submit-btn success-action-btn" 
                        style={{ background: '#E85000', border: '1px solid #E85000', flex: '1 1 180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <span className="btn-content">🖨️ PRINT INVOICE</span>
                    </button>
                    <a href="/" className="modern-submit-btn success-action-btn" style={{ textDecoration: 'none', background: '#1A1A1A', border: '1px solid #1A1A1A', flex: '1 1 180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="btn-content">🏠 BACK TO HOME</span>
                    </a>
                    <a href="#catalog" className="modern-submit-btn success-action-btn" style={{ textDecoration: 'none', background: '#FFFFFF', border: '1px solid #E0E0E0', color: '#1A1A1A', flex: '1 1 180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="btn-content" style={{ color: '#1A1A1A' }}>🛒 CONTINUE SHOPPING</span>
                    </a>
                </div>

                <div className="success-title-block" style={{ marginTop: '30px', fontFamily: "'Open Sans', sans-serif", fontSize: '0.88rem', color: '#777777', textAlign: 'center' }}>
                    Need help? Call us at <a href="tel:+8801622864377" style={{ color: '#E85000', textDecoration: 'none', fontWeight: 600 }}>📞 +880 1622 864377</a>
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
                        <form onSubmit={handleSubmit} className="checkout-form" id="checkout-form">
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
                                type="submit"
                                form="checkout-form"
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
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    /* Hide everything when printing */
                    body * {
                        visibility: hidden;
                    }
                    /* Only keep printable invoice and its contents visible */
                    .success-container, .success-container *,
                    .printable-invoice, .printable-invoice * {
                        visibility: visible;
                    }
                    .success-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }
                    .printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 100% !important;
                        border: none !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .success-actions-row, .success-title-block {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
