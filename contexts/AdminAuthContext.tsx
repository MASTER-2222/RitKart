'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token?: string;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auto-sync/auth/validate`, {
          method: 'GET',
          credentials: 'include', // This will include cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setAdminUser({
              id: data.user.id,
              username: data.user.email,
              email: data.user.email,
              fullName: data.user.fullName,
              role: data.user.role,
              token: data.sessionToken || data.user.token
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-sync/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: username,
          password,
          rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAdminUser({
          id: data.user.id,
          username: data.user.email,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
          token: data.sessionToken
        });
        setIsAuthenticated(true);
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auto-sync/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setAdminUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      isAuthenticated,
      adminUser,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}