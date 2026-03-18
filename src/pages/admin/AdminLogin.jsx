import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setErrorMsg(error.message);
        } else if (data.session) {
            onLogin(data.session);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="email" 
                        placeholder="Admin Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                    {errorMsg && <p style={{ color: '#e74c3c', fontSize: '0.9rem' }}>{errorMsg}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
