// RitZone Hero Banners Routes
// ==============================================
// Hero banner management using Supabase with environment variables

const express = require('express');
const multer = require('multer');
const path = require('path');
const { environment } = require('../config/environment');
const { bannerService, getSupabaseClient } = require('../services/supabase-service');
const AutoSyncMiddleware = require('../middleware/auto-sync-middleware');

const router = express.Router();

// ==============================================
// 📁 FILE UPLOAD CONFIGURATION FOR HERO BANNERS
// ==============================================
// Configure multer for memory storage (Supabase Storage)
const storage = multer.memoryStorage();

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
// 📤 UPLOAD HERO BANNER IMAGE TO SUPABASE STORAGE
// ==============================================
router.post('/:id/upload', AutoSyncMiddleware.adminAuth, upload.single('image'), async (req, res) => {
  try {
    const bannerId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Generate unique filename for Supabase Storage
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = path.extname(req.file.originalname);
    const fileName = `hero_banner_${bannerId}_${timestamp}_${randomString}${ext}`;

    // Upload to Supabase Storage
    const supabase = getSupabaseClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('hero-banners')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase Storage upload error:', uploadError);
      return res.status(400).json({
        success: false,
        message: 'Failed to upload image to storage',
        error: environment.isDevelopment() ? uploadError.message : undefined
      });
    }

    // Get public URL for uploaded image
    const { data: urlData } = supabase.storage
      .from('hero-banners')
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get public URL for uploaded image'
      });
    }

    // Update banner with uploaded image URL
    const bannerData = {
      image_url: urlData.publicUrl
    };

    const result = await bannerService.updateBanner(bannerId, bannerData);

    if (!result.success) {
      // Clean up uploaded file if banner update fails
      await supabase.storage
        .from('hero-banners')
        .remove([fileName]);

      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hero banner image uploaded and updated successfully',
      data: {
        bannerId,
        imageUrl: urlData.publicUrl,
        fileName,
        originalName: req.file.originalname,
        size: req.file.size,
        banner: result.banner
      }
    });

  } catch (error) {
    console.error('❌ Upload hero banner image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload hero banner image',
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