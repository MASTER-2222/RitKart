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
  username: string;
  email: string;
  name: string;
  role: string;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Default admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin@ritzone.com',
  password: 'RitZone@Admin2025!',
  user: {
    username: 'admin@ritzone.com',
    email: 'admin@ritzone.com',
    name: 'Rit Mukherjee',
    role: 'Super Admin'
  }
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Check for remember me token in localStorage
        const rememberToken = localStorage.getItem('admin_remember_token');
        const sessionToken = sessionStorage.getItem('admin_session_token');
        
        if (rememberToken || sessionToken) {
          // Validate token (in real app, you'd verify with backend)
          const storedUser = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setAdminUser(user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('admin_remember_token');
        localStorage.removeItem('admin_user');
        sessionStorage.removeItem('admin_session_token');
        sessionStorage.removeItem('admin_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      // Validate credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Generate a simple token (in real app, this would come from backend)
        const token = `admin_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        
        // Store authentication data
        const storage = rememberMe ? localStorage : sessionStorage;
        const tokenKey = rememberMe ? 'admin_remember_token' : 'admin_session_token';
        
        storage.setItem(tokenKey, token);
        storage.setItem('admin_user', JSON.stringify(ADMIN_CREDENTIALS.user));
        
        // If remember me is checked, also store in localStorage for persistence
        if (rememberMe) {
          localStorage.setItem('admin_remember_me', 'true');
        }
        
        setAdminUser(ADMIN_CREDENTIALS.user);
        setIsAuthenticated(true);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('admin_remember_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_remember_me');
    sessionStorage.removeItem('admin_session_token');
    sessionStorage.removeItem('admin_user');
    
    setAdminUser(null);
    setIsAuthenticated(false);
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