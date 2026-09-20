import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Shield, User, Smartphone, Lock, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const { login, error } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setFormError('Please enter your ID or Phone Number');
      return;
    }
    if (!password.trim()) {
      setFormError('Please enter your Password');
      return;
    }

    setFormError('');
    setIsLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setFormError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setFormError('');
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-elevated)',
        position: 'relative'
      }}>
        {/* Accent Top Border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '24px',
          right: '24px',
          height: '3px',
          background: 'linear-gradient(90deg, var(--accent-coral), var(--accent-indigo))',
          borderRadius: 'var(--radius-full)'
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: 'var(--bg-dark)',
            color: '#FFF',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4) auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: '2.4rem',
            lineHeight: 1.1,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-2)'
          }}>
            CALC // CORE
          </h2>
          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            Sign in with your assigned ID or registered phone number to calculate wholesale rates.
          </p>
        </div>

        {(formError || error) && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#B91C1C',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'var(--space-4)'
          }}>
            <AlertCircle size={16} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '6px'
            }}>
              User ID / Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. admin or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoFocus
              />
              <User size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Access Calculator'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        <div style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-5)',
          borderTop: '1px dashed var(--border-subtle)'
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: 'var(--space-3)',
            letterSpacing: '0.05em'
          }}>
            Quick Demo Accounts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('admin', 'admin')}
              style={{ fontSize: '0.72rem', flexDirection: 'column', padding: '6px 4px' }}
            >
              <Shield size={12} color="var(--accent-coral)" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('user101', 'user123')}
              style={{ fontSize: '0.72rem', flexDirection: 'column', padding: '6px 4px' }}
            >
              <User size={12} color="var(--accent-indigo)" />
              <span>User 101</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillQuickDemo('9876543210', 'password')}
              style={{ fontSize: '0.72rem', flexDirection: 'column', padding: '6px 4px' }}
            >
              <Smartphone size={12} color="var(--accent-sage)" />
              <span>Phone</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
