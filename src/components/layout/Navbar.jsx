import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useShop } from '../../context/ShopContext';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { cart, setIsCartOpen, categories } = useShop();

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsDropdownOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const [currentHash, setCurrentHash] = useState(window.location.hash);
    useEffect(() => {
        const handleHash = () => setCurrentHash(window.location.hash);
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const isCategoryActive = (catId) => {
        return currentHash.includes(`?category=${catId}`);
    };

    return (
        <header className="navbar-dark">
            <div className="container navbar-dark-container">
                {/* Logo Section */}
                <a href="/" className="logo-dark" onClick={closeMobileMenu}>
                    LINK MY RIDE
                </a>

                {/* Left/Middle Navigation Links */}
                <div className={`nav-dark-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <a 
                        href="#catalog?category=communicators" 
                        className={isCategoryActive('communicators') ? 'active-link' : ''}
                        onClick={closeMobileMenu}
                    >
                        MOTO BLUETOOTH
                    </a>
                    <a 
                        href="#catalog?category=dashcams" 
                        className={isCategoryActive('dashcams') ? 'active-link' : ''}
                        onClick={closeMobileMenu}
                    >
                        DASHCAMS
                    </a>
                    <a 
                        href="#catalog?category=accessories" 
                        className={isCategoryActive('accessories') ? 'active-link' : ''}
                        onClick={closeMobileMenu}
                    >
                        HELMETS
                    </a>

                    {/* Shop by Category Dropdown */}
                    <div className="nav-dropdown" onMouseLeave={() => setIsDropdownOpen(false)}>
                        <button 
                            className="nav-dropdown-btn" 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            SHOP BY CATEGORY <span className="dropdown-arrow">▼</span>
                        </button>
                        <div className={`nav-dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                            {categories.map(cat => (
                                <a key={cat.id} href={`#catalog?category=${cat.id}`} onClick={closeMobileMenu}>{cat.title}</a>
                            ))}
                            <a href="#catalog" onClick={closeMobileMenu}>All Products</a>
                        </div>
                    </div>
                </div>

                {/* Right Actions Block (Cart, Hamburger) */}
                <div className="nav-dark-actions">
                    {/* Shopping Cart button trigger */}
                    <button className="nav-cart-icon" aria-label="Cart" onClick={() => setIsCartOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        {cartCount > 0 && <span className="cart-badge-dark">{cartCount}</span>}
                    </button>

                    {/* Mobile Hamburger menu */}
                    <button className={`mobile-dark-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu} aria-label="Toggle Mobile Menu">
                        <span className="dark-hamburger-line"></span>
                        <span className="dark-hamburger-line"></span>
                        <span className="dark-hamburger-line"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
