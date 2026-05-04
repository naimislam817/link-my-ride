import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import './AdminDashboard.css';

const AdminSettings = () => {
    const { deliverySettings, updateDeliverySettings, settingsError } = useShop();
    const [insideFee, setInsideFee] = useState(60);
    const [outsideFee, setOutsideFee] = useState(100);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (deliverySettings) {
            setInsideFee(deliverySettings.inside || 60);
            setOutsideFee(deliverySettings.outside || 100);
        }
    }, [deliverySettings]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        const res = await updateDeliverySettings(insideFee, outsideFee);
        if (res.success) {
            setMessage('Settings updated successfully!');
        } else {
            setMessage(`Failed to update: ${res.error}`);
        }
        setIsSaving(false);
    };

    return (
        <div className="admin-overview animate-fade-in">
            <h1 className="admin-page-title" style={{ marginBottom: '32px' }}>
                SYSTEM <span style={{ color: 'var(--admin-accent)' }}>SETTINGS</span>
            </h1>

            {settingsError && settingsError.includes('relation "public.settings" does not exist') && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--admin-danger)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ color: 'var(--admin-danger)', marginBottom: '10px' }}>⚠️ Database Setup Required</h3>
                    <p style={{ color: 'var(--admin-text-muted)', marginBottom: '15px' }}>
                        The <strong>settings</strong> table doesn't exist in your Supabase database. To enable this feature, please copy and paste the following SQL command into your Supabase SQL Editor and run it:
                    </p>
                    <pre style={{ background: '#000', padding: '15px', borderRadius: '5px', overflowX: 'auto', color: '#fff', fontSize: '0.85rem' }}>
{`CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

INSERT INTO public.settings (key, value) 
VALUES ('delivery', '{"inside": 60, "outside": 100}');`}
                    </pre>
                </div>
            )}

            <div className="admin-card" style={{ maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '20px' }}>Delivery Charges configuration</h3>
                
                <form onSubmit={handleSave} className="admin-form">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <label className="metric-label">Inside Dhaka Charge (TK)</label>
                            <input 
                                type="number" 
                                className="admin-input" 
                                value={insideFee} 
                                onChange={e => setInsideFee(e.target.value)} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="metric-label">Outside Dhaka Charge (TK)</label>
                            <input 
                                type="number" 
                                className="admin-input" 
                                value={outsideFee} 
                                onChange={e => setOutsideFee(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
                        {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    
                    {message && (
                        <p style={{ marginTop: '15px', color: message.includes('Failed') ? 'var(--admin-danger)' : 'var(--admin-success)', fontSize: '0.9rem' }}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
