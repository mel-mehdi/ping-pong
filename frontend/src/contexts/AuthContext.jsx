import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { getItem, setItem, removeItem } from '../utils/storage';
import apiClient from '../utils/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserData = getItem(STORAGE_KEYS.USER_DATA);
    if (storedUserData) {
      setUserData(storedUserData);
      setIsAuthenticated(true);
    }

    // Check backend auth only if stored user data contains a token (avoid noisy unauthenticated calls)
    if (storedUserData) {
      const parsed = (() => {
        try {
          return JSON.parse(storedUserData);
        } catch (e) {
          return null;
        }
      })();

      const hasToken = parsed && (parsed.token || parsed.access);
      if (hasToken) {
        (async () => {
          try {
            const me = await apiClient.getMe();
            if (me) {
              setIsBackendAuthenticated(true);
              // update userData with backend normalized id info if available
              if (!storedUserData && me) {
                const normalized = { ...me };
                if (!normalized.userId && normalized.id) normalized.userId = normalized.id;
                setUserData(normalized);
                setIsAuthenticated(true);
                setItem(STORAGE_KEYS.USER_DATA, normalized);
              }
            }
          } catch (err) {
            // Not logged in to backend
            setIsBackendAuthenticated(false);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        // No token present — don't probe backend automatically
        setLoading(false);
      }
    } else {
      // No stored user — skip backend check
      setLoading(false);
    }
  }, []);

  const login = (data) => {
    const normalized = { ...data };
    if (!normalized.userId && normalized.id) {
      normalized.userId = normalized.id;
    }
    setUserData(normalized);
    setIsAuthenticated(true);
    setItem(STORAGE_KEYS.USER_DATA, normalized);

    // Don't auto-check backend here; provide an explicit check users can trigger
  };

  const checkBackendAuth = async () => {
    try {
      const me = await apiClient.getMe();
      if (me) {
        setIsBackendAuthenticated(true);
        // Merge/normalize backend profile into stored userData if helpful
        const normalized = { ...me };
        if (!normalized.userId && normalized.id) normalized.userId = normalized.id;
        setUserData((prev) => ({ ...(prev || {}), ...normalized }));
        setItem(STORAGE_KEYS.USER_DATA, (prev) => ({ ...(prev || {}), ...normalized }));
        return true;
      }
    } catch (err) {
      // swallow — getMe already handles auth failures silently
    }
    setIsBackendAuthenticated(false);
    return false;
  };

  const updateUser = (data) => {
    const normalized = { ...data };
    if (!normalized.userId && normalized.id) normalized.userId = normalized.id;
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
