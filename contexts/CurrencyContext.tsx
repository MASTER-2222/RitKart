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

export interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  // Current selected currency
  selectedCurrency: Currency;
  
  // Available currencies
  currencies: Currency[];
  
  // Exchange rates (base: INR)
  exchangeRates: ExchangeRates;
  
  // Functions
  setCurrency: (currency: Currency) => void;
  convertPrice: (amount: number, fromCurrency?: string) => number;
  formatPrice: (amount: number, currency?: Currency) => string;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
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
// 🏭 CURRENCY PROVIDER
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
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==============================================
  // 🚀 INITIALIZE CURRENCY DATA
  // ==============================================
  useEffect(() => {
    initializeCurrencyData();
    loadUserCurrencyPreference();
  }, []);

  const initializeCurrencyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get API base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                        (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');

      // Fetch currencies and exchange rates
      const [currenciesResponse, ratesResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/currency/currencies`),
        fetch(`${apiBaseUrl}/currency/rates`)
      ]);

      if (!currenciesResponse.ok || !ratesResponse.ok) {
        throw new Error('Failed to fetch currency data');
      }

      const currenciesData = await currenciesResponse.json();
      const ratesData = await ratesResponse.json();

      if (currenciesData.success && ratesData.success) {
        setCurrencies(currenciesData.data);
        setExchangeRates(ratesData.data.rates);
      } else {
        throw new Error('Invalid response from currency API');
      }
    } catch (err) {
      console.error('❌ Error initializing currency data:', err);
      setError('Failed to load currency data');
      
      // Set fallback data
      setCurrencies([defaultCurrency]);
      setExchangeRates({ INR: 1 });
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
        }
      }
    } catch (err) {
      console.error('❌ Error loading currency preference:', err);
    }
  };

  // ==============================================
  // 💱 SET CURRENCY
  // ==============================================
  const setCurrency = (currency: Currency) => {
    try {
      setSelectedCurrency(currency);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('ritzone_selected_currency', JSON.stringify(currency));
      }
      
      console.log(`✅ Currency changed to: ${currency.code} (${currency.symbol})`);
    } catch (err) {
      console.error('❌ Error setting currency:', err);
    }
  };

  // ==============================================
  // 🔄 CONVERT PRICE
  // ==============================================
  const convertPrice = (amount: number, fromCurrency: string = 'INR'): number => {
    try {
      if (!amount || typeof amount !== 'number') {
        return 0;
      }

      if (fromCurrency === selectedCurrency.code) {
        return amount;
      }

      if (!exchangeRates[fromCurrency] || !exchangeRates[selectedCurrency.code]) {
        console.warn(`❌ Exchange rate not found for ${fromCurrency} or ${selectedCurrency.code}`);
        return amount;
      }

      // Convert from source currency to INR, then to target currency
      const amountInINR = fromCurrency === 'INR' ? amount : amount / exchangeRates[fromCurrency];
      const convertedAmount = selectedCurrency.code === 'INR' ? amountInINR : amountInINR * exchangeRates[selectedCurrency.code];

      // Round to 2 decimal places
      return Math.round(convertedAmount * 100) / 100;
    } catch (err) {
      console.error('❌ Error converting price:', err);
      return amount;
    }
  };

  // ==============================================
  // 🏷️ FORMAT PRICE
  // ==============================================
  const formatPrice = (amount: number, currency: Currency = selectedCurrency): string => {
    try {
      if (!amount || typeof amount !== 'number') {
        return `${currency.symbol}0`;
      }

      // Format number with appropriate decimal places
      const decimals = currency.code === 'JPY' ? 0 : 2;
      const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });

      return `${currency.symbol}${formattedAmount}`;
    } catch (err) {
      console.error('❌ Error formatting price:', err);
      return `${currency.symbol}${amount}`;
    }
  };

  // ==============================================
  // 🎯 CONTEXT VALUE
  // ==============================================
  const contextValue: CurrencyContextType = {
    selectedCurrency,
    currencies,
    exchangeRates,
    setCurrency,
    convertPrice,
    formatPrice,
    isLoading,
    error
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};