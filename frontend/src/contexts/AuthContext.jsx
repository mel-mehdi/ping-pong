import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getItem, setItem, removeItem } from '../utils/storage';
import { normalizeUserData } from '../utils/helpers';
import apiClient from '../utils/api';

const AuthContext = createContext(undefined);

const parseStoredData = (storedData) => {
  try {
    return JSON.parse(storedData);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkBackendAuth = async () => {
    try {
      const me = await apiClient.getMe();
      if (me) {
        setIsBackendAuthenticated(true);
        const normalized = normalizeUserData(me);
        setUserData((prev) => ({ ...(prev || {}), ...normalized }));
        setItem(STORAGE_KEYS.USER_DATA, { ...(userData || {}), ...normalized });
        return true;
      }
    } catch {
      // swallow — getMe already handles auth failures silently
    }
    setIsBackendAuthenticated(false);
    return false;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUserData = getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedUserData) {
        setUserData(storedUserData);
        setIsAuthenticated(true);

        const parsed = parseStoredData(storedUserData);
        const hasToken = parsed && (parsed.token || parsed.access);
        
        if (hasToken) {
          try {
            const me = await apiClient.getMe();
            if (me) {
              setIsBackendAuthenticated(true);
              const normalized = normalizeUserData(me);
              setUserData(normalized);
              setIsAuthenticated(true);
              setItem(STORAGE_KEYS.USER_DATA, normalized);
            }
          } catch {
            setIsBackendAuthenticated(false);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (data) => {
    const normalized = normalizeUserData(data);
    setUserData(normalized);
    setIsAuthenticated(true);
    setItem(STORAGE_KEYS.USER_DATA, normalized);
  };

  const updateUser = (data) => {
    const normalized = normalizeUserData(data);
    setUserData(normalized);
    setItem(STORAGE_KEYS.USER_DATA, normalized);
  };

  const logout = () => {
    setUserData(null);
    setIsAuthenticated(false);
    setIsBackendAuthenticated(false);
    removeItem(STORAGE_KEYS.USER_DATA);
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isBackendAuthenticated,
        userData,
        login,
        updateUser,
        logout,
        checkBackendAuth,
      }}
    >
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
