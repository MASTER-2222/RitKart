// RitZone Backend Environment Configuration
// ==============================================
// Centralized environment variable management using .env file

require('dotenv').config();

const environment = {
  // ==============================================
  // 🗄️ SUPABASE CONFIGURATION
  // ==============================================
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE,
  },

  // ==============================================
  // 🐘 POSTGRESQL DATABASE CONFIGURATION  
  // ==============================================
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false
    }
  },

  // ==============================================
  // 🔐 SECURITY & JWT CONFIGURATION
  // ==============================================
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '86400000',
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '604800000',
    encryptionKey: process.env.ENCRYPTION_KEY,
    sessionSecret: process.env.SESSION_SECRET,
  },

  // ==============================================
  // 🌐 SERVER CONFIGURATION
  // ==============================================
  server: {
    port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '8001'),
    host: process.env.BACKEND_HOST || '0.0.0.0',
    apiPrefix: process.env.BACKEND_API_PREFIX || '/api',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // ==============================================
  // 🎨 FRONTEND INTEGRATION
  // ==============================================
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },

  // ==============================================
  // 📧 EMAIL CONFIGURATION (Optional)
  // ==============================================
  email: {
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  },

  // ==============================================
  // 💳 PAYMENT INTEGRATION (Optional)
  // ==============================================
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // ==============================================
  // 📊 LOGGING & DEBUG
  // ==============================================
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    debug: process.env.DEBUG === 'true',
  },

  // ==============================================
  // 🔒 RATE LIMITING
  // ==============================================
  rateLimiting: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900') * 1000,
  },

  // ==============================================
  // 👤 ADMIN CONFIGURATION
  // ==============================================
  admin: {
    defaultEmail: process.env.ADMIN_DEFAULT_EMAIL || 'admin@ritzone.com',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD,
  },

  // ==============================================
  // 🔍 ENVIRONMENT HELPERS
  // ==============================================
  isDevelopment: () => process.env.NODE_ENV !== 'production',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
};

// ==============================================
// ✅ VALIDATION FUNCTION
// ==============================================
const validateEnvironment = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'POSTGRES_HOST',
    'POSTGRES_DB', 
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment variables validated successfully');
  return true;
};

// ==============================================
// 📝 ENVIRONMENT INFO
// ==============================================
const getEnvironmentInfo = () => {
  return {
    nodeEnv: environment.server.nodeEnv,
    port: environment.server.port,
    supabaseConfigured: !!environment.supabase.url,
    databaseConfigured: !!environment.database.connectionString,
    jwtConfigured: !!environment.security.jwtSecret,
    frontendUrl: environment.frontend.url,
  };
};

module.exports = {
  environment,
  validateEnvironment,
  getEnvironmentInfo,
};