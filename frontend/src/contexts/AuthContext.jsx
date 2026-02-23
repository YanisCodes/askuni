import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../services/api';
import { USERS } from '../data/mockData';

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

  const [registeredUsers, setRegisteredUsers] = useState([]);

  const login = useCallback(async (email, password) => {
    const allUsers = [...USERS, ...registeredUsers];
    const loggedInUser = loginUser(email, password, allUsers);
    setUser(loggedInUser);
    localStorage.setItem('askuni_user', JSON.stringify(loggedInUser));
    return loggedInUser;
  }, [registeredUsers]);

  const register = useCallback(async (name, email, password) => {
    const allUsers = [...USERS, ...registeredUsers];
    const newUser = registerUser(name, email, password, allUsers);
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('askuni_user', JSON.stringify(newUser));
    return newUser;
  }, [registeredUsers]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('askuni_user');
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
