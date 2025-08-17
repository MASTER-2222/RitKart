// RitZone Admin Homepage Management Routes
// ==============================================
// Admin homepage content management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { bannerService, categoryService, productService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 🏠 GET ALL HOMEPAGE SECTIONS DATA
// ==============================================
router.get('/sections', async (req, res) => {
  try {
    // Fetch all homepage data in parallel
    const [bannersResult, categoriesResult, featuredResult, electronicsResult] = await Promise.all([
      bannerService.getAllBanners(),
      categoryService.getAllCategories(),
      productService.getFeaturedProducts(20),
      productService.getBestsellerElectronicsProducts(20)
    ]);

    // Format response data
    const sectionsData = {
      hero_section: {
        banners: bannersResult.success ? bannersResult.banners : []
      },
      categories_section: {
        categories: categoriesResult.success ? categoriesResult.categories : []
      },
      featured_section: {
        products: featuredResult.success ? featuredResult.products : []
      },
      electronics_section: {
        products: electronicsResult.success ? electronicsResult.products : []
      }
    };

    res.status(200).json({
      success: true,
      message: 'Homepage sections data retrieved successfully',
      data: sectionsData
    });

  } catch (error) {
    console.error('❌ Get homepage sections error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage sections',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🎨 UPDATE HERO BANNER
// ==============================================
router.put('/hero/:id', async (req, res) => {
  try {
    const bannerId = req.params.id;
    const bannerData = req.body;

    // Validate required fields
    const required = ['title'];
    const missing = required.filter(field => !bannerData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await bannerService.updateBanner(bannerId, bannerData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero banner updated successfully',
      data: result.banner
    });

  } catch (error) {
    console.error('❌ Update hero banner error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update hero banner',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ CREATE NEW HERO BANNER
// ==============================================
router.post('/hero', async (req, res) => {
  try {
    const bannerData = req.body;

    // Validate required fields
    const required = ['title', 'image_url'];
    const missing = required.filter(field => !bannerData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await bannerService.createBanner(bannerData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Hero banner created successfully',
      data: result.banner
    });

  } catch (error) {
    console.error('❌ Create hero banner error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create hero banner',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🗑️ DELETE HERO BANNER
// ==============================================
router.delete('/hero/:id', async (req, res) => {
  try {
    const bannerId = req.params.id;

    const result = await bannerService.deleteBanner(bannerId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero banner deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete hero banner error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hero banner',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🏷️ UPDATE CATEGORY
// ==============================================
router.put('/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = req.body;

    // Validate required fields
    const required = ['name'];
    const missing = required.filter(field => !categoryData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await categoryService.updateCategory(categoryId, categoryData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result.category
    });

  } catch (error) {
    console.error('❌ Update category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ CREATE NEW CATEGORY
// ==============================================
router.post('/category', async (req, res) => {
  try {
    const categoryData = req.body;

    // Validate required fields
    const required = ['name', 'image_url'];
    const missing = required.filter(field => !categoryData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await categoryService.createCategory(categoryData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.category
    });

  } catch (error) {
    console.error('❌ Create category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🗑️ DELETE CATEGORY
// ==============================================
router.delete('/category/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const result = await categoryService.deleteCategory(categoryId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete category error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📦 UPDATE FEATURED PRODUCT STATUS
// ==============================================
router.put('/featured/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { is_featured } = req.body;

    // Validate required fields
    if (typeof is_featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid is_featured field (must be boolean)'
      });
    }

    const result = await productService.updateProductFeaturedStatus(productId, is_featured);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Product ${is_featured ? 'added to' : 'removed from'} featured products successfully`,
      data: result.product
    });

  } catch (error) {
    console.error('❌ Update featured product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ⚡ ELECTRONICS PRODUCTS FULL CRUD ENDPOINTS
// ==============================================

// UPDATE ELECTRONICS BESTSELLER STATUS
router.put('/electronics/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { is_bestseller } = req.body;

    // Validate required fields
    if (typeof is_bestseller !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid is_bestseller field (must be boolean)'
      });
    }

    const result = await productService.updateProductBestsellerStatus(productId, is_bestseller);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Electronics bestseller status ${is_bestseller ? 'enabled' : 'disabled'} successfully`,
      data: result.product
    });

  } catch (error) {
    console.error('❌ Update electronics bestseller error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update electronics bestseller status',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// CREATE NEW ELECTRONICS PRODUCT
router.post('/electronics', async (req, res) => {
  try {
    const productData = req.body;

    // Validate required fields
    const required = ['name', 'price', 'images'];
    const missing = required.filter(field => !productData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    // Set default values for electronics products
    const electronicsProductData = {
      ...productData,
      is_active: true,
      is_bestseller: true, // New electronics products default to bestseller
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const result = await productService.createProduct(electronicsProductData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Electronics product created successfully',
      data: result.product
    });

  } catch (error) {
    console.error('❌ Create electronics product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create electronics product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// UPDATE ELECTRONICS PRODUCT DETAILS
router.put('/electronics/:id/details', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Validate required fields
    const required = ['name'];
    const missing = required.filter(field => !productData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: required,
        missing: missing
      });
    }

    const result = await productService.updateProduct(productId, productData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Electronics product updated successfully',
      data: result.product
    });

  } catch (error) {
    console.error('❌ Update electronics product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update electronics product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// DELETE ELECTRONICS PRODUCT
router.delete('/electronics/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await productService.deleteProduct(productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Electronics product deleted successfully',
      data: result.product
    });

  } catch (error) {
    console.error('❌ Delete electronics product error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete electronics product',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;