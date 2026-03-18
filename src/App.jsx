import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/admin/AdminLayout';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import { useShop } from './context/ShopContext';
import './index.css';

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
  const { products } = useShop();

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Scroll Reveal Animation Observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Initial check + re-check when products load/route changes
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach(el => observer.observe(el));
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [currentRoute, products]); // Re-run when products load or route changes

  const renderPage = () => {
    if (currentRoute.startsWith('#product')) {
      return <ProductDetails key={currentRoute} />;
    }
    if (currentRoute.startsWith('#catalog')) {
      return <Catalog key={currentRoute} />;
    }
    if (currentRoute.startsWith('#cart')) {
      return <Cart key={currentRoute} />;
    }
    if (currentRoute.startsWith('#checkout')) {
      return <Checkout key={currentRoute} />;
    }
    if (currentRoute.startsWith('#admin')) {
      return <AdminLayout key={currentRoute} />;
    }
    return <Home />;
  };

  return (
    <div className="app-container">
      <Navbar />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

export default App;
