import React from 'react';
import { useShop } from '../context/ShopContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useShop();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="container section-padding" style={{ minHeight: '70vh', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: '2.5rem', 
                marginBottom: '40px', 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                borderBottom: '3px solid var(--accent-orange)',
                display: 'inline-block',
                paddingBottom: '8px'
            }}>Your Shopping Cart</h2>
            
            {cart.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    background: 'var(--bg-section)', 
                    borderRadius: 'var(--radius-lg)',
                    marginTop: '20px'
                }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Your cart is currently empty.</p>
                    <a href="#catalog" className="btn" style={{ 
                        display: 'inline-block',
                        background: 'var(--accent-orange)', 
                        color: '#FFFFFF', 
                        padding: '12px 30px', 
                        fontWeight: 'bold', 
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--accent-orange-hover)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-orange)'}
                    >Continue Shopping</a>
                </div>
            ) : (
                <div style={{ 
                    background: '#FFFFFF',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '30px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.03)'
                }}>
                    <div className="cart-list">
                        {cart.map(item => (
                            <div key={item.id} style={{ 
                                display: 'flex', 
                                gap: '24px', 
                                marginBottom: '24px', 
                                borderBottom: '1px solid var(--border-default)', 
                                paddingBottom: '24px',
                                alignItems: 'center'
                            }}>
                                <img src={item.image} alt={item.name} style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-default)',
                                    background: 'var(--bg-section)'
                                }} />
                                
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ 
                                        fontFamily: 'var(--font-display)', 
                                        fontSize: '1.25rem', 
                                        color: 'var(--text-primary)',
                                        marginBottom: '6px',
                                        textTransform: 'uppercase'
                                    }}>{item.name}</h4>
                                    
                                    <p style={{ 
                                        color: 'var(--accent-orange)', 
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '1.15rem',
                                        fontWeight: 'bold'
                                    }}>৳{item.price.toLocaleString()}</p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.id, -1)} 
                                            style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                border: '1px solid var(--border-default)',
                                                background: '#FFFFFF',
                                                color: 'var(--text-primary)',
                                                fontWeight: 'bold',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                transition: 'var(--transition)'
                                            }}
                                            onMouseOver={(e) => { e.target.style.background = 'var(--bg-section)'; }}
                                            onMouseOut={(e) => { e.target.style.background = '#FFFFFF'; }}
                                        >-</button>
                                        
                                        <span style={{ 
                                            width: '40px', 
                                            textAlign: 'center', 
                                            fontWeight: '600',
                                            fontSize: '0.95rem'
                                        }}>{item.quantity}</span>
                                        
                                        <button 
                                            onClick={() => updateQuantity(item.id, 1)} 
                                            style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                border: '1px solid var(--border-default)',
                                                background: '#FFFFFF',
                                                color: 'var(--text-primary)',
                                                fontWeight: 'bold',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                transition: 'var(--transition)'
                                            }}
                                            onMouseOver={(e) => { e.target.style.background = 'var(--bg-section)'; }}
                                            onMouseOut={(e) => { e.target.style.background = '#FFFFFF'; }}
                                        >+</button>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    style={{ 
                                        background: 'transparent', 
                                        color: 'var(--text-muted)',
                                        fontSize: '1.2rem',
                                        padding: '8px',
                                        transition: 'var(--transition)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.target.style.color = 'var(--error)'}
                                    onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                                >✕</button>
                            </div>
                        ))}
                        
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'flex-end', 
                            marginTop: '30px' 
                        }}>
                            <h3 style={{ 
                                fontFamily: 'var(--font-display)', 
                                fontSize: '1.8rem', 
                                color: 'var(--text-primary)',
                                marginBottom: '16px' 
                            }}>Total: <span style={{ color: 'var(--accent-orange)' }}>৳{total.toLocaleString()}</span></h3>
                            
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <a href="#catalog" className="btn" style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--text-primary)', 
                                    background: 'transparent',
                                    color: 'var(--text-primary)', 
                                    padding: '12px 24px', 
                                    fontWeight: 'bold', 
                                    fontFamily: 'var(--font-display)',
                                    textTransform: 'uppercase',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'var(--transition)'
                                }}
                                onMouseOver={(e) => { e.target.style.background = 'var(--text-primary)'; e.target.style.color = '#FFFFFF'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; }}
                                >Shopping Menu</a>
                                
                                <a href="#checkout" className="btn" style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'var(--accent-orange)', 
                                    color: '#FFFFFF', 
                                    padding: '12px 36px', 
                                    fontWeight: 'bold', 
                                    fontFamily: 'var(--font-display)',
                                    textTransform: 'uppercase',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'var(--transition)'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--accent-orange-hover)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--accent-orange)'}
                                >Proceed to Checkout</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
