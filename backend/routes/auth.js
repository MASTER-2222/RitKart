// RitZone Authentication Routes
// ==============================================
// User authentication using Supabase Auth with environment variables

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { environment } = require('../config/environment');
const { userService } = require('../services/supabase-service');

const router = express.Router();

// ==============================================
// 📝 USER REGISTRATION WITH AUTOSYNC
// ==============================================
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Basic validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    console.log(`🔄 [AUTOSYNC] Starting registration for: ${email}`);

    // Register user with Supabase (enhanced with CRITICAL user table creation)
    const result = await userService.register({
      email,
      password,
      fullName,
      phone
    });

    if (!result.success) {
      console.error(`❌ [AUTOSYNC] Registration failed for ${email}: ${result.error}`);
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    console.log(`✅ [AUTOSYNC] Registration successful for: ${email} (ID: ${result.user.id})`);
    
    // AUTOSYNC VERIFICATION: Double-check that user exists in users table
    try {
      const verificationResult = await userService.verifyUserInUsersTable(result.user.id);
      if (!verificationResult.exists) {
        console.warn(`⚠️ [AUTOSYNC] User not found in users table, forcing sync: ${email}`);
        const syncResult = await userService.forceUserSync(result.user.id, { email, fullName, phone });
        if (!syncResult.success) {
          throw new Error(`Force sync failed: ${syncResult.error}`);
        }
        console.log(`✅ [AUTOSYNC] Force sync successful for: ${email}`);
      } else {
        console.log(`✅ [AUTOSYNC] User verified in users table: ${email}`);
      }
    } catch (verifyError) {
      console.error(`❌ [AUTOSYNC] Verification/sync failed for ${email}:`, verifyError.message);
      // Don't fail the registration, but log the issue
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully with AUTOSYNC verification.',
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.user_metadata.full_name
      }
    });

  } catch (error) {
    console.error('❌ [AUTOSYNC] Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔐 USER LOGIN
// ==============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Login user with Supabase
    const result = await userService.login(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    // Generate JWT token using environment variable
    const token = jwt.sign(
      { 
        userId: result.user.id,
        email: result.user.email 
      },
      environment.security.jwtSecret,
      { 
        expiresIn: environment.security.jwtExpiration 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.user_metadata?.full_name,
        phone: result.user.user_metadata?.phone
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 👤 GET USER PROFILE
// ==============================================
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user profile from Supabase
    const result = await userService.getProfile(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      user: result.user
    });

  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: environment.isDevelopment() ? error.message : undefined
    });
  }
});

// ==============================================
// 🔄 TOKEN REFRESH
// ==============================================
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, environment.security.jwtSecret);
    
    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId,
        email: decoded.email 
      },
      environment.security.jwtSecret,
      { 
        expiresIn: environment.security.jwtExpiration 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// ==============================================
// 🚪 LOGOUT
// ==============================================
router.post('/logout', authenticateToken, (req, res) => {
  // In a production environment, you might want to blacklist the token
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==============================================
// 🔒 AUTHENTICATION MIDDLEWARE
// ==============================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  jwt.verify(token, environment.security.jwtSecret, (error, user) => {
    if (error) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

module.exports = router;