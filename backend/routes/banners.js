// RitZone Hero Banners Routes
// ==============================================
// Hero banner management using Supabase with environment variables

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { environment } = require('../config/environment');
const { bannerService } = require('../services/supabase-service');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');

const router = express.Router();

// ==============================================
// 📁 FILE UPLOAD CONFIGURATION FOR HERO BANNERS
// ==============================================
// Configure multer for hero banner image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/banners');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `hero_banner_${timestamp}_${randomString}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

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
router.post('/', AutoSyncMiddleware.adminAuth, async (req, res) => {
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
// 🔄 UPDATE BANNER (Admin only)
// ==============================================
router.put('/:id', AutoSyncMiddleware.adminAuth, async (req, res) => {
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
// 🗑️ DELETE BANNER (Admin only)
// ==============================================
router.delete('/:id', AutoSyncMiddleware.adminAuth, async (req, res) => {
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