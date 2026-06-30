import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { productsList, categoriesContent } from '../data/siteContent';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [heroSlides, setHeroSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [deliverySettings, setDeliverySettings] = useState({ inside: 60, outside: 100 });
  const [settingsError, setSettingsError] = useState(null);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      if (data.length === 0) {
        // Seed database if empty
        console.log("Database empty, seeding data...");
        await seedDatabase();
        return; // seedDatabase will call fetchProducts again
      }

      // Map the string representation of JSON back to actual arrays/objects if needed, 
      // but assuming we will store JSON properly in Supabase.
      const formattedData = data.map(item => {
        let specs = item.specs;
        let features = item.features;
        // Parse if they were stored as strings
        try { if (typeof specs === 'string') specs = JSON.parse(specs); } catch (e) {}
        try { if (typeof features === 'string') features = JSON.parse(features); } catch (e) {}

        // Parse images array with backward compatibility
        let images = item.images;
        try { if (typeof images === 'string') images = JSON.parse(images); } catch (e) {}
        if (!Array.isArray(images) || images.length === 0) {
          images = item.image ? [item.image] : [];
        }

        return {
          ...item,
          specs: specs || [],
          features: features || [],
          images: images
        };
      });
      setProducts(formattedData);
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    try {
      const formattedProducts = productsList.map(p => {
        // Extract filename from the import path or just use a predictable one
        const fileName = p.image.split('/').pop()?.split('?')[0] || '';
        return {
          name: p.name,
          price: p.price,
          image: `/images/products/${fileName}`,
          category: p.category,
          description: p.desc,
          is_active: true, // Force active for seeded data
          specs: JSON.stringify(p.specs || []),
          features: JSON.stringify(p.features || [])
        };
      });

      const { error } = await supabase.from('products').insert(formattedProducts);
      if (error) throw error;
      console.log("Database seeded successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error seeding database:", err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("Categories table empty, seeding categories...");
        await seedCategories();
        return;
      }
      
      setCategories(data);
    } catch (err) {
      console.warn("Could not fetch categories from database:", err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const seedCategories = async () => {
    try {
      const { error } = await supabase.from('categories').insert(
        categoriesContent.map(cat => ({
          id: cat.id,
          title: cat.title,
          subtitle: cat.subtitle,
          image: cat.id === 'communicators' ? '/images/categories/communicator-bg.jpg' :
                 cat.id === 'dashcams' ? '/images/categories/dashcam-bg.jpg' :
                 '/images/categories/accessories-bg.jpg'
        }))
      );
      if (error) throw error;
      console.log("Categories seeded successfully!");
      fetchCategories();
    } catch (err) {
      console.error("Error seeding categories:", err);
      setLoadingCategories(false);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      if (data) {
        const mappedData = data.map(slide => ({
          id: slide.id,
          bgImg: slide.bg_img,
          pillText: slide.pill_text,
          pillClass: slide.pill_class,
          title: slide.title,
          desc: slide.desc,
          buttonText: slide.button_text,
          buttonClass: slide.button_class,
          buttonLink: slide.button_link,
          isDarkText: slide.is_dark_text,
          overlayClass: slide.overlay_class
        }));
        setHeroSlides(mappedData);
      }
    } catch (err) {
      console.warn("Could not fetch hero slides. Table might not exist yet.", err.message);
    }
  };

  const saveHeroSlide = async (slide) => {
    try {
      const payload = {
        bg_img: slide.bgImg,
        pill_text: slide.pillText || null,
        pill_class: slide.pillClass || null,
        title: slide.title,
        desc: slide.desc || null,
        button_text: slide.buttonText || null,
        button_class: slide.buttonClass || null,
        button_link: slide.buttonLink || null,
        is_dark_text: !!slide.isDarkText,
        overlay_class: slide.overlayClass || null
      };

      let error;
      if (slide.id) {
        const { error: err } = await supabase
          .from('hero_slides')
          .update(payload)
          .eq('id', slide.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('hero_slides')
          .insert([payload]);
        error = err;
      }

      if (error) throw error;
      await fetchHeroSlides();
      return { success: true };
    } catch (err) {
      console.error("Failed to save hero slide:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteHeroSlide = async (id) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchHeroSlides();
      return { success: true };
    } catch (err) {
      console.error("Failed to delete hero slide:", err);
      return { success: false, error: err.message };
    }
  };

  const fetchDeliverySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'delivery')
        .single();
      
      if (error) throw error;
      if (data && data.value) {
        setDeliverySettings(data.value);
        setSettingsError(null);
      }
    } catch (err) {
      console.warn("Settings table might not exist or no delivery settings found.", err.message);
      setSettingsError(err.message);
    }
  };

  const updateDeliverySettings = async (inside, outside) => {
    try {
      const newValue = { inside: Number(inside), outside: Number(outside) };
      
      // Try to update or insert
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'delivery', value: newValue });
        
      if (error) throw error;
      setDeliverySettings(newValue);
      setSettingsError(null);
      return { success: true };
    } catch (err) {
      console.error("Failed to update delivery settings", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchHeroSlides();
    fetchDeliverySettings();

    // Subscribe to products real-time changes
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log("Real-time update received!");
        fetchProducts();
      })
      .subscribe();

    // Subscribe to categories real-time changes
    const categoriesSubscription = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        console.log("Categories real-time update received!");
        fetchCategories();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, []);

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true); // Open drawer on add
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };
  
  const updateQuantity = (productId, amount) => {
    setCart((prev) => 
      prev.map(item => {
        if(item.id === productId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Admin Functions & Analytics
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data);
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && products.length > 0) {
        fetchOrders();
      }
    };
    checkAuthAndFetch();
  }, [products]);

  const getAnalytics = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    
    // Calculate popular products
    const productCounts = {};
    orders.forEach(order => {
      const items = order.items;
      if (Array.isArray(items)) {
        items.forEach(item => {
          productCounts[item.id] = (productCounts[item.id] || 0) + (item.quantity || 1);
        });
      }
    });

    const popularProducts = Object.keys(productCounts)
      .map(id => {
        const product = products.find(p => String(p.id) === String(id));
        return {
          ...product,
          salesCount: productCounts[id]
        };
      })
      .filter(p => p.name)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    return { totalRevenue, totalOrders, popularProducts, orders };
  };

  const getFeaturedProducts = () => products.filter(p => p.is_active);
  const getProductById = (id) => products.find(p => String(p.id) === String(id));
  const getProductsByCategory = (category) => {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category === category);
  };

  const value = {
    products,
    orders,
    loading,
    cart,
    isCartOpen,
    setIsCartOpen,
    heroSlides,
    refreshHeroSlides: fetchHeroSlides,
    saveHeroSlide,
    deleteHeroSlide,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getFeaturedProducts,
    getProductById,
    getProductsByCategory,
    getAnalytics,
    fetchOrders,
    refreshProducts: fetchProducts,
    deliverySettings,
    updateDeliverySettings,
    settingsError,
    categories,
    loadingCategories,
    refreshCategories: fetchCategories
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
