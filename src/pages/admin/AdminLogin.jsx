import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import './AdminDashboard.css';

const AdminLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-root" style={{ alignItems: 'center', justifyContent: 'center' }}>

      {/* Background glow blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '15%', left: '20%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)',
        }} />
      </div>

      {/* Login Card */}
      <div className="admin-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '44px 40px',
        position: 'relative',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{
          width: '52px', height: '52px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent-2))',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 0 24px var(--admin-accent-glow)',
        }}>⚡</div>

        <h1 style={{
          fontSize: '1.4rem', fontWeight: 900, letterSpacing: '1.5px',
          color: 'white', marginBottom: '6px',
        }}>LINKMYRIDE</h1>
        <p style={{
          fontSize: '0.7rem', letterSpacing: '2px',
          color: 'var(--admin-text-muted)',
          marginBottom: '36px',
        }}>COMMAND CENTER — SECURE ACCESS</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>

          <div>
            <label className="admin-label">Email Address</label>
            <input
              type="email"
              placeholder="admin@linkmyride.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="admin-input"
            />
          </div>

          <div>
            <label className="admin-label">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="admin-input"
            />
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--admin-danger-bg)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: 'var(--admin-danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="admin-btn admin-btn-primary admin-btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }} />
                AUTHENTICATING
              </span>
            ) : 'SIGN IN'}
          </button>
        </form>

        <p style={{
          marginTop: '28px',
          fontSize: '0.68rem',
          color: 'var(--admin-text-muted)',
          letterSpacing: '0.5px',
        }}>
          Restricted access — authorised personnel only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
