// RitZone Product Routes
// ==============================================
// Product management using Supabase with environment variables
// Enhanced with DYNAMIC CURRENCY CONVERSION

const express = require('express');
const { environment } = require('../config/environment');
const { productService } = require('../services/supabase-service');
const { convertPrice, getCurrencySymbol, formatPrice } = require('../services/currency-service');

const router = express.Router();

// ==============================================
// 💰 HELPER FUNCTION: CONVERT PRODUCT PRICES
// ==============================================
async function convertProductPrices(product, targetCurrency = 'INR') {
  if (!product) {
    return product;
  }
  
  // Handle INR currency (base currency) - add metadata without conversion
  if (targetCurrency === 'INR') {
    return {
      ...product,
      currency: 'INR',
      currency_symbol: getCurrencySymbol('INR'),
      formatted_price: formatPrice(product.price, 'INR'),
      base_currency: 'INR',
      base_price: product.price
    };
  }
  
  try {
    const convertedProduct = { ...product };
    
    // Convert main price fields
    if (product.price) {
      convertedProduct.price = await convertPrice(product.price, 'INR', targetCurrency);
    }
    
    if (product.original_price) {
      convertedProduct.original_price = await convertPrice(product.original_price, 'INR', targetCurrency);
    }
    
    // Add currency metadata
    convertedProduct.currency = targetCurrency;
    convertedProduct.currency_symbol = getCurrencySymbol(targetCurrency);
    convertedProduct.formatted_price = formatPrice(convertedProduct.price, targetCurrency);
    convertedProduct.base_currency = 'INR';
    convertedProduct.base_price = product.price;
    
    return convertedProduct;
  } catch (error) {
    console.error('❌ Error converting product prices:', error);
    // Return original product with error note if conversion fails
    return {
      ...product,
      currency_conversion_error: 'Unable to convert to requested currency',
      currency: 'INR'
    };
  }
}

// ==============================================
// 💰 HELPER FUNCTION: CONVERT MULTIPLE PRODUCTS
// ==============================================
async function convertProductsPrices(products, targetCurrency = 'INR') {
  if (!products || !Array.isArray(products)) {
    return products;
  }
  
  try {
    const convertedProducts = await Promise.all(
      products.map(product => convertProductPrices(product, targetCurrency))
    );
    
    return convertedProducts;
  } catch (error) {
    console.error('❌ Error converting multiple products prices:', error);
    return products; // Return original products if conversion fails
  }
}

// ==============================================
// 📦 GET ALL PRODUCTS WITH SEARCH & FILTERS (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const currency = req.query.currency || 'INR';
    const search = req.query.search || '';
    const category = req.query.category || '';
    const featured = req.query.featured === 'true';

    let result;
    
    // Handle different query types
    if (search || category || featured) {
      result = await productService.searchProducts({
        search,
        category,
        featured,
        page,
        limit
      });
    } else {
      result = await productService.getAllProducts(page, limit);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // NEW: Convert prices to requested currency
    const convertedProducts = await convertProductsPrices(result.products, currency);

    res.status(200).json({
      success: true,
      message: `Products retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedProducts,
      currency: currency,
      search: search || null,
      category: category || null,
      featured: featured || null,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Get products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔍 GET PRODUCT BY ID (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const currency = req.query.currency || 'INR'; // NEW: Support currency parameter

    const result = await productService.getProductById(productId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    // NEW: Convert prices to requested currency
    const convertedProduct = await convertProductPrices(result.product, currency);

    res.status(200).json({
      success: true,
      message: `Product retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedProduct,
      currency: currency // NEW: Include currency info
    });

  } catch (error) {
    console.error('❌ Get product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🏷️ GET PRODUCTS BY CATEGORY (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/category/:slug', async (req, res) => {
  try {
    const categorySlug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const currency = req.query.currency || 'INR'; // NEW: Support currency parameter

    const result = await productService.getProductsByCategory(categorySlug, page, limit);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    // NEW: Convert prices to requested currency
    const convertedProducts = await convertProductsPrices(result.products, currency);

    res.status(200).json({
      success: true,
      message: `Products for category '${categorySlug}' retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedProducts,
      category: result.category,
      currency: currency, // NEW: Include currency info
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Get products by category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products by category',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔍 SEARCH PRODUCTS
// ==============================================
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // This would need to be implemented in the productService
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: `Search functionality coming soon for: "${searchQuery}"`,
      data: [],
      searchQuery: searchQuery,
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalCount: 0,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Search products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ⭐ GET FEATURED PRODUCTS (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const currency = req.query.currency || 'INR'; // NEW: Support currency parameter

    // Get featured products from service
    const result = await productService.getFeaturedProducts ? 
      await productService.getFeaturedProducts(limit) :
      { success: true, products: [] }; // Fallback for now

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // NEW: Convert prices to requested currency
    const convertedProducts = await convertProductsPrices(result.products, currency);

    res.status(200).json({
      success: true,
      message: `Featured products retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedProducts,
      currency: currency, // NEW: Include currency info
      limit: limit
    });

  } catch (error) {
    console.error('❌ Get featured products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured products',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ CREATE NEW PRODUCT (Admin only)
// ==============================================
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    // Basic validation
    const required = ['name', 'description', 'price', 'category_id', 'sku'];
    const missing = required.filter(field => !productData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await productService.createProduct(productData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.product
    });

  } catch (error) {
    console.error('❌ Create product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ UPDATE PRODUCT (Admin only)
// ==============================================
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Remove empty strings and undefined values
    Object.keys(productData).forEach(key => {
      if (productData[key] === '' || productData[key] === undefined) {
        delete productData[key];
      }
    });

    const result = await productService.updateProduct(productId, productData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result.product
    });

  } catch (error) {
    console.error('❌ Update product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ DELETE PRODUCT (Admin only - Soft Delete)
// ==============================================
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await productService.deleteProduct(productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: result.product
    });

  } catch (error) {
    console.error('❌ Delete product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔗 GET RELATED PRODUCTS (WITH DYNAMIC CURRENCY)
// ==============================================
router.get('/:id/related', async (req, res) => {
  try {
    const productId = req.params.id;
    const limit = parseInt(req.query.limit) || 10;
    const currency = req.query.currency || 'INR';

    const result = await productService.getRelatedProducts(productId, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // Convert prices to requested currency
    const convertedProducts = await convertProductsPrices(result.products, currency);

    res.status(200).json({
      success: true,
      message: `Related products retrieved successfully${currency !== 'INR' ? ` with prices in ${currency}` : ''}`,
      data: convertedProducts,
      currency: currency,
      total: result.products.length
    });

  } catch (error) {
    console.error('❌ Get related products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve related products',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;