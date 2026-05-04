import React from 'react';
import './Footer.css';
import logoImg from '../../assets/logo.jpg';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">

                <div className="footer-col brand-col">
                    <div className="logo logo-footer">
                        <img src={logoImg} alt="LinkMyRide Logo" className="brand-logo-img" style={{ height: '45px', objectFit: 'contain' }} />
                    </div>
                    <p className="brand-desc">
                        Redefining the riding experience with cutting-edge technology and premium accessories. Designed for riders, verified worldwide.
                    </p>
                    <div className="social-links">
                        <a href="https://www.facebook.com/KatalineMotors?mibextid=wwXIfr&rdid=iktPgq7MH46O4Tas&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F14WhJTfE6FQ%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a>
                        <a href="#" aria-label="Twitter">TW</a>
                        <a href="#" aria-label="Instagram">IG</a>
                    </div>
                </div>

                <div className="footer-col">
                    <h4 className="footer-heading">Categories</h4>
                    <ul className="footer-links">
                        <li><a href="#">Motorcycle Bluetooth</a></li>
                        <li><a href="#">Car Dashcams</a></li>
                        <li><a href="#">Safety Helmets</a></li>
                        <li><a href="#">Wireless Chargers</a></li>
                        <li><a href="#">Mounts &amp; Holders</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4 className="footer-heading">Connect</h4>
                    <ul className="footer-contact">
                        <li>
                            <span>📍</span>
                            <span>74, 1st Lane, Kalabagan,<br />Dhaka – 1205</span>
                        </li>
                        <li>
                            <span>📞</span>
                            <a href="https://wa.me/8801622864377" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.target.style.color = 'var(--accent-cyan)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>+880 1622-864377 (WhatsApp)</a>
                        </li>
                        <li>
                            <span>✉️</span>
                            <span>support@linkmyride.com</span>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom container">
                <p>&copy; {new Date().getFullYear()} Link My Ride. All rights reserved.</p>
                <div className="legal-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Refund Policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
