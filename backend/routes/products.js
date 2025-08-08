// RitZone Product Routes
// ==============================================
// Product management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { productService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 📦 GET ALL PRODUCTS
// ==============================================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await productService.getAllProducts(page, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
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
// 🔍 GET PRODUCT BY ID
// ==============================================
router.get('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await productService.getProductById(productId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: result.product
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
// 🏷️ GET PRODUCTS BY CATEGORY
// ==============================================
router.get('/category/:slug', async (req, res) => {
  try {
    const categorySlug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await productService.getProductsByCategory(categorySlug, page, limit);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Products for category '${categorySlug}' retrieved successfully`,
      data: result.products,
      category: result.category,
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
// ⭐ GET FEATURED PRODUCTS
// ==============================================
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // This would need to be implemented in the productService
    // For now, return a placeholder response
    res.status(200).json({
      success: true,
      message: 'Featured products functionality coming soon',
      data: [],
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

module.exports = router;