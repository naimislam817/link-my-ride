import React, { useState } from 'react';
import './Navbar.css';
import logoImg from '../../assets/logo.jpg';
import { useShop } from '../../context/ShopContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cart } = useShop();
    
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <a href="/" className="logo">
                    <img src={logoImg} alt="LinkMyRide Logo" className="brand-logo-img" style={{ height: '40px', objectFit: 'contain' }} />
                    <span className="text-accent" style={{ fontWeight: 'bold', marginLeft: '10px' }}>Link My Ride</span>
                </a>

                <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <div className="dropdown">
                        <button className="kebab-btn" aria-label="Shop by Category">
                            &#8942; <span className="dropdown-label">Shop by Category</span>
                        </button>
                        <div className="dropdown-content">
                            <a href="#catalog?category=communicators">Communicators</a>
                            <a href="#catalog?category=dashcams">Dashcams</a>
                            <a href="#catalog?category=accessories">Accessories</a>
                        </div>
                    </div>
                    <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)}>PRODUCTS</a>
                </div>

                <div className="nav-actions">
                    <button className="cart-btn" aria-label="Cart" onClick={() => window.location.hash = '#cart'}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span className="cart-badge">{cartCount}</span>
                    </button>
                    
                    <button className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle Mobile Menu">
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
