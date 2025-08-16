const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { getAdminSupabaseClient } = require('./supabase-service');

// ==============================================
// 🖼️ IMAGE UPLOAD SERVICE
// ==============================================

class ImageUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
    ];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.initializeUploadDirectory();
  }

  // Initialize upload directory
  async initializeUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log('📁 Upload directory initialized:', this.uploadDir);
    } catch (error) {
      console.error('❌ Error creating upload directory:', error);
    }
  }

  // Configure multer for memory storage
  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Max 10 files per request
      },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`), false);
        }
      }
    });
  }

  // Process and resize image based on type
  async processImage(buffer, imageType = 'banner', customDimensions = null) {
    try {
      let width, height, quality = 85;

      // Define optimal dimensions for different image types
      const dimensions = customDimensions || this.getOptimalDimensions(imageType);
      width = dimensions.width;
      height = dimensions.height;

      // Process image with sharp
      const processedBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover', // Crop to exact dimensions while maintaining aspect ratio
          position: 'center'
        })
        .jpeg({ quality }) // Convert to JPEG for optimal compression
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('❌ Image processing error:', error);
      throw new Error('Failed to process image: ' + error.message);
    }
  }

  // Get optimal dimensions for different image types
  getOptimalDimensions(imageType) {
    const dimensionsMap = {
      'banner': { width: 1920, height: 600 }, // Hero banners
      'hero': { width: 1920, height: 600 },   // Hero banners
      'category': { width: 400, height: 400 }, // Category cards
      'product': { width: 800, height: 800 },  // Product images
      'thumbnail': { width: 300, height: 300 }, // Thumbnails
      'featured': { width: 600, height: 400 }  // Featured products
    };

    return dimensionsMap[imageType] || dimensionsMap['banner'];
  }

  // Upload processed image to Supabase Storage
  async uploadToSupabase(processedBuffer, fileName, bucketName = 'images') {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists(bucketName);

      // Generate unique file name
      const uniqueFileName = `${Date.now()}-${uuidv4()}-${fileName}`;
      const filePath = `uploads/${uniqueFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, processedBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw new Error('Failed to upload to Supabase: ' + error.message);
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        fileName: uniqueFileName,
        filePath: filePath,
        publicUrl: publicData.publicUrl,
        supabaseData: data
      };
    } catch (error) {
      console.error('❌ Upload to Supabase failed:', error);
      throw error;
    }
  }

  // Ensure Supabase bucket exists
  async ensureBucketExists(bucketName) {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: this.allowedMimeTypes,
          fileSizeLimit: this.maxFileSize
        });

        if (error) {
          console.error('❌ Error creating bucket:', error);
        } else {
          console.log('✅ Created Supabase bucket:', bucketName);
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring bucket exists:', error);
    }
  }

  // Process file upload from request
  async handleFileUpload(file, imageType = 'banner', customDimensions = null) {
    try {
      if (!file || !file.buffer) {
        throw new Error('No file provided or invalid file format');
      }

      console.log(`📤 Processing ${imageType} image upload:`, {
        originalName: file.originalname,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        mimetype: file.mimetype
      });

      // Process image
      const processedBuffer = await this.processImage(file.buffer, imageType, customDimensions);
      
      // Upload to Supabase
      const uploadResult = await this.uploadToSupabase(
        processedBuffer, 
        file.originalname, 
        'images'
      );

      console.log('✅ Image upload successful:', uploadResult.publicUrl);

      return {
        success: true,
        imageUrl: uploadResult.publicUrl,
        fileName: uploadResult.fileName,
        fileSize: processedBuffer.length,
        dimensions: this.getOptimalDimensions(imageType),
        originalFile: {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        }
      };
    } catch (error) {
      console.error('❌ File upload error:', error);
      throw error;
    }
  }

  // Fetch and process image from URL
  async handleImageFromUrl(imageUrl, imageType = 'banner', customDimensions = null) {
    try {
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL provided');
      }

      console.log(`🌐 Processing image from URL (${imageType}):`, imageUrl);

      // Fetch image from URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!this.allowedMimeTypes.includes(contentType)) {
        throw new Error(`Unsupported image type: ${contentType}`);
      }

      // Get image buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image
      const processedBuffer = await this.processImage(buffer, imageType, customDimensions);
      
      // Generate filename from URL
      const urlPath = new URL(imageUrl).pathname;
      const fileName = path.basename(urlPath) || 'image-from-url.jpg';
      
      // Upload to Supabase
      const uploadResult = await this.uploadToSupabase(
        processedBuffer, 
        fileName, 
        'images'
      );

      console.log('✅ Image from URL processed successfully:', uploadResult.publicUrl);

      return {
        success: true,
        imageUrl: uploadResult.publicUrl,
        fileName: uploadResult.fileName,
        fileSize: processedBuffer.length,
        dimensions: this.getOptimalDimensions(imageType),
        originalUrl: imageUrl,
        originalSize: buffer.length
      };
    } catch (error) {
      console.error('❌ Image URL processing error:', error);
      throw error;
    }
  }

  // Validate image URL
  async validateImageUrl(imageUrl) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      return {
        valid: response.ok && this.allowedMimeTypes.includes(contentType),
        contentType: contentType,
        status: response.status
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Delete image from Supabase Storage
  async deleteImage(imageUrl, bucketName = 'images') {
    try {
      // Extract file path from public URL
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(-2).join('/'); // Get last 2 segments (uploads/filename)

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error deleting image:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Image deleted successfully:', filePath);
      return { success: true, deletedPath: filePath };
    } catch (error) {
      console.error('❌ Delete image error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new ImageUploadService();