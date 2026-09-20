import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check existing session
    const session = db.getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (id, password) => {
    setError(null);
    try {
      const user = await db.authenticate(id, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message || "Failed to authenticate");
      throw err;
    }
  };

  const logout = () => {
    db.clearSession();
    setCurrentUser(null);
    setError(null);
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
