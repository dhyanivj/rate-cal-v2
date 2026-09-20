import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sliders, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function Header({ currentMode, onToggleMode }) {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <header className="app-header">
      <div className="brand-area">
        <div className="brand-badge" title="Rate Calculator Engine">
          <Sparkles size={20} />
        </div>
        <div className="brand-title">
          <h1>CALC // CORE</h1>
          <span>Textile & Marketplace Engine</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Mode Switcher for Admins */}
        {isAdmin && (
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${currentMode === 'user' ? 'active' : ''}`}
              onClick={() => onToggleMode('user')}
              title="Calculator View"
            >
              <Sliders size={14} />
              <span>Calculator</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${currentMode === 'admin' ? 'active' : ''}`}
              onClick={() => onToggleMode('admin')}
              title="Admin Control Center"
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
          </div>
        )}

        {/* User Pill */}
        <div className="user-status-pill">
          <span className="user-status-indicator"></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{currentUser?.id}</span>
          {currentUser?.role === 'admin' ? (
            <span className="admin-badge">Admin</span>
          ) : null}
        </div>

        {/* Logout */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={logout}
          title="Sign Out"
          style={{ padding: '6px 10px' }}
        >
          <LogOut size={16} />
          <span style={{ display: 'none' }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
