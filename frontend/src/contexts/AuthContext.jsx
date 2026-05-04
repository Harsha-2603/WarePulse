import React, { createContext, useState, useContext } from 'react';
import { userMock } from '../mockData/userMock';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (useMock) {
      return userMock;
    } else {
      return {  
        name: '',
        email: '',
        role: '',
        isAuthenticated: false,
      };
    }
  });

  const login = (credentials) => {
    // Mock login
    setUser({
      name: 'Admin User',
      email: credentials.email,
      role: 'admin',
      isAuthenticated: true,
    });
  };

  const logout = () => {
    setUser({
      name: '',
      email: '',
      role: '',
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
