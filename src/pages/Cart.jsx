import React from 'react';
import { useShop } from '../context/ShopContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useShop();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="container section-padding" style={{ minHeight: '60vh' }}>
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty. <a href="#catalog" className="text-accent">Continue Shopping</a></p>
            ) : (
                <div className="cart-list">
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                            <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <h4>{item.name}</h4>
                                <p style={{ color: 'var(--accent-cyan)' }}>৳{item.price.toLocaleString()}</p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-outline" style={{ padding: '2px 10px' }}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-outline" style={{ padding: '2px 10px' }}>+</button>
                                </div>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="btn" style={{ background: 'transparent', alignSelf: 'flex-start' }}>✕</button>
                        </div>
                    ))}
                    <div style={{ textAlign: 'right', marginTop: '30px' }}>
                        <h3>Total: ৳{total.toLocaleString()}</h3>
                        <a href="#checkout" className="btn btn-primary" style={{ marginTop: '15px' }}>Proceed to Checkout</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
