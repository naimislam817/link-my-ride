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
            <div className="promotions-row">
                <FreeGiftsSection />
                <OffersSection />
            </div>
            <GadgetsSection />
            <PromoBanner />
            <WhyChooseUs />
        </div>
    );
};

export default Home;
