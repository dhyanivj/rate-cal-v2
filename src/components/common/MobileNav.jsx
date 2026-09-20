import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calculator, ShieldCheck, LogOut, Grid } from 'lucide-react';

export default function MobileNav({ currentMode, onToggleMode }) {
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={`mobile-nav-item ${currentMode === 'user' ? 'active' : ''}`}
        onClick={() => onToggleMode('user')}
      >
        <Calculator size={18} />
        <span>Calculator</span>
      </button>

      {isAdmin && (
        <button
          type="button"
          className={`mobile-nav-item ${currentMode === 'admin' ? 'active' : ''}`}
          onClick={() => onToggleMode('admin')}
        >
          <ShieldCheck size={18} />
          <span>Admin</span>
        </button>
      )}

      <button
        type="button"
        className="mobile-nav-item"
        onClick={logout}
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </nav>
  );
}
