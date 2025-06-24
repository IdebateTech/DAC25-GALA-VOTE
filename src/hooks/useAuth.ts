import { useState, useEffect } from 'react';

interface AdminCredentials {
  username: string;
  password: string;
}

// Secure admin credentials (in production, this would be handled by a proper backend)
const ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'dreamers_admin',
  password: 'DAC2025_Gala_Admin!'
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('dreamers-admin-token');
      const authExpiry = localStorage.getItem('dreamers-admin-expiry');
      
      if (authToken && authExpiry) {
        const expiryTime = parseInt(authExpiry);
        const currentTime = Date.now();
        
        if (currentTime < expiryTime) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('dreamers-admin-token');
          localStorage.removeItem('dreamers-admin-expiry');
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = btoa(`${username}:${Date.now()}`);
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      localStorage.setItem('dreamers-admin-token', token);
      localStorage.setItem('dreamers-admin-expiry', expiry.toString());
      
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('dreamers-admin-token');
    localStorage.removeItem('dreamers-admin-expiry');
    setIsAuthenticated(false);
    
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  const extendSession = () => {
    if (isAuthenticated) {
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // Extend by 24 hours
      localStorage.setItem('dreamers-admin-expiry', expiry.toString());
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    extendSession
  };
};