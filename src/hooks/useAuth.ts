import { useState, useEffect } from 'react';
import { authApi, User } from '../services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('dreamers-auth-token');
      const userData = localStorage.getItem('dreamers-user-data');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('dreamers-auth-token');
          localStorage.removeItem('dreamers-user-data');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(username, password);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('dreamers-auth-token', token);
        localStorage.setItem('dreamers-user-data', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('dreamers-auth-token');
      localStorage.removeItem('dreamers-user-data');
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      if (response.data.success && response.data.data) {
        localStorage.setItem('dreamers-auth-token', response.data.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshToken
  };
};