// Database configuration using environment variables
export const databaseConfig = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  // PostgreSQL configuration for direct connections
  postgres: {
    host: process.env.POSTGRES_HOST || 'db.igzpodmmymbptmwebonh.supabase.co',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: {
      rejectUnauthorized: false
    }
  },

  // Backend API configuration
  backend: {
    port: parseInt(process.env.BACKEND_PORT || '8001'),
    host: process.env.BACKEND_HOST || '0.0.0.0',
    apiPrefix: process.env.BACKEND_API_PREFIX || '/api',
    corsOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'fallback_encryption_key_1234567890',
    sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400'),
  },

  // Rate limiting
  rateLimiting: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900') * 1000,
  },

  // Environment settings
  environment: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    debug: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  }
}

// Validation function to check required environment variables
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}

// Database connection string builder
export function buildConnectionString() {
  const { host, port, database, user, password } = databaseConfig.postgres
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`
}

export default databaseConfig