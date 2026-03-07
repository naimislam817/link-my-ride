import React from 'react';
import './OffersSection.css';
import { productsList } from '../../data/siteContent';

const OffersSection = () => {
    // Select 3 products for the marquee
    const marqueeProducts = productsList.slice(3, 6);

    return (
        <section className="offers-section container section-padding">
            <div className="section-header-col">
                <h2 className="section-title">CURRENT <span className="text-accent">OFFERS</span></h2>
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

export default OffersSection;
