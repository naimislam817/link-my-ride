import React, { useEffect, useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminLogin from './AdminLogin';
import { supabase } from '../../lib/supabase';

const AdminLayout = () => {
    const [subRoute, setSubRoute] = useState(window.location.hash.replace('#admin/', ''));
    const [session, setSession] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoadingAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#admin/')) {
                setSubRoute(hash.replace('#admin/', ''));
            } else {
                setSubRoute('dashboard');
            }
        };
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderContent = () => {
        if (subRoute === 'products') return <AdminProducts />;
        if (subRoute === 'orders') return <AdminOrders />;
        return (
            <div>
                <h2>Welcome to Admin Dashboard</h2>
                <p>Select an option from the sidebar to manage your store.</p>
            </div>
        );
    };

    if (loadingAuth) {
        return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Admin Panel...</div>;
    }

    if (!session) {
        return <AdminLogin onLogin={(s) => setSession(s)} />;
    }

    return (
        <div style={{ minHeight: '80vh', display: 'flex' }}>
            <div style={{ width: '250px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', padding: '20px' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>ADMIN PANEL</h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                    <a href="#admin/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Overview</a>
                    <a href="#admin/products" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Products</a>
                    <a href="#admin/orders" style={{ color: 'var(--text-primary)', textDecoration: 'none', padding: '10px', borderRadius: '5px' }}>Orders</a>
                    <div style={{ flex: 1 }}></div>
                    <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
                </nav>
            </div>
            <div style={{ flex: 1, padding: '40px', background: 'var(--bg-primary)', overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminLayout;
