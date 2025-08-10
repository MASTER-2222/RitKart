// Currency API Routes
// ==============================================
// Handles currency conversion rates and currency operations

const express = require('express');
const { validateEnvironment } = require('../config/environment');
const { getCurrencyRates, getCurrencies, convertPrice } = require('../services/currency-service');

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
// 💱 GET CURRENT EXCHANGE RATES
// ==============================================
router.get('/rates', async (req, res) => {
  try {
    const { base } = req.query;
    const baseCurrency = base || 'INR'; // Default to INR as per requirement
    
    const rates = await getCurrencyRates(baseCurrency);
    
    res.json({
      success: true,
      message: 'Exchange rates retrieved successfully',
      data: {
        base: baseCurrency,
        rates: rates,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve exchange rates',
      error: error.message
    });
  }
});

// ==============================================
// 🔄 CONVERT PRICE
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
    
    const convertedAmount = await convertPrice(amount, from, to);
    
    res.json({
      success: true,
      message: 'Price converted successfully',
      data: {
        original: {
          amount: amount,
          currency: from
        },
        converted: {
          amount: convertedAmount,
          currency: to
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error converting price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert price',
      error: error.message
    });
  }
});

// ==============================================
// 🛒 GET PRODUCT PRICES IN SPECIFIC CURRENCY
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
    
    // Convert prices to target currency
    const convertedPrice = await convertPrice(product.price, 'INR', targetCurrency);
    const convertedOriginalPrice = product.original_price 
      ? await convertPrice(product.original_price, 'INR', targetCurrency)
      : null;
    
    res.json({
      success: true,
      message: 'Product prices retrieved successfully',
      data: {
        product_id: productId,
        currency: targetCurrency,
        price: convertedPrice,
        original_price: convertedOriginalPrice,
        base_currency: 'INR',
        base_price: product.price,
        base_original_price: product.original_price
      }
    });
  } catch (error) {
    console.error('❌ Error getting product prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product prices',
      error: error.message
    });
  }
});

module.exports = router;