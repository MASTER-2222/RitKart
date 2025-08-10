// Currency Service
// ==============================================
// Handles REAL-TIME currency conversion rates and operations

const axios = require('axios');

// ==============================================
// 💰 SUPPORTED CURRENCIES
// ==============================================
const SUPPORTED_CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    country: 'United States',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    country: 'European Union',
    flag: '🇪🇺'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    country: 'United Kingdom',
    flag: '🇬🇧'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    country: 'Canada',
    flag: '🇨🇦'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    country: 'Japan',
    flag: '🇯🇵'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺'
  }
};

// ==============================================
// 🌐 REAL-TIME EXCHANGE RATE APIs
// ==============================================
const EXCHANGE_RATE_APIs = [
  {
    name: 'ExchangeRate-API',
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
    free: true,
    rateLimit: '1500 requests/month'
  },
  {
    name: 'Fixer.io',
    baseUrl: 'http://data.fixer.io/api/latest',
    free: true,
    rateLimit: '100 requests/month'
  },
  {
    name: 'Open Exchange Rates',
    baseUrl: 'https://openexchangerates.org/api/latest.json',
    free: true,
    rateLimit: '1000 requests/month'
  }
];

// ==============================================
// 💾 CACHE FOR EXCHANGE RATES
// ==============================================
let CACHED_RATES = null;
let CACHE_TIMESTAMP = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// ==============================================
// 🌍 GET SUPPORTED CURRENCIES
// ==============================================
function getCurrencies() {
  return Object.values(SUPPORTED_CURRENCIES);
}

// ==============================================
// 🔄 FETCH LIVE EXCHANGE RATES FROM INTERNET
// ==============================================
async function fetchLiveExchangeRates(baseCurrency = 'INR') {
  try {
    console.log(`📡 Fetching live exchange rates for base currency: ${baseCurrency}`);
    
    // Try multiple APIs for redundancy
    const apis = [
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      `https://api.freeforexapi.com/api/live?pairs=${baseCurrency}USD,${baseCurrency}EUR,${baseCurrency}GBP,${baseCurrency}CAD,${baseCurrency}JPY,${baseCurrency}AUD`
    ];
    
    for (const apiUrl of apis) {
      try {
        console.log(`🌐 Trying API: ${apiUrl}`);
        const response = await axios.get(apiUrl, { timeout: 10000 });
        
        if (response.data && response.data.rates) {
          console.log(`✅ Successfully fetched live rates from ${apiUrl}`);
          return response.data.rates;
        }
      } catch (apiError) {
        console.warn(`⚠️ API ${apiUrl} failed:`, apiError.message);
        continue;
      }
    }
    
    // If all APIs fail, try a backup approach
    console.log('🔄 Trying backup method...');
    return await fetchBackupExchangeRates(baseCurrency);
    
  } catch (error) {
    console.error('❌ All APIs failed, using fallback rates:', error.message);
    throw new Error('Unable to fetch live exchange rates');
  }
}

// ==============================================
// 🛡️ BACKUP EXCHANGE RATE FETCH
// ==============================================
async function fetchBackupExchangeRates(baseCurrency = 'INR') {
  try {
    // Use a different approach - fetch USD rates and convert
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 10000 });
    
    if (response.data && response.data.rates) {
      const usdRates = response.data.rates;
      
      // Convert to INR base if needed
      if (baseCurrency === 'INR') {
        const inrRate = usdRates.INR;
        const convertedRates = {};
        
        // Convert all rates to INR base
        for (const [currency, rate] of Object.entries(usdRates)) {
          if (currency === 'INR') {
            convertedRates[currency] = 1.0;
          } else {
            convertedRates[currency] = rate / inrRate;
          }
        }
        
        console.log(`✅ Backup method successful, INR rate: 1 USD = ${inrRate} INR`);
        return convertedRates;
      }
      
      return usdRates;
    }
    
    throw new Error('Backup API also failed');
  } catch (error) {
    console.error('❌ Backup exchange rate fetch failed:', error.message);
    throw error;
  }
}

// ==============================================
// 📊 GET CACHED OR FRESH EXCHANGE RATES
// ==============================================
async function getCurrencyRates(baseCurrency = 'INR') {
  try {
    const now = Date.now();
    
    // Check if cache is valid
    if (CACHED_RATES && CACHE_TIMESTAMP && (now - CACHE_TIMESTAMP) < CACHE_DURATION) {
      console.log('✅ Using cached exchange rates');
      return CACHED_RATES;
    }
    
    console.log('🔄 Cache expired or empty, fetching fresh rates...');
    
    // Fetch fresh rates
    const freshRates = await fetchLiveExchangeRates(baseCurrency);
    
    // Update cache
    CACHED_RATES = freshRates;
    CACHE_TIMESTAMP = now;
    
    console.log('✅ Exchange rates updated and cached');
    console.log(`💱 Current rates (${baseCurrency} base):`, freshRates);
    
    return freshRates;
  } catch (error) {
    console.error('❌ Error getting currency rates:', error);
    
    // If we have cached rates, use them even if expired
    if (CACHED_RATES) {
      console.warn('⚠️ Using expired cached rates due to API failure');
      return CACHED_RATES;
    }
    
    // Last resort - use emergency fallback rates
    console.warn('⚠️ Using emergency fallback rates');
    return getEmergencyFallbackRates();
  }
}

