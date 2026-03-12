// src/data/siteContent.js
import communicatorImg from '../assets/images/categories/communicator-bg.jpg';
import dashcamImg from '../assets/images/categories/dashcam-bg.jpg';
import accessoriesImg from '../assets/images/categories/accessories-bg.jpg';
import phoneBracketImg from '../assets/images/products/phone-bracket.jpg';
import carChargerImg from '../assets/images/products/car-charger.jpg';
import y10Img from '../assets/images/products/y10.jpg';
import d3xImg from '../assets/images/products/d3x.jpg';
import carAshtrayImg from '../assets/images/products/car-ashtray.jpg';
import dashcamProductImg from '../assets/images/products/car-dash.jpg';

/**
 * HERO SECTION CONTENT
 * You can edit the text and background image for the top section of the homepage.
 */
export const heroContent = {
    badge: "NEW ARRIVAL: DX3 PRO",
    titleLine1: "RIDE",
    titleAccent: "CONNECTED,",
    titleLine3: "RIDE SAFE.",
    subtitle: "Experience the ultimate freedom on the road with our next-gen motorcycle communicators and premium vehicle gadgets. Engineered for performance, built for the journey.",
    // Example path for your hero image override. Leave blank or comment out if using CSS gradient fallback.
    // bgImage: "/src/assets/images/hero/hero-bg.jpg" 
};

/**
 * CATEGORIES
 * These will display on the homepage grid.
 */
export const categoriesContent = [
    {
        id: "communicators",
        title: "Motorcycle Communicators",
        subtitle: "STAY LINKED",
        image: communicatorImg,
    },
    {
        id: "dashcams",
        title: "Smart Dashcams",
        subtitle: "RECORD EVERY RIDE",
        image: dashcamImg,
    },
    {
        id: "accessories",
        title: "Safety Tech Gear",
        subtitle: "RIDE PROTECTED",
        image: accessoriesImg,
    }
];

/**
 * PRODUCT CATALOG
 * Add or edit products here. They will automatically populate throughout the app.
 */
export const productsList = [
    {
        id: "magnetic-phone-bracket",
        badge: "EXTRA STRONG",
        name: "Magnetic Phone Bracket",
        desc: "Vacuum magnetic suction with ultra-stable mechanical arm.",
        price: 4500,
        oldPrice: 5000,
        specs: ["Strong Suction", "Metal Arm"],
        // features will show up as large call-outs on the product details page
        features: [
            { val: "360°", label: "ROTATION" },
            { val: "15KG", label: "SUCTION" },
            { val: "UNIVERSAL", label: "FIT" }
        ],
        image: phoneBracketImg,
        category: "accessories",
        featured: true // Set to true to display on homepage
    },
    {
        id: "digital-fast-charger",
        badge: "60W MAX",
        name: "Digital Fast Charger",
        desc: "Smart digital display with 80cm retractable cables.",
        price: 3200,
        oldPrice: 3800,
        specs: ["100W Super Fast", "Retractable"],
        features: [
            { val: "60W", label: "MAX OUTPUT" },
            { val: "80cm", label: "CABLE" },
            { val: "SMART", label: "DISPLAY" }
        ],
        image: carChargerImg,
        category: "accessories",
        featured: true
    },

    {
        id: "Y-10-communicator",
        badge: "BLUETOOTH",
        name: "Y-10-communicator",
        desc: "Hands-free control with integrated AI voice assistant support.",
        price: 8500,
        oldPrice: 9500,
        specs: ["AI voice Assistant", "Noise Control"],
        features: [
            { val: "10H", label: "PLAY TIME" },
            { val: "CVC", label: "NOISE CHECK" },
            { val: "IP67", label: "WATERPROOF" }
        ],
        image: y10Img,
        category: "communicators",
        featured: true
    },
    {
        id: "dx3-pro-communicator",
        badge: "NEW ARRIVAL",
        name: "DX3 PRO COMMUNICATOR",
        desc: "Experience the next generation of rider connectivity. The DX3 Pro by LinkMyRide features a high-capacity 1000mAh battery and a specialized high-voltage chip for long-range stability.",
        price: 20500,
        oldPrice: 24000,
        specs: ["1000mAh Battery", "Long Range"],
        features: [
            { val: "22H", label: "PLAY TIME" },
            { val: "12H", label: "INTERCOM" },
            { val: "2.5H", label: "CHARGING" }
        ],
        image: d3xImg,
        category: "communicators",
        featured: true
    },
    {
        id: "ashtray",
        badge: "NEW ARRIVAL",
        name: "Digital Ashtray",
        desc: "Experience the next generation of rider connectivity. The DX3 Pro by LinkMyRide features a high-capacity 1000mAh battery and a specialized high-voltage chip for long-range stability.",
        price: 20500,
        oldPrice: 24000,
        specs: ["1000mAh Battery", "Long Range"],
        features: [
            { val: "22H", label: "PLAY TIME" },
            { val: "12H", label: "INTERCOM" },
            { val: "2.5H", label: "CHARGING" }
        ],
        image: carAshtrayImg,
        category: "accessories",
        featured: true
    },
    {
        id: "Dashcam",
        badge: "NEW ARRIVAL",
        name: "Digital Ashtray",
        desc: "Experience the next generation of rider connectivity. The DX3 Pro by LinkMyRide features a high-capacity 1000mAh battery and a specialized high-voltage chip for long-range stability.",
        price: 20500,
        oldPrice: 24000,
        specs: ["1000mAh Battery", "Long Range"],
        features: [
            { val: "22H", label: "PLAY TIME" },
            { val: "12H", label: "INTERCOM" },
            { val: "2.5H", label: "CHARGING" }
        ],
        image: dashcamProductImg,
        category: "accessories",
        featured: true
    }
];

/**
 * HELPER FUNCTIONS
 * You do not need to edit anything below this line!
 */
export const getFeaturedProducts = () => productsList.filter(p => p.featured);
export const getProductById = (id) => productsList.find(p => p.id === id);
export const getProductsByCategory = (category) => {
    if (!category || category === 'all') return productsList;
    return productsList.filter(p => p.category === category);
};
