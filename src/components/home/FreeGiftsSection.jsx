import React from 'react';
import './FreeGiftsSection.css';
import { productsList } from '../../data/siteContent';

const FreeGiftsSection = () => {
    // Get more products for the marquee
    const marqueeProducts = productsList.slice(0, 6);

    return (
        <section className="free-gifts-section container section-padding">
            <div className="section-header-col">
                <h2 className="section-title">Claim Your <span className="text-accent">FREE GIFTS</span></h2>
                <div className="marquee-container">
                    <div className="marquee-content">
                        {/* Render twice for seamless looping */}
                        {[...marqueeProducts, ...marqueeProducts].map((product, index) => (
                            <img
                                key={`${product.id}-${index}`}
                                src={product.image}
                                alt={product.name}
                                className="marquee-product"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FreeGiftsSection;
