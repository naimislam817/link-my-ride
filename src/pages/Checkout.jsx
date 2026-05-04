import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';

const Checkout = () => {
    const { cart, clearCart } = useShop();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [invoiceNumber, setInvoiceNumber] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        
        setStatus('submitting');
        
        try {
            const { data, error } = await supabase.from('orders').insert([{
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                customer_address: formData.address,
                total_amount: total,
                items: cart,
                status: 'pending'
            }]).select();
            
            if (error) throw error;
            
            const invId = data?.[0]?.id || Math.floor(Math.random() * 10000);
            setInvoiceNumber(`LMR-${String(invId).padStart(5, '0')}`);
            clearCart();
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="container section-padding animate-fade-in" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="success-glass-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '50px 30px', background: 'rgba(15, 17, 26, 0.8)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(0, 210, 255, 0.2)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid var(--accent-cyan)' }}>
                        <span style={{ fontSize: '3rem' }}>✔️</span>
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px', fontWeight: 800 }}>Order Confirmed!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>Your order has been successfully placed and is being processed.</p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '35px', display: 'inline-block', textAlign: 'left', minWidth: '250px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Invoice Number</div>
                        <div style={{ fontSize: '1.8rem', color: 'var(--accent-cyan)', fontWeight: 800, letterSpacing: '2px' }}>{invoiceNumber}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/" className="modern-submit-btn" style={{ textDecoration: 'none', width: 'auto', padding: '15px 30px', display: 'inline-block', background: 'linear-gradient(135deg, #1f2235 0%, #151828 100%)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <span className="btn-content">🏠 BACK TO HOME</span>
                        </a>
                        <a href="#catalog" className="modern-submit-btn" style={{ textDecoration: 'none', width: 'auto', padding: '15px 30px', display: 'inline-block' }}>
                            <span className="btn-content">🛒 CONTINUE SHOPPING</span>
                        </a>
                    </div>
                    
                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Need help? Call us at <a href="tel:+8801622864377" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>📞 +880 1622 864377</a>
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
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Your cart is empty.</p>
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

            <style jsx>{`
                .checkout-page {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .checkout-header {
                    text-align: center;
                    margin-bottom: 50px;
                }
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: start;
                }
                .success-glass-card {
                    animation: popupSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes popupSlideIn {
                    0% { transform: translateY(30px) scale(0.95); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @media (max-width: 900px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                }
                .section-subtitle {
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin-bottom: 25px;
                    color: var(--text-primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .checkout-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .modern-input {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    padding: 15px 20px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .modern-input:focus {
                    outline: none;
                    border-color: var(--accent-cyan);
                    background: rgba(0, 210, 255, 0.05);
                    box-shadow: 0 0 15px rgba(0, 210, 255, 0.1);
                }
                .modern-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                .summary-glass-card {
                    background: rgba(15, 17, 26, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-lg);
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .summary-items {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .summary-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .summary-item-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .summary-item-qty {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                .summary-item-price {
                    font-weight: 700;
                    color: var(--accent-cyan);
                }
                .summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-top: 10px;
                }
                .summary-total span:first-child {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .total-value {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: var(--accent-cyan);
                }
                .modern-submit-btn {
                    width: 100%;
                    padding: 20px;
                    border-radius: var(--radius-md);
                    background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
                    border: none;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    box-shadow: 0 10px 25px rgba(0, 210, 255, 0.4);
                }
                .modern-submit-btn::before {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    transition: left 0.5s ease;
                }
                .modern-submit-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 35px rgba(0, 210, 255, 0.6);
                }
                .modern-submit-btn:hover::before {
                    left: 100%;
                }
                .modern-submit-btn:disabled {
                    background: var(--bg-tertiary);
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
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #000;
                    letter-spacing: 1px;
                }
                .btn-total {
                    background: rgba(0,0,0,0.2);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                }
                .error-msg {
                    color: var(--accent-red);
                    text-align: center;
                    margin-top: 15px;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default Checkout;
