import React, { useEffect, useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminLogin from './AdminLogin';
import AdminSettings from './AdminSettings';
import AdminOverview from './AdminOverview';
import AdminGifts from './AdminGifts';
import AdminOffers from './AdminOffers';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',    icon: '▦' },
  { id: 'orders',    label: 'Orders',      icon: '◈' },
  { id: 'products',  label: 'Products',    icon: '⬡' },
  { id: 'gifts',     label: 'Gift Items',  icon: '🎁' },
  { id: 'offers',    label: 'Offers',      icon: '🏷️' },
  { id: 'settings',  label: 'Settings',    icon: '⚙' },
];

const PAGE_TITLES = {
  overview:  'System Overview',
  orders:    'Order Management',
  products:  'Product Catalog',
  gifts:     'Gift Items',
  offers:    'Current Offers',
  settings:  'System Settings',
};

const AdminLayout = () => {
  const [user, setUser]               = useState(null);
  const [currentView, setCurrentView] = useState('overview');
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':  return <AdminOverview />;
      case 'products':  return <AdminProducts />;
      case 'orders':    return <AdminOrders />;
      case 'gifts':     return <AdminGifts />;
      case 'offers':    return <AdminOffers />;
      case 'settings':  return <AdminSettings />;
      default:          return <AdminOverview />;
    }
  };

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? 'A';
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  if (loadingAuth) return <div className="admin-loading">Authenticating…</div>;
  if (!user)       return <AdminLogin />;

  return (
    <div className="admin-root">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">⚡</div>
          <div className="admin-logo-text">
            <span className="admin-logo-name">LINKMYRIDE</span>
            <span className="admin-logo-sub">Command Center</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Navigation</div>
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`admin-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          {/* Clock widget */}
          <div style={{
            marginTop: '28px',
            padding: '14px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--admin-border)',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '2px',
              lineHeight: 1,
              marginBottom: '4px',
            }}>{formattedTime}</div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--admin-text-muted)',
              letterSpacing: '1px',
            }}>{formattedDate}</div>
          </div>
        </nav>

        {/* User footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">{avatarLetter}</div>
            <div className="admin-user-info">
              <div className="admin-user-role">Administrator</div>
              <div className="admin-user-email">{user.email}</div>
            </div>
          </div>
          <button
            className="admin-btn admin-btn-outline"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
          >
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-title">{PAGE_TITLES[currentView]}</span>
            <span className="admin-topbar-breadcrumb">
              admin / {currentView}
            </span>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-status-dot">SYSTEM ONLINE</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
