import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('askuni_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem('askuni_access_token', data.access);
    localStorage.setItem('askuni_refresh_token', data.refresh);
    localStorage.setItem('askuni_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser(name, email, password);
    localStorage.setItem('askuni_access_token', data.access);
    localStorage.setItem('askuni_refresh_token', data.refresh);
    localStorage.setItem('askuni_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('askuni_user');
    localStorage.removeItem('askuni_access_token');
    localStorage.removeItem('askuni_refresh_token');
  }, []);

  const isAuthenticated = user !== null;

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
