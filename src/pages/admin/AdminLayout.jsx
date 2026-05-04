import React, { useEffect, useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminLogin from './AdminLogin';
import AdminSettings from './AdminSettings';
import { supabase } from '../../lib/supabase';

import AdminOverview from './AdminOverview';
import './AdminDashboard.css';

const AdminLayout = () => {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('overview');
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoadingAuth(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loadingAuth) return <div className="admin-loading">Authenticating Nexus...</div>;
    if (!user) return <AdminLogin />;

    const renderView = () => {
        switch (currentView) {
            case 'overview': return <AdminOverview />;
            case 'products': return <AdminProducts />;
            case 'orders': return <AdminOrders />;
            case 'settings': return <AdminSettings />;
            default: return <AdminOverview />;
        }
    };

    return (
        <div className="admin-dashboard-container">
            <div style={{ display: 'flex', minHeight: '100vh' }}>
                {/* Sidebar */}
                <aside style={{ 
                    width: '280px', 
                    background: 'rgba(15, 17, 26, 0.95)', 
                    borderRight: '1px solid var(--admin-border)',
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: '0 20px', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--admin-accent)' }}>LINKMYRIDE</h2>
                        <span style={{ fontSize: '0.65rem', color: 'var(--admin-text-muted)', letterSpacing: '1px' }}>ADMIN COMMAND CENTER</span>
                    </div>

                    <nav style={{ flex: 1 }}>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li 
                                className={`sidebar-link ${currentView === 'overview' ? 'active' : ''}`}
                                onClick={() => setCurrentView('overview')}
                            >
                                <span className="sidebar-icon">📊</span> Overview
                            </li>
                            <li 
                                className={`sidebar-link ${currentView === 'products' ? 'active' : ''}`}
                                onClick={() => setCurrentView('products')}
                            >
                                <span className="sidebar-icon">📦</span> Products
                            </li>
                            <li 
                                className={`sidebar-link ${currentView === 'orders' ? 'active' : ''}`}
                                onClick={() => setCurrentView('orders')}
                            >
                                <span className="sidebar-icon">📋</span> Orders
                            </li>
                            <li 
                                className={`sidebar-link ${currentView === 'settings' ? 'active' : ''}`}
                                onClick={() => setCurrentView('settings')}
                            >
                                <span className="sidebar-icon">⚙️</span> Settings
                            </li>
                        </ul>
                    </nav>

                    <div style={{ marginTop: 'auto', padding: '20px' }}>
                        <div style={{ marginBottom: '15px', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                            Logged in as:<br/>
                            <span style={{ color: 'white' }}>{user.email}</span>
                        </div>
                        <button onClick={handleLogout} className="admin-btn admin-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            🚪 Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    {renderView()}
                </main>
            </div>

            <style jsx>{`
                .sidebar-link {
                    padding: 14px 20px;
                    border-radius: 12px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--admin-text-muted);
                    font-weight: 500;
                }
                .sidebar-link:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .sidebar-link.active {
                    background: var(--admin-accent);
                    color: white;
                    box-shadow: 0 4px 15px var(--admin-accent-glow);
                }
                .sidebar-icon {
                    font-size: 1.1rem;
                }
                .admin-btn-outline {
                    background: transparent;
                    border: 1px solid var(--admin-border);
                    color: var(--admin-text);
                }
                .admin-btn-outline:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--admin-accent);
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
