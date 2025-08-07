// RitZone Category Routes
// ==============================================
// Category management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { categoryService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 🏷️ GET ALL CATEGORIES
// ==============================================
router.get('/', async (req, res) => {
  try {
    const result = await categoryService.getAllCategories();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.categories,
      count: result.categories.length
    });

  } catch (error) {
    console.error('❌ Get categories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔍 GET CATEGORY BY SLUG
// ==============================================
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    
    const result = await categoryService.getAllCategories();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const category = result.categories.find(cat => cat.slug === slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });

  } catch (error) {
    console.error('❌ Get category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;