// ==============================================
// 🚨 EMERGENCY FALLBACK RATES (LAST RESORT)
// ==============================================
function getEmergencyFallbackRates() {
  // These are only used when ALL APIs fail and no cache exists
  // Updated to more current rates as of 2024
  console.warn('🚨 Using emergency fallback rates - these may be outdated');
  return {
    INR: 1.0,        // Base currency
    USD: 0.0114,     // 1 INR = 0.0114 USD (1 USD = ~87.7 INR)
    EUR: 0.0104,     // 1 INR = 0.0104 EUR (1 EUR = ~96 INR)
    GBP: 0.0089,     // 1 INR = 0.0089 GBP (1 GBP = ~112 INR)
    CAD: 0.0156,     // 1 INR = 0.0156 CAD (1 CAD = ~64 INR)
    JPY: 1.71,       // 1 INR = 1.71 JPY (1 JPY = ~0.58 INR)
    AUD: 0.0175      // 1 INR = 0.0175 AUD (1 AUD = ~57 INR)
  };
}

// ==============================================
// 🔄 CONVERT PRICE WITH LIVE RATES
// ==============================================
async function convertPrice(amount, fromCurrency, toCurrency) {
  try {
    if (!amount || typeof amount !== 'number') {
      throw new Error('Invalid amount provided');
    }
    
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // Get live exchange rates
    const rates = await getCurrencyRates('INR'); // Always use INR as base
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }
    
    // Convert from source currency to INR, then to target currency
    const amountInINR = fromCurrency === 'INR' ? amount : amount / rates[fromCurrency];
    const convertedAmount = toCurrency === 'INR' ? amountInINR : amountInINR * rates[toCurrency];
    
    // Round to 2 decimal places
    const finalAmount = Math.round(convertedAmount * 100) / 100;
    
    console.log(`💱 Converted ${amount} ${fromCurrency} = ${finalAmount} ${toCurrency}`);
    return finalAmount;
  } catch (error) {
    console.error('❌ Error converting price:', error);
    throw error;
  }
}

// ==============================================
// 💰 GET CURRENCY SYMBOL
// ==============================================
function getCurrencySymbol(currencyCode) {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode;
}

// ==============================================
// 🏷️ FORMAT PRICE WITH CURRENCY
// ==============================================
function formatPrice(amount, currencyCode = 'INR') {
  try {
    const currency = SUPPORTED_CURRENCIES[currencyCode];
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }
    
    // Format number with appropriate decimal places
    const decimals = currencyCode === 'JPY' ? 0 : 2;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return `${currency.symbol}${formattedAmount}`;
  } catch (error) {
    console.error('❌ Error formatting price:', error);
    return `${amount} ${currencyCode}`;
  }
}

// ==============================================
// 🎯 CONVERT MULTIPLE PRICES
// ==============================================
async function convertPrices(prices, fromCurrency, toCurrency) {
  try {
    const convertedPrices = {};
    
    for (const [key, value] of Object.entries(prices)) {
      if (typeof value === 'number') {
        convertedPrices[key] = await convertPrice(value, fromCurrency, toCurrency);
      } else {
        convertedPrices[key] = value;
      }
    }
    
    return convertedPrices;
  } catch (error) {
    console.error('❌ Error converting multiple prices:', error);
    throw error;
  }
}

// ==============================================
// 🔄 FORCE UPDATE EXCHANGE RATES
// ==============================================
async function updateExchangeRates() {
  try {
    console.log('🔄 Force updating exchange rates...');
    
    // Clear cache to force fresh fetch
    CACHED_RATES = null;
    CACHE_TIMESTAMP = null;
    
    // Fetch fresh rates
    const rates = await getCurrencyRates('INR');
    
    console.log('✅ Exchange rates force updated successfully');
    return rates;
  } catch (error) {
    console.error('❌ Error force updating exchange rates:', error);
    throw error;
  }
}

// ==============================================
// 📈 GET EXCHANGE RATE INFO
// ==============================================
async function getExchangeRateInfo() {
  try {
    const rates = await getCurrencyRates('INR');
    const info = {
      baseCurrency: 'INR',
      rates: rates,
      lastUpdated: CACHE_TIMESTAMP ? new Date(CACHE_TIMESTAMP).toISOString() : null,
      nextUpdate: CACHE_TIMESTAMP ? new Date(CACHE_TIMESTAMP + CACHE_DURATION).toISOString() : null,
      source: 'Live Internet APIs',
      supportedCurrencies: Object.keys(SUPPORTED_CURRENCIES)
    };
    
    return info;
  } catch (error) {
    console.error('❌ Error getting exchange rate info:', error);
    throw error;
  }
}

module.exports = {
  getCurrencies,
  getCurrencyRates,
  convertPrice,
  getCurrencySymbol,
  formatPrice,
  convertPrices,
  updateExchangeRates,
  getExchangeRateInfo,
  fetchLiveExchangeRates,
  SUPPORTED_CURRENCIES
};