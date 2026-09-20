import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import MobileNav from './components/common/MobileNav';
import LoginView from './components/auth/LoginView';
import UserCalculatorView from './components/user/UserCalculatorView';
import AdminDashboard from './components/admin/AdminDashboard';
import Toast from './components/common/Toast';

export default function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [currentMode, setCurrentMode] = useState('user'); // 'user' | 'admin'
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        Initializing CALC//CORE System...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="app-container">
      <Header
        currentMode={currentMode}
        onToggleMode={(mode) => setCurrentMode(mode)}
      />

      <main>
        {currentMode === 'user' || !isAdmin ? (
          <UserCalculatorView onNotify={showNotification} />
        ) : (
          <AdminDashboard onNotify={showNotification} />
        )}
      </main>

      <MobileNav
        currentMode={currentMode}
        onToggleMode={(mode) => setCurrentMode(mode)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
