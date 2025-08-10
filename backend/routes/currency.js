// Currency API Routes
// ==============================================
// Handles REAL-TIME currency conversion rates and currency operations

const express = require('express');
const { validateEnvironment } = require('../config/environment');
const { 
  getCurrencyRates, 
  getCurrencies, 
  convertPrice, 
  updateExchangeRates,
  getExchangeRateInfo,
  fetchLiveExchangeRates
} = require('../services/currency-service');

const router = express.Router();

// ==============================================
// 🌍 GET SUPPORTED CURRENCIES
// ==============================================
router.get('/currencies', async (req, res) => {
  try {
    const currencies = getCurrencies();
    
    res.json({
      success: true,
      message: 'Supported currencies retrieved successfully',
      data: currencies
    });
  } catch (error) {
    console.error('❌ Error getting currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve currencies',
      error: error.message
    });
  }
});

// ==============================================
// 💱 GET CURRENT LIVE EXCHANGE RATES
// ==============================================
router.get('/rates', async (req, res) => {
  try {
    const { base, force } = req.query;
    const baseCurrency = base || 'INR'; // Default to INR as per requirement
    
    let rates;
    if (force === 'true') {
      // Force fresh rates
      rates = await updateExchangeRates();
    } else {
      // Use cached or fetch if needed
      rates = await getCurrencyRates(baseCurrency);
    }
    
    res.json({
      success: true,
      message: 'Live exchange rates retrieved successfully',
      data: {
        base: baseCurrency,
        rates: rates,
        timestamp: new Date().toISOString(),
        source: 'Live Internet APIs'
      }
    });
  } catch (error) {
    console.error('❌ Error getting exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve live exchange rates',
      error: error.message
    });
  }
});

// ==============================================
// 📊 GET DETAILED EXCHANGE RATE INFO
// ==============================================
router.get('/rates/info', async (req, res) => {
  try {
    const info = await getExchangeRateInfo();
    
    res.json({
      success: true,
      message: 'Exchange rate information retrieved successfully',
      data: info
    });
  } catch (error) {
    console.error('❌ Error getting exchange rate info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve exchange rate information',
      error: error.message
    });
  }
});

// ==============================================
// 🔄 CONVERT PRICE WITH LIVE RATES
// ==============================================
router.post('/convert', async (req, res) => {
  try {
    const { amount, from, to } = req.body;
    
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: amount, from, to'
      });
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }
    
    const convertedAmount = await convertPrice(amount, from, to);
    
    // Get current rates for reference
    const rates = await getCurrencyRates('INR');
    const exchangeRate = from === 'INR' ? rates[to] : (1 / rates[from]);
    
    res.json({
      success: true,
      message: 'Price converted successfully using live rates',
      data: {
        original: {
          amount: amount,
          currency: from
        },
        converted: {
          amount: convertedAmount,
          currency: to
        },
        exchangeRate: exchangeRate,
        timestamp: new Date().toISOString(),
        source: 'Live Internet APIs'
      }
    });
  } catch (error) {
    console.error('❌ Error converting price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert price with live rates',
      error: error.message
    });
  }
});

// ==============================================
// 🛒 GET PRODUCT PRICES IN SPECIFIC CURRENCY (LIVE)
// ==============================================
router.get('/product-prices/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { currency } = req.query;
    const targetCurrency = currency || 'INR';
    
    // Get product price from database (assuming stored in INR)
    const { getProductById } = require('../services/supabase-service');
    const product = await getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Convert prices to target currency using LIVE rates
    const convertedPrice = await convertPrice(product.price, 'INR', targetCurrency);
    const convertedOriginalPrice = product.original_price 
      ? await convertPrice(product.original_price, 'INR', targetCurrency)
      : null;
    
    res.json({
      success: true,
      message: 'Product prices converted using live exchange rates',
      data: {
        product_id: productId,
        currency: targetCurrency,
        price: convertedPrice,
        original_price: convertedOriginalPrice,
        base_currency: 'INR',
        base_price: product.price,
        base_original_price: product.original_price,
        timestamp: new Date().toISOString(),
        source: 'Live Internet APIs'
      }
    });
  } catch (error) {
    console.error('❌ Error getting product prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product prices with live rates',
      error: error.message
    });
  }
});

// ==============================================
// 🔄 FORCE UPDATE EXCHANGE RATES
// ==============================================
router.post('/rates/update', async (req, res) => {
  try {
    console.log('🔄 Force updating exchange rates via API...');
    const rates = await updateExchangeRates();
    
    res.json({
      success: true,
      message: 'Exchange rates force updated successfully',
      data: {
        rates: rates,
        timestamp: new Date().toISOString(),
        source: 'Live Internet APIs - Force Updated'
      }
    });
  } catch (error) {
    console.error('❌ Error force updating exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force update exchange rates',
      error: error.message
    });
  }
});

// ==============================================
// 📈 REAL-TIME CONVERSION TEST ENDPOINT
// ==============================================
router.get('/test-live-rates', async (req, res) => {
  try {
    console.log('🧪 Testing live exchange rates...');
    
    // Test USD to INR conversion (as mentioned by user: $1 USD = 87.49 INR)
    const usdToInr = await convertPrice(1, 'USD', 'INR');
    const inrToUsd = await convertPrice(100, 'INR', 'USD');
    
    // Get all current rates
    const rates = await getCurrencyRates('INR');
    
    res.json({
      success: true,
      message: 'Live exchange rates test completed',
      data: {
        testConversions: {
          '1_USD_to_INR': usdToInr,
          '100_INR_to_USD': inrToUsd
        },
        allRates: rates,
        timestamp: new Date().toISOString(),
        source: 'Live Internet APIs',
        note: 'These are real-time rates fetched from internet APIs'
      }
    });
  } catch (error) {
    console.error('❌ Error testing live rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test live exchange rates',
      error: error.message
    });
  }
});

module.exports = router;