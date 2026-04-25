import React from 'react';
import './CartDrawer.css';
import { useShop } from '../../context/ShopContext';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useShop();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const closeCart = () => {
        setIsCartOpen(false);
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        window.location.hash = '#checkout';
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
                onClick={closeCart}
            ></div>

            {/* Drawer */}
            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="close-btn" onClick={closeCart}>✕</button>
                </div>

                <div className="cart-content">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <span className="empty-icon">🛒</span>
                            <p>Your cart is empty.</p>
                            <button className="btn btn-primary" onClick={closeCart}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img 
                                        src={Array.isArray(item.images) ? item.images[0] : item.image} 
                                        alt={item.name} 
                                        className="cart-item-img" 
                                    />
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p className="cart-item-price">৳{item.price.toLocaleString()}</p>
                                        
                                        <div className="cart-item-actions">
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                                            </div>
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="total-amount">৳{total.toLocaleString()}</span>
                        </div>
                        <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
