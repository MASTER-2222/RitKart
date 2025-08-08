# RitZone Backend Environment Configuration

## 🔧 **Environment Variables Setup**

The RitZone backend uses environment variables for secure configuration management. This guide explains how to set up and manage these variables.

## 📁 **Environment Files**

### **`.env.example`**
Template file with all available environment variables and their descriptions.

### **`.env`** 
Your actual environment configuration file (not committed to Git for security).

### **`.gitignore`**
Ensures sensitive environment files are not committed to version control.

## 🚀 **Quick Setup**

### **1. Copy the Example File**
```bash
cd backend
cp .env.example .env
```

### **2. Edit Your Configuration**
Open `.env` and update the values with your Supabase credentials:
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# PostgreSQL Configuration
POSTGRES_CONNECTION_STRING=postgresql://postgres:password@host:5432/postgres

# Security Configuration
JWT_SECRET=your-secure-jwt-secret-here
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-here

# Server Configuration
BACKEND_PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### **3. Run the Application**
The startup scripts automatically load environment variables:
```bash
# Windows
./start-backend.bat

# Linux/Mac
./start-backend.sh

# Or directly with Node.js
npm start
```

## 📋 **Environment Variables Reference**

### **🗄️ Supabase & Database Configuration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Your Supabase project URL | - | ✅ Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | - | ✅ Yes |
| `POSTGRES_CONNECTION_STRING` | PostgreSQL connection string | - | ✅ Yes |
| `POSTGRES_HOST` | PostgreSQL host | `db.project.supabase.co` | ❌ No |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | ❌ No |
| `POSTGRES_DB` | Database name | `postgres` | ❌ No |
| `POSTGRES_USER` | Database user | `postgres` | ❌ No |
| `POSTGRES_PASSWORD` | Database password | - | ✅ Yes |

### **🔐 Security Configuration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT tokens | - | ✅ Yes |
| `JWT_EXPIRATION` | Token expiration time (ms) | `86400000` (24h) | ❌ No |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration (ms) | `604800000` (7d) | ❌ No |
| `ENCRYPTION_KEY` | 32-character encryption key | - | ✅ Yes |
| `SESSION_SECRET` | Session secret key | - | ✅ Yes |

### **🌐 Server Configuration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BACKEND_PORT` | Server port | `8001` | ❌ No |
| `BACKEND_HOST` | Server host | `0.0.0.0` | ❌ No |
| `BACKEND_API_PREFIX` | API base path | `/api` | ❌ No |
| `NODE_ENV` | Node environment | `development` | ❌ No |

### **🎨 Frontend Integration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | ✅ Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | Frontend URL | ❌ No |

### **📧 Email Configuration (Optional)**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EMAIL_USERNAME` | SMTP username | - | ❌ No |
| `EMAIL_PASSWORD` | SMTP password | - | ❌ No |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` | ❌ No |
| `SMTP_PORT` | SMTP server port | `587` | ❌ No |

### **💳 Payment Integration (Optional)**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - | ❌ No |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | ❌ No |

### **📊 Logging & Debug**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Application log level | `info` | ❌ No |
| `DEBUG` | Enable debug mode | `false` | ❌ No |

### **🔒 Rate Limiting**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `RATE_LIMIT_REQUESTS` | Max requests per window | `100` | ❌ No |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `900` | ❌ No |

### **👤 Admin Configuration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_DEFAULT_EMAIL` | Default admin email | `admin@ritzone.com` | ❌ No |
| `ADMIN_DEFAULT_PASSWORD` | Default admin password | - | ✅ Yes |

## 🔒 **Security Best Practices**

### **1. JWT & Encryption Secrets**
- Use strong, random secret keys (minimum 64 characters for JWT)
- Use exactly 32 bytes (64 hex chars) for encryption keys
- Never commit secrets to version control
- Rotate secrets regularly in production

### **2. Database Credentials**
- Your Supabase credentials are secure and managed
- Use connection strings with proper authentication
- Enable Row Level Security (RLS) in Supabase for additional protection

### **3. Environment Files**
- Never commit `.env` files to Git
- Use different `.env` files for different environments
- Keep production secrets separate and secure
- Use `.env.example` as a template

## 🌍 **Environment-Specific Configuration**

### **Development**
```bash
# .env.development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=true
```

### **Production**
```bash
# .env.production
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
POSTGRES_CONNECTION_STRING=your-production-postgres-connection
FRONTEND_URL=https://ritzone-frontend.onrender.com
NODE_ENV=production
LOG_LEVEL=info
DEBUG=false
JWT_SECRET=your-super-secure-production-secret
ENCRYPTION_KEY=your-production-encryption-key
SESSION_SECRET=your-production-session-secret
```

### **Testing**
```bash
# .env.test
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-test-anon-key
POSTGRES_CONNECTION_STRING=your-test-postgres-connection
FRONTEND_URL=http://localhost:3000
NODE_ENV=test
LOG_LEVEL=warn
DEBUG=false
```

## 🚀 **Deployment Configuration**

### **Docker**
Environment variables are automatically loaded in Docker:
```dockerfile
# Dockerfile already configured to use environment variables
ENV SUPABASE_URL=${SUPABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=${NODE_ENV}
```

### **Render.com**
Set environment variables in Render Dashboard:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
POSTGRES_CONNECTION_STRING=your-postgres-connection
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=https://your-frontend.onrender.com
```

### **Other Cloud Platforms**

**Heroku:**
```bash
heroku config:set SUPABASE_URL="your-supabase-url"
heroku config:set JWT_SECRET="your-jwt-secret"
```

**Railway:**
```bash
railway variables set SUPABASE_URL="your-supabase-url"
railway variables set JWT_SECRET="your-jwt-secret"
```

**Vercel:**
```bash
vercel env add SUPABASE_URL
vercel env add JWT_SECRET
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Supabase Connection Failed**
   - Check `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Verify PostgreSQL connection string format
   - Ensure Supabase project is active

2. **Database Connection Errors**
   - Verify `POSTGRES_CONNECTION_STRING` format
   - Check if Supabase project allows connections
   - Ensure database schema is properly executed

3. **CORS Errors**
   - Verify `FRONTEND_URL` matches your frontend
   - Check `CORS_ALLOWED_ORIGINS` configuration
   - Ensure allowed origins include your domain

4. **JWT Errors**
   - Ensure `JWT_SECRET` is set and secure (64+ characters)
   - Check token expiration settings
   - Verify JWT secret consistency across deployments

5. **Environment Variable Issues**
   - Check if `.env` file is properly loaded
   - Verify environment variable names (case-sensitive)
   - Ensure no trailing spaces in variable values

### **Validation**
Run this command to validate your environment:
```bash
# Check environment loading
node -e "require('./config/environment').validateEnvironment()"

# Test database connection
npm run setup-db

# Start with debug logging
DEBUG=true npm start
```

### **Environment Testing**
```bash
# Test API health
curl http://localhost:8001/api/health

# Test environment info
curl http://localhost:8001/api/health | grep -o "supabaseConfigured.*"
```

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Node.js Environment Configuration](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Express.js Documentation](https://expressjs.com/)

---

**Environment configuration complete! Your RitZone backend is ready for deployment.** 🚀
