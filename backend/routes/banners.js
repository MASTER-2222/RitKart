// RitZone Hero Banners Routes
// ==============================================
// Hero banner management using Supabase with environment variables

const express = require('express');
const { environment } = require('../config/environment');
const { bannerService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 🎨 GET ALL HERO BANNERS
// ==============================================
router.get('/', async (req, res) => {
  try {
    const result = await bannerService.getAllBanners();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero banners retrieved successfully',
      data: result.banners,
      count: result.banners.length
    });

  } catch (error) {
    console.error('❌ Get hero banners error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hero banners',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✨ CREATE NEW BANNER (Admin only)
// ==============================================
router.post('/', async (req, res) => {
  try {
    const bannerData = req.body;

    // Basic validation
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
// 🔄 UPDATE BANNER
// ==============================================
router.put('/:id', async (req, res) => {
  try {
    const bannerId = req.params.id;
    const bannerData = req.body;

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
// 🗑️ DELETE BANNER
// ==============================================
router.delete('/:id', async (req, res) => {
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

module.exports = router;