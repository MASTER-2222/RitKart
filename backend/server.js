// RitZone Backend Server
// ==============================================
// Express.js server with Supabase integration using environment variables

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import environment configuration
const { environment, validateEnvironment, getEnvironmentInfo } = require('./config/environment');
const { initializeSupabase, testConnection } = require('./services/supabase-service');

// Import route handlers
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const bannerRoutes = require('./routes/banners');
const dealRoutes = require('./routes/deals');
const currencyRoutes = require('./routes/currency');
const adminRoutes = require('./routes/admin');
const adminUsersRoutes = require('./routes/admin-users');
const autoSyncRoutes = require('./routes/auto-sync');

// Import auto-sync middleware
const AutoSyncMiddleware = require('./middleware/auto-sync-middleware');

// ==============================================
// 🚀 APPLICATION INITIALIZATION
// ==============================================
const app = express();

// ==============================================
// 🔧 MIDDLEWARE CONFIGURATION
// ==============================================

// Security middleware
app.use(helmet());

// CORS configuration using environment variables
app.use(cors({
  origin: environment.frontend.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
  credentials: true
}));

// Request logging
app.use(morgan(environment.logging.level));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Auto-sync middleware (applied globally for automatic user synchronization)
app.use(AutoSyncMiddleware.universalDataAccess);

// Rate limiting using environment variables
const limiter = rateLimit({
  windowMs: environment.rateLimiting.windowMs,
  max: environment.rateLimiting.requests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// ==============================================
// 🛣️ ROUTES CONFIGURATION
// ==============================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connectionTest = await testConnection();
    const envInfo = getEnvironmentInfo();
    
    res.status(200).json({
      success: true,
      message: 'RitZone Backend is running',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: connectionTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/auto-sync', autoSyncRoutes);

// ==============================================
// 🔍 ROOT ENDPOINT
// ==============================================
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎉 Welcome to RitZone Backend API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    health: `${req.protocol}://${req.get('host')}/api/health`,
    environment: environment.server.nodeEnv
  });
});

// ==============================================
// ❌ ERROR HANDLING MIDDLEWARE
// ==============================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error:', error);
  
  // Default error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    ...(environment.isDevelopment() && { 
      error: error.message,
      stack: error.stack 
    })
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      ...errorResponse,
      message: 'Validation failed',
      details: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      ...errorResponse,
      message: 'Unauthorized access'
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      ...errorResponse,
      message: 'File too large'
    });
  }

  res.status(500).json(errorResponse);
});

// ==============================================
// 🚀 SERVER STARTUP
// ==============================================
const startServer = async () => {
  try {
    // Validate environment variables
    console.log('🔍 Validating environment variables...');
    validateEnvironment();

    // Initialize Supabase connection
    console.log('🔧 Initializing Supabase connection...');
    await initializeSupabase();

    // Test database connection
    console.log('🧪 Testing database connection...');
    const connectionResult = await testConnection();
    if (!connectionResult.success) {
      throw new Error(`Database connection failed: ${connectionResult.message}`);
    }

    // Start server
    const server = app.listen(environment.server.port, environment.server.host, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 RitZone Backend Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`🌐 Server: http://${environment.server.host}:${environment.server.port}`);
      console.log(`📚 API Base: http://${environment.server.host}:${environment.server.port}/api`);
      console.log(`💚 Health Check: http://${environment.server.host}:${environment.server.port}/api/health`);
      console.log(`🔗 Frontend URL: ${environment.frontend.url}`);
      console.log(`🗄️ Database: ${environment.supabase.url}`);
      console.log(`⚙️ Environment: ${environment.server.nodeEnv}`);
      console.log('='.repeat(60));
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;