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

### **💳 Payment Integration (Optional)**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `STRIPE_PUBLIC_KEY` | Stripe publishable key | - | ❌ No |
| `STRIPE_SECRET_KEY` | Stripe secret key | - | ❌ No |

### **🔍 Google OAuth (Optional)**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | ❌ No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | ❌ No |

### **👤 Admin Configuration**
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_DEFAULT_EMAIL` | Default admin email | `admin@ritzone.com` | ❌ No |
| `ADMIN_DEFAULT_PASSWORD` | Default admin password | `RitZone@Admin2025` | ❌ No |

## 🔒 **Security Best Practices**

### **1. JWT Secret**
- Use a strong, random secret key (minimum 32 characters)
- Never commit JWT secrets to version control
- Rotate secrets regularly in production

### **2. Database Credentials**
- Your MongoDB Atlas credentials are already configured
- Use connection string with authentication
- Restrict database access by IP if possible

### **3. Environment Files**
- Never commit `.env` files to Git
- Use different `.env` files for different environments
- Keep production secrets separate and secure

## 🌍 **Environment-Specific Configuration**

### **Development**
```bash
# .env.development
MONGODB_URI=mongodb+srv://ritkart-admin:RakAJVBURLCJ0uHy@ritkart-cluster.yopyqig.mongodb.net/ritkart-dev
FRONTEND_URL=http://localhost:3000
LOG_LEVEL_RITZONE=DEBUG
```

### **Production**
```bash
# .env.production
MONGODB_URI=mongodb+srv://ritkart-admin:RakAJVBURLCJ0uHy@ritkart-cluster.yopyqig.mongodb.net/ritkart
FRONTEND_URL=https://ritkart-frontend.onrender.com
LOG_LEVEL_RITZONE=INFO
JWT_SECRET=your-super-secure-production-secret
```

### **Testing**
```bash
# .env.test
MONGODB_URI=mongodb://localhost:27017/ritkart-test
FRONTEND_URL=http://localhost:3000
LOG_LEVEL_RITZONE=WARN
```

## 🚀 **Deployment Configuration**

### **Docker**
Environment variables are automatically loaded in Docker:
```dockerfile
# Dockerfile already configured to use environment variables
ENV MONGODB_URI=${MONGODB_URI}
ENV JWT_SECRET=${JWT_SECRET}
```

### **Cloud Deployment**
Set environment variables in your cloud platform:

**Heroku:**
```bash
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
```

**Railway:**
```bash
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-jwt-secret"
```

**Render:**
Add environment variables in the Render dashboard.

## 🔍 **Troubleshooting**

### **Common Issues**

1. **MongoDB Connection Failed**
   - Check `MONGODB_URI` format
   - Verify network access to MongoDB Atlas
   - Ensure database user has proper permissions

2. **CORS Errors**
   - Verify `FRONTEND_URL` matches your frontend
   - Check `CORS_ALLOWED_ORIGINS` configuration

3. **JWT Errors**
   - Ensure `JWT_SECRET` is set and secure
   - Check token expiration settings

### **Validation**
Run this command to check your environment:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

## 📚 **Additional Resources**

- [Spring Boot External Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [MongoDB Atlas Connection Guide](https://docs.atlas.mongodb.com/connect-to-cluster/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**🔐 Your environment is now securely configured and ready for development!**
