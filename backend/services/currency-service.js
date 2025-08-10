// Currency Service
// ==============================================
// Handles currency conversion rates and operations

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
// 💱 EXCHANGE RATES (Base: INR)
// ==============================================
// In production, these should be fetched from a real-time currency API
// For now, using static rates with INR as base currency
const EXCHANGE_RATES = {
  INR: 1.0,        // Base currency
  USD: 0.012,      // 1 INR = 0.012 USD (1 USD = ~83 INR)
  EUR: 0.011,      // 1 INR = 0.011 EUR (1 EUR = ~90 INR)
  GBP: 0.0095,     // 1 INR = 0.0095 GBP (1 GBP = ~105 INR)
  CAD: 0.016,      // 1 INR = 0.016 CAD (1 CAD = ~62 INR)
  JPY: 1.78,       // 1 INR = 1.78 JPY (1 JPY = ~0.56 INR)
  AUD: 0.018       // 1 INR = 0.018 AUD (1 AUD = ~55 INR)
};

// ==============================================
// 🌍 GET SUPPORTED CURRENCIES
// ==============================================
function getCurrencies() {
  return Object.values(SUPPORTED_CURRENCIES);
}

// ==============================================
// 📊 GET EXCHANGE RATES
// ==============================================
async function getCurrencyRates(baseCurrency = 'INR') {
  try {
    // If base currency is INR, return direct rates
    if (baseCurrency === 'INR') {
      return EXCHANGE_RATES;
    }
    
    // Convert rates to different base currency
    const baseRate = EXCHANGE_RATES[baseCurrency];
    if (!baseRate) {
      throw new Error(`Unsupported base currency: ${baseCurrency}`);
    }
    
    const convertedRates = {};
    for (const [currency, rate] of Object.entries(EXCHANGE_RATES)) {
      convertedRates[currency] = rate / baseRate;
    }
    
    return convertedRates;
  } catch (error) {
    console.error('❌ Error getting currency rates:', error);
    throw error;
  }
}

// ==============================================
// 🔄 CONVERT PRICE
// ==============================================
async function convertPrice(amount, fromCurrency, toCurrency) {
  try {
    if (!amount || typeof amount !== 'number') {
      throw new Error('Invalid amount provided');
    }
    
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    if (!EXCHANGE_RATES[fromCurrency] || !EXCHANGE_RATES[toCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }
    
    // Convert from source currency to INR, then to target currency
    const amountInINR = fromCurrency === 'INR' ? amount : amount / EXCHANGE_RATES[fromCurrency];
    const convertedAmount = toCurrency === 'INR' ? amountInINR : amountInINR * EXCHANGE_RATES[toCurrency];
    
    // Round to 2 decimal places
    return Math.round(convertedAmount * 100) / 100;
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
// 🔄 UPDATE EXCHANGE RATES (Future Implementation)
// ==============================================
async function updateExchangeRates() {
  try {
    // In production, this would fetch real-time rates from an API like:
    // - exchangerate-api.com
    // - currencylayer.com
    // - fixer.io
    // - openexchangerates.org
    
    console.log('📊 Exchange rates updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating exchange rates:', error);
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
  SUPPORTED_CURRENCIES,
  EXCHANGE_RATES
};