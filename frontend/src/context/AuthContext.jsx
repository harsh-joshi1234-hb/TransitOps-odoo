import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    const storedUser = localStorage.getItem('transitops_user');
    
    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('transitops_token', token);
    localStorage.setItem('transitops_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
