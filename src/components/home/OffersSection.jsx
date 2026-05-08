import React, { useEffect, useState } from 'react';
import './OffersSection.css';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';

const OffersSection = () => {
    const { products } = useShop();
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        const fetchOffers = async () => {
            const { data } = await supabase
                .from('offers')
                .select('*')
                .eq('is_active', true);
            
            if (data && data.length > 0) {
                setOffers(data);
            }
        };
        fetchOffers();
    }, []);

    // Use fetched offers, or fallback to products if none found
    const displayItems = offers.length > 0 
        ? offers 
        : products.slice(3, 9).map(p => ({ id: p.id, title: p.name, image_url: p.image }));

    return (
        <section className="offers-section container section-padding">
            <div className="section-header-col">
                <h2 className="section-title">CURRENT <span className="text-accent">OFFERS</span></h2>
                <div className="marquee-container">
                    <div className="marquee-content">
                        {/* Render twice for seamless looping */}
                        {[...displayItems, ...displayItems].map((item, index) => (
                            <img
                                key={`${item.id}-${index}`}
                                src={item.image_url}
                                alt={item.title}
                                title={item.title}
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
