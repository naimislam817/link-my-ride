import React, { useEffect, useState } from 'react';
import './FreeGiftsSection.css';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';

const FreeGiftsSection = () => {
    const { products } = useShop();
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        const fetchGifts = async () => {
            const { data } = await supabase
                .from('gift_items')
                .select('*')
                .eq('is_active', true);
            
            if (data && data.length > 0) {
                setGifts(data);
            }
        };
        fetchGifts();
    }, []);

    // Use fetched gifts, or fallback to first 6 products if none found
    const displayItems = gifts.length > 0 
        ? gifts 
        : products.slice(0, 6).map(p => ({ id: p.id, title: p.name, image_url: p.image }));

    return (
        <section className="free-gifts-section container section-padding">
            <div className="section-header-col">
                <h2 className="section-title">Claim Your <span className="text-accent">FREE GIFTS</span></h2>
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

export default FreeGiftsSection;
