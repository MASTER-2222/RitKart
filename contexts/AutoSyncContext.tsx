'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AutoSyncContextType {
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: Date | null;
  syncUserData: () => Promise<void>;
  syncSystemHealth: () => Promise<SystemHealth | null>;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  checks: Array<{
    component: string;
    status: 'healthy' | 'error';
    message: string;
  }>;
}

const AutoSyncContext = createContext<AutoSyncContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001/api';

export function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Automatically check system health on mount
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auto-sync/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('🎉 Auto-sync system is healthy:', data);
        }
      } catch (error) {
        console.error('❌ Auto-sync system health check failed:', error);
      }
    };

    checkSystemHealth();
  }, []);

  // Sync user data between Supabase Auth and local database
  const syncUserData = async (): Promise<void> => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      // Get admin token from cookie or local storage
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_session='))
        ?.split('=')[1];

      if (!adminToken) {
        throw new Error('Admin authentication required for user sync');
      }

      const response = await fetch(`${API_BASE_URL}/auto-sync/sync-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        console.log('✅ User sync completed:', data.data);
      } else {
        throw new Error(data.message || 'User sync failed');
      }
    } catch (error) {
      console.error('❌ User sync error:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Check system health
  const syncSystemHealth = async (): Promise<SystemHealth | null> => {
    try {
      // Get admin token from cookie or local storage
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_session='))
        ?.split('=')[1];

      if (!adminToken) {
        // Public health check
        const response = await fetch(`${API_BASE_URL}/auto-sync/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.data;
        }
        return null;
      }

      // Detailed admin health check
      const response = await fetch(`${API_BASE_URL}/auto-sync/system-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      return null;
    } catch (error) {
      console.error('❌ System health check error:', error);
      return null;
    }
  };

  return (
    <AutoSyncContext.Provider value={{
      isSyncing,
      syncStatus,
      lastSyncTime,
      syncUserData,
      syncSystemHealth
    }}>
      {children}
    </AutoSyncContext.Provider>
  );
}

export function useAutoSync() {
  const context = useContext(AutoSyncContext);
  if (context === undefined) {
    throw new Error('useAutoSync must be used within an AutoSyncProvider');
  }
  return context;
}