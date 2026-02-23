import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  const clearAuth = ({ redirect = true } = {}) => {
    setUserData(null);
    setIsAuthenticated(false);
    setIsBackendAuthenticated(false);
    removeItem(STORAGE_KEYS.USER_DATA);
    if (redirect) {
      try {
        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          navigate('/login');
        }
      } catch (e) {
        // ignore navigation errors
      }
    }
  };

  const checkBackendAuth = async () => {
    try {
      // Use request directly so we can catch HTTP errors (e.g., 403)
      const me = await apiClient.request('/users/me/');
      if (me) {
        setIsBackendAuthenticated(true);
        const normalized = normalizeUserData(me);
        setUserData((prev) => ({ ...(prev || {}), ...normalized }));
        setItem(STORAGE_KEYS.USER_DATA, { ...(userData || {}), ...normalized });
        return true;
      }
      setIsBackendAuthenticated(false);
      return false;
    } catch (err) {
      // If backend explicitly forbids access (e.g., 403), clear local auth state
      if (err?.status === 403) {
        clearAuth({ redirect: true });
        return false;
      }
      setIsBackendAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUserData = getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedUserData) {
        setUserData(storedUserData);
        setIsAuthenticated(true);

        // Verify backend auth with session cookie in background (quiet to avoid noisy errors during startup)
        try {
          // Use a quiet request so transient proxy/startup errors (502) don't spam the console
          const me = await apiClient.request('/users/me/', { quiet: true });
          if (me) {
            const normalized = normalizeUserData(me);
            setUserData(normalized);
            setItem(STORAGE_KEYS.USER_DATA, normalized);
            // Only mark backend-authenticated after a successful /users/me fetch
            setIsBackendAuthenticated(true);
          } else {
            setIsBackendAuthenticated(false);
          }
        } catch (err) {
          if (err?.status === 403) {
            // Backend forbids access — fully clear auth and redirect to login
            clearAuth({ redirect: true });
          } else {
            // Transient error (network/proxy). Keep local auth and mark backend as unauthenticated;
            // the app will retry or the user will re-authenticate when backend is reachable.
            setIsBackendAuthenticated(false);
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data) => {
    const normalized = normalizeUserData(data);
    setUserData(normalized);
    setIsAuthenticated(true);
    setItem(STORAGE_KEYS.USER_DATA, normalized);
    
    // Since the backend uses session authentication, a successful login
    // means the session cookie was set, so we're backend authenticated
    setIsBackendAuthenticated(true);
    
    // Verify backend auth in background to update user data
    checkBackendAuth().catch(() => {});
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
