// RitZone Homepage Management Routes
// ==============================================
// Dynamic homepage content management API for admin panel

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { environment } = require('../config/environment');
const { homepageService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 📁 FILE UPLOAD CONFIGURATION
// ==============================================
// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/homepage');
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
    cb(null, `homepage_${timestamp}_${randomString}${ext}`);
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
// 🏠 GET ALL HOMEPAGE SECTIONS
// ==============================================
router.get('/sections', async (req, res) => {
  try {
    const result = await homepageService.getAllSections();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Homepage sections retrieved successfully',
      data: result.sections
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
// 🎯 GET SPECIFIC SECTION BY NAME
// ==============================================
router.get('/sections/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const result = await homepageService.getSectionByName(sectionName);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} section retrieved successfully`,
      data: result.section
    });

  } catch (error) {
    console.error('❌ Get homepage section error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage section',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ✏️ UPDATE SECTION CONTENT
// ==============================================
router.put('/sections/:sectionName/content', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Content object is required'
      });
    }

    const result = await homepageService.updateSectionContent(sectionName, content);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} content updated successfully`
    });

  } catch (error) {
    console.error('❌ Update section content error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update section content',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🖼️ UPDATE SECTION IMAGES
// ==============================================
router.put('/sections/:sectionName/images', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { images } = req.body;

    if (!images || typeof images !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Images object is required'
      });
    }

    const result = await homepageService.updateSectionImages(sectionName, images);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} images updated successfully`
    });

  } catch (error) {
    console.error('❌ Update section images error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update section images',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📤 UPLOAD IMAGE FILE
// ==============================================
router.post('/sections/:sectionName/upload', upload.single('image'), async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { imageKey, alt, title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    if (!imageKey) {
      return res.status(400).json({
        success: false,
        message: 'imageKey is required'
      });
    }

    // Generate public URL for uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/homepage/${req.file.filename}`;

    // Update section with uploaded image
    const imageData = {
      [imageKey]: {
        url: imageUrl,
        alt: alt || '',
        title: title || '',
        upload_type: 'upload'
      }
    };

    const result = await homepageService.updateSectionImages(sectionName, imageData);

    if (!result.success) {
      // Clean up uploaded file if database update fails
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to clean up uploaded file:', err);
      });

      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded and updated successfully',
      data: {
        imageKey,
        imageUrl,
        fileName: req.file.filename
      }
    });

  } catch (error) {
    console.error('❌ Upload image error:', error.message);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to clean up uploaded file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// ⚙️ UPDATE SECTION SETTINGS
// ==============================================
router.put('/sections/:sectionName/settings', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const settings = req.body;

    const result = await homepageService.updateSectionSettings(sectionName, settings);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} settings updated successfully`,
      data: result.section
    });

  } catch (error) {
    console.error('❌ Update section settings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update section settings',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📋 GET HOMEPAGE CATEGORIES
// ==============================================
router.get('/categories', async (req, res) => {
  try {
    const result = await homepageService.getHomepageCategories();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Homepage categories retrieved successfully',
      data: result.categories
    });

  } catch (error) {
    console.error('❌ Get homepage categories error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage categories',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🎁 GET HOMEPAGE PRODUCTS
// ==============================================
router.get('/products/:sectionName?', async (req, res) => {
  try {
    const sectionName = req.params.sectionName || 'featured_products';
    const result = await homepageService.getHomepageProducts(sectionName);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Homepage ${sectionName} retrieved successfully`,
      data: result.products
    });

  } catch (error) {
    console.error('❌ Get homepage products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage products',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🎁 UPDATE FEATURED PRODUCTS
// ==============================================
router.put('/products/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    const result = await homepageService.updateFeaturedProducts(sectionName, products);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} products updated successfully`
    });

  } catch (error) {
    console.error('❌ Update featured products error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured products',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔄 BULK UPDATE SECTION (Content + Images + Settings)
// ==============================================
router.put('/sections/:sectionName', async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { content, images, settings } = req.body;

    const results = [];

    // Update content if provided
    if (content && typeof content === 'object') {
      const contentResult = await homepageService.updateSectionContent(sectionName, content);
      results.push({ type: 'content', success: contentResult.success, error: contentResult.error });
    }

    // Update images if provided
    if (images && typeof images === 'object') {
      const imagesResult = await homepageService.updateSectionImages(sectionName, images);
      results.push({ type: 'images', success: imagesResult.success, error: imagesResult.error });
    }

    // Update settings if provided
    if (settings && typeof settings === 'object') {
      const settingsResult = await homepageService.updateSectionSettings(sectionName, settings);
      results.push({ type: 'settings', success: settingsResult.success, error: settingsResult.error });
    }

    // Check if any updates failed
    const failedUpdates = results.filter(result => !result.success);
    
    if (failedUpdates.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some updates failed',
        details: results
      });
    }

    res.status(200).json({
      success: true,
      message: `${sectionName} section updated successfully`,
      details: results
    });

  } catch (error) {
    console.error('❌ Bulk update section error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update section',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;