import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FreeGiftsSection from '../components/home/FreeGiftsSection';
import OffersSection from '../components/home/OffersSection';
import GadgetsSection from '../components/home/GadgetsSection';
import PromoBanner from '../components/home/PromoBanner';
import WhyChooseUs from '../components/home/WhyChooseUs';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <HeroSection />
            <div style={{ paddingBottom: '80px', background: 'var(--bg-primary)' }}>
                <div className="promotions-row">
                    <FreeGiftsSection />
                    <OffersSection />
                </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <GadgetsSection />
            </div>
            <PromoBanner />
            <div>
                <WhyChooseUs />
            </div>
        </div>
    );
};

export default Home;
