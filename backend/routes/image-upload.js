const express = require('express');
const router = express.Router();
const imageUploadService = require('../services/image-upload-service');

// ==============================================
// 🖼️ IMAGE UPLOAD ROUTES
// ==============================================

// Configure multer middleware
const upload = imageUploadService.getMulterConfig();

// 📤 UPLOAD IMAGE FILE
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { imageType, width, height } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Parse custom dimensions if provided
    let customDimensions = null;
    if (width && height) {
      customDimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
    }

    // Process and upload image
    const result = await imageUploadService.handleFileUpload(
      file, 
      imageType || 'banner', 
      customDimensions
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded and processed successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// 📤 UPLOAD MULTIPLE IMAGE FILES
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    const { imageType, width, height } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    // Parse custom dimensions if provided
    let customDimensions = null;
    if (width && height) {
      customDimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
    }

    // Process all files
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await imageUploadService.handleFileUpload(
          file, 
          imageType || 'banner', 
          customDimensions
        );
        results.push(result);
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.length} of ${files.length} images`,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: results.length,
        totalFailed: errors.length
      }
    });
  } catch (error) {
    console.error('❌ Multiple image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// 🌐 PROCESS IMAGE FROM URL
router.post('/from-url', async (req, res) => {
  try {
    const { imageUrl, imageType, width, height } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Validate URL first
    const validation = await imageUploadService.validateImageUrl(imageUrl);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL or unsupported image type',
        details: validation
      });
    }

    // Parse custom dimensions if provided
    let customDimensions = null;
    if (width && height) {
      customDimensions = {
        width: parseInt(width),
        height: parseInt(height)
      };
    }

    // Process image from URL
    const result = await imageUploadService.handleImageFromUrl(
      imageUrl, 
      imageType || 'banner', 
      customDimensions
    );

    res.status(200).json({
      success: true,
      message: 'Image processed from URL successfully',
      data: result
    });
  } catch (error) {
    console.error('❌ Image URL processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image from URL',
      error: error.message
    });
  }
});

// 🔍 VALIDATE IMAGE URL
router.post('/validate-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const validation = await imageUploadService.validateImageUrl(imageUrl);

    res.status(200).json({
      success: true,
      message: 'URL validation completed',
      data: validation
    });
  } catch (error) {
    console.error('❌ URL validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate URL',
      error: error.message
    });
  }
});

// 🗑️ DELETE IMAGE
router.delete('/delete', async (req, res) => {
  try {
    const { imageUrl, bucketName } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const result = await imageUploadService.deleteImage(imageUrl, bucketName);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// 📊 GET UPLOAD INFO
router.get('/info', (req, res) => {
  try {
    const dimensions = {
      banner: imageUploadService.getOptimalDimensions('banner'),
      hero: imageUploadService.getOptimalDimensions('hero'),
      category: imageUploadService.getOptimalDimensions('category'),
      product: imageUploadService.getOptimalDimensions('product'),
      thumbnail: imageUploadService.getOptimalDimensions('thumbnail'),
      featured: imageUploadService.getOptimalDimensions('featured')
    };

    res.status(200).json({
      success: true,
      message: 'Upload service information',
      data: {
        allowedMimeTypes: imageUploadService.allowedMimeTypes,
        maxFileSize: imageUploadService.maxFileSize,
        maxFileSizeMB: Math.round(imageUploadService.maxFileSize / 1024 / 1024),
        optimalDimensions: dimensions,
        supportedImageTypes: ['banner', 'hero', 'category', 'product', 'thumbnail', 'featured']
      }
    });
  } catch (error) {
    console.error('❌ Get upload info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload information',
      error: error.message
    });
  }
});

module.exports = router;