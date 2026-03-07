import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

import './HeroSection.css';
import communicatorImg from '../../assets/images/categories/communicator-bg.jpg';
import dashcamImg from '../../assets/images/hero/hero-image.jpg';

const HeroSection = () => {
    const slides = [
        {
            id: 0,
            bgImg: communicatorImg,
            pillText: "MOTO SERIES",
            pillClass: "badge-moto",
            title: "Ride Free.<br />Stay<br />Connected.",
            desc: "Premium motorcycle communicators designed for crystal-clear audio and seamless mesh networking on the open road.",
            buttonText: "Shop",
            buttonClass: "btn-moto",
            buttonLink: "#catalog?category=communicators",
            isDarkText: false,
            overlayClass: "dark-overlay"
        },
        {
            id: 1,
            bgImg: dashcamImg,
            pillText: "AUTO SERIES",
            pillClass: "badge-auto",
            title: "Your Eye<br />On The Road.",
            desc: "Capture every ride in crystal-clear 4K — even at night. Cloud-ready for ultimate security.",
            buttonText: "Shop",
            buttonClass: "btn-auto",
            buttonLink: "#catalog?category=dashcams",
            isDarkText: true,
            overlayClass: "light-overlay"
        }
    ];

    return (
        <section className="hero-slider">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop={true}
                className="mySwiper"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="hero-slide">
                            <div className="hero-bg" style={{ backgroundImage: `url(${slide.bgImg})` }}></div>
                            <div className={slide.overlayClass}></div>
                            <div className="hero-content">
                                <span className={`hero-pill ${slide.pillClass}`}>{slide.pillText}</span>
                                <h1
                                    className={`hero-split-title ${slide.isDarkText ? 'dark-text' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: slide.title }}
                                />
                                <p className={`hero-split-desc ${slide.isDarkText ? 'dark-text' : ''}`}>
                                    {slide.desc}
                                </p>
                                <button
                                    className={`btn-split ${slide.buttonClass}`}
                                    onClick={() => window.location.hash = slide.buttonLink}
                                >
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default HeroSection;
