// RitZone User Reviews Routes
// ==============================================
// User review management with image upload support

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { environment } = require('../config/environment');
const { userReviewService } = require('../services/supabase-service');
const { authenticateToken } = require('../middleware/enhanced-auth');

const router = express.Router();

// ==============================================
// 🖼️ IMAGE UPLOAD CONFIGURATION
// ==============================================
const uploadsDir = path.join(__dirname, '../uploads/reviews');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created reviews uploads directory');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 5 // Maximum 5 files per review
  }
});

// ==============================================
// 📝 GET REVIEWS FOR PRODUCT
// ==============================================
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userReviewService.getReviewsByProduct(productId, page, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      },
      stats: result.stats
    });

  } catch (error) {
    console.error('❌ Get product reviews error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📝 CREATE USER REVIEW
// ==============================================
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, rating, reviewText } = req.body;

    // Validate required fields
    if (!productId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, rating, reviewText'
      });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate review text length
    if (reviewText.length < 10 || reviewText.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Review text must be between 10 and 2000 characters'
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);
      
      if (imageUrls.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed per review'
        });
      }
    }

    const reviewData = {
      user_id: userId,
      product_id: productId,
      rating: ratingNum,
      review_text: reviewText,
      images: imageUrls
    };

    const result = await userReviewService.createReview(reviewData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result.review
    });

  } catch (error) {
    console.error('❌ Create review error:', error.message);
    
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.warn('⚠️ Failed to clean up uploaded file:', file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📝 UPDATE USER REVIEW
// ==============================================
router.put('/:reviewId', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;
    const { rating, reviewText, removeImages } = req.body;

    // Validate rating if provided
    let validatedRating = undefined;
    if (rating !== undefined) {
      validatedRating = parseInt(rating);
      if (isNaN(validatedRating) || validatedRating < 1 || validatedRating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
    }

    // Validate review text length if provided
    if (reviewText !== undefined && (reviewText.length < 10 || reviewText.length > 2000)) {
      return res.status(400).json({
        success: false,
        message: 'Review text must be between 10 and 2000 characters'
      });
    }

    // Process new uploaded images
    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      newImageUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);
    }

    // Parse images to remove
    let imagesToRemove = [];
    if (removeImages) {
      try {
        imagesToRemove = JSON.parse(removeImages);
      } catch (e) {
        imagesToRemove = [];
      }
    }

    const updateData = {
      rating: validatedRating,
      review_text: reviewText,
      new_images: newImageUrls,
      remove_images: imagesToRemove
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await userReviewService.updateReview(reviewId, userId, updateData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: result.review
    });

  } catch (error) {
    console.error('❌ Update review error:', error.message);
    
    // Clean up uploaded files if there was an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.warn('⚠️ Failed to clean up uploaded file:', file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📝 GET USER'S OWN REVIEWS
// ==============================================
router.get('/my-reviews', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userReviewService.getUserReviews(userId, page, limit);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'User reviews retrieved successfully',
      data: result.reviews,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: limit
      }
    });

  } catch (error) {
    console.error('❌ Get user reviews error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user reviews',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📝 DELETE USER REVIEW
// ==============================================
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;

    const result = await userReviewService.deleteReview(reviewId, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete review error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 📊 GET REVIEW STATISTICS FOR PRODUCT
// ==============================================
router.get('/stats/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    const result = await userReviewService.getReviewStats(productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review statistics retrieved successfully',
      data: result.stats
    });

  } catch (error) {
    console.error('❌ Get review stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve review statistics',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

module.exports = router;