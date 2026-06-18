import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, getMeRequest } from '../services/authService.js';
import { setToken, clearToken, getToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, try to restore the session.
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMeRequest();
        setUser(data.user);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // When any token-protected request returns 401, api.js dispatches this event.
  // Clearing the user makes ProtectedRoute redirect to /login automatically.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
