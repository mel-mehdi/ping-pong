import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getItem, setItem, removeItem } from '../utils/storage';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = getItem(STORAGE_KEYS.USER_DATA);
    if (storedUserData) {
      setUserData(storedUserData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    setItem(STORAGE_KEYS.USER_DATA, data);
  };

  const logout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    removeItem(STORAGE_KEYS.USER_DATA);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
