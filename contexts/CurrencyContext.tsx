'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ==============================================
// 🌍 CURRENCY CONTEXT TYPES
// ==============================================
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
}

interface CurrencyContextType {
  // Current selected currency
  selectedCurrency: Currency;
  
  // Available currencies
  currencies: Currency[];
  
  // Functions
  setCurrency: (currency: Currency) => void;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // API Helper - NEW: For backend requests with currency
  getApiUrl: (endpoint: string) => string;
}

// ==============================================
// 🎯 CURRENCY CONTEXT
// ==============================================
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ==============================================
// 🔗 CURRENCY HOOK
// ==============================================
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// ==============================================
// 🏭 CURRENCY PROVIDER - COMPLETELY REWRITTEN FOR BACKEND INTEGRATION
// ==============================================
interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  // Default currency is INR as per requirement
  const defaultCurrency: Currency = {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳'
  };

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(defaultCurrency);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // 🚀 INITIALIZE CURRENCY DATA FROM BACKEND
  // ==============================================
  useEffect(() => {
    initializeCurrencyData();
    loadUserCurrencyPreference();
  }, []);

  const getBackendUrl = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 
           (typeof window !== 'undefined' ? 'http://localhost:8001/api' : '/api');
  };

  const initializeCurrencyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading currencies from backend...');
      
      // Get API base URL
      const apiBaseUrl = getBackendUrl();

      // Fetch available currencies from backend
      const currenciesResponse = await fetch(`${apiBaseUrl}/currency/currencies`);

      if (!currenciesResponse.ok) {
        throw new Error('Failed to fetch currencies from backend');
      }

      const currenciesData = await currenciesResponse.json();

      if (currenciesData.success) {
        setCurrencies(currenciesData.data);
        console.log(`✅ Loaded ${currenciesData.data.length} currencies from backend`);
      } else {
        throw new Error('Invalid response from currency API');
      }
    } catch (err) {
      console.error('❌ Error initializing currency data:', err);
      setError('Failed to load currency data from backend');
      
      // Set fallback data
      const fallbackCurrencies = [
        defaultCurrency,
        { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', flag: '🇺🇸' },
        { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', flag: '🇪🇺' },
        { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺' }
      ];
      setCurrencies(fallbackCurrencies);
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================================
  // 💾 LOAD USER CURRENCY PREFERENCE
  // ==============================================
  const loadUserCurrencyPreference = () => {
    try {
      if (typeof window !== 'undefined') {
        const savedCurrency = localStorage.getItem('ritzone_selected_currency');
        if (savedCurrency) {
          const parsedCurrency = JSON.parse(savedCurrency);
          setSelectedCurrency(parsedCurrency);
          console.log(`✅ Loaded saved currency: ${parsedCurrency.code}`);
        }
      }
    } catch (err) {
      console.error('❌ Error loading currency preference:', err);
    }
  };

  // ==============================================
  // 💱 SET CURRENCY - COMPLETELY UPDATED
  // ==============================================
  const setCurrency = (currency: Currency) => {
    try {
      console.log(`🔄 Switching currency from ${selectedCurrency.code} to ${currency.code}...`);
      
      setSelectedCurrency(currency);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ritzone_selected_currency', JSON.stringify(currency));
      }
      
      console.log(`✅ Currency changed to: ${currency.code} (${currency.symbol})`);
      console.log('📋 NOTE: Prices will be fetched from backend with new currency on next API call');
      
      // Trigger a page refresh or re-fetch data to get new prices from backend
      // This ensures all components get updated prices in the new currency
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // Dispatch custom event to notify components about currency change
          window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { newCurrency: currency }
          }));
        }
      }, 100);
      
    } catch (err) {
      console.error('❌ Error setting currency:', err);
    }
  };

  // ==============================================
  // 🔗 NEW: GET API URL WITH CURRENCY PARAMETER
  // ==============================================
  const getApiUrl = (endpoint: string): string => {
    const apiBaseUrl = getBackendUrl();
    const separator = endpoint.includes('?') ? '&' : '?';
    const currencyParam = selectedCurrency.code !== 'INR' ? `${separator}currency=${selectedCurrency.code}` : '';
    
    const fullUrl = `${apiBaseUrl}${endpoint}${currencyParam}`;
    console.log(`🔗 API URL with currency: ${fullUrl}`);
    
    return fullUrl;
  };

  // ==============================================
  // 🎯 CONTEXT VALUE - SIMPLIFIED FOR BACKEND INTEGRATION
  // ==============================================
  const contextValue: CurrencyContextType = {
    selectedCurrency,
    currencies,
    setCurrency,
    getApiUrl,
    isLoading,
    error
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};