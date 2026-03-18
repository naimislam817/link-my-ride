import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { supabase } from '../lib/supabase';

const Checkout = () => {
    const { cart, clearCart } = useShop();
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        
        setStatus('submitting');
        
        try {
            const { error } = await supabase.from('orders').insert([{
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                customer_address: formData.address,
                total_amount: total,
                items: cart,
                status: 'pending'
            }]);
            
            if (error) throw error;
            
            clearCart();
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="container section-padding" style={{ textAlign: 'center', minHeight: '60vh' }}>
                <h2 style={{ color: 'var(--accent-green)' }}>Order Placed Successfully!</h2>
                <p>Thank you for shopping with us. We will process your order soon.</p>
                <a href="#catalog" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Shop</a>
            </div>
        );
    }

    return (
        <div className="container section-padding" style={{ minHeight: '60vh' }}>
            <h2>Checkout</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label>Full Name</label>
                            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                        <div>
                            <label>Phone Number</label>
                            <input type="tel" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }} />
                        </div>
                        <div>
                            <label>Delivery Address</label>
                            <textarea className="form-control" rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'white' }}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={status === 'submitting'} style={{ marginTop: '10px' }}>
                            {status === 'submitting' ? 'Processing...' : `Place Order (৳${total.toLocaleString()})`}
                        </button>
                        {status === 'error' && <p style={{ color: 'red' }}>There was an error placing your order. Please try again.</p>}
                    </form>
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '10px' }}>
                        <h3>Order Summary</h3>
                        <div style={{ marginTop: '20px' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>৳{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--accent-cyan)' }}>৳{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
