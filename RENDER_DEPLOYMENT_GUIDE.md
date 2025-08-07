# 🚀 RitZone Deployment Guide for Render.com

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Domain Configuration](#domain-configuration)
7. [Database Setup](#database-setup)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment Tasks](#post-deployment-tasks)

---

## 📚 Prerequisites

Before starting the deployment process, ensure you have:

- ✅ **Render.com Account** - [Sign up here](https://render.com/)
- ✅ **GitHub Repository** - Your RitZone code pushed to GitHub
- ✅ **Supabase Account** - With your project already set up
- ✅ **Domain Name** (Optional) - For custom domains

### 🔑 Required Credentials (You Already Have These)
```
Supabase Project URL: https://igzpodmmymbptmwebonh.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc
Supabase Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU0NzM0MiwiZXhwIjoyMDcwMTIzMzQyfQ.v5X_Xf2sg2ISCxLzBqBnzD3mb383pF3-qI27BEvjG7I
PostgreSQL Connection String: postgresql://postgres:e%UKa?Y@2MdT7DH@db.igzpodmmymbptmwebonh.supabase.co:5432/postgres
```

---

## 🏗️ Project Overview

Your RitZone application consists of:
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Node.js/Express with Supabase integration
- **Database**: PostgreSQL via Supabase
- **Tech Stack**: React, TypeScript, Tailwind, Express, PostgreSQL

---

## 🔧 Backend Deployment

### Step 1: Create Backend Service

1. **Log into Render.com**
   - Go to [render.com](https://render.com/)
   - Click "Dashboard"

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/MASTER-2222/RitKart`

3. **Configure Backend Service**
   ```
   Name: ritzone-backend
   Environment: Node
   Region: Oregon (or your preferred region)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

### Step 2: Backend Environment Variables

In the Render Dashboard, add these environment variables for your backend service:

#### 🗄️ Supabase Configuration
```env
SUPABASE_URL=https://igzpodmmymbptmwebonh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc
```

#### 🐘 PostgreSQL Database Configuration
```env
POSTGRES_HOST=db.igzpodmmymbptmwebonh.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=e%UKa?Y@2MdT7DH
POSTGRES_CONNECTION_STRING=postgresql://postgres:e%UKa?Y@2MdT7DH@db.igzpodmmymbptmwebonh.supabase.co:5432/postgres
```

#### 🔐 Security Configuration
```env
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-complex
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-key-here
```

#### 🌐 Server Configuration
```env
BACKEND_PORT=10000
BACKEND_HOST=0.0.0.0
BACKEND_API_PREFIX=/api
NODE_ENV=production
```

#### 🎨 Frontend Integration
```env
FRONTEND_URL=https://ritzone-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://ritzone-frontend.onrender.com
```

#### 📊 Additional Configuration
```env
LOG_LEVEL=info
DEBUG=false
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=900
ADMIN_DEFAULT_EMAIL=admin@ritzone.com
ADMIN_DEFAULT_PASSWORD=RitZone@Admin2025!
```

### Step 3: Deploy Backend
- Click "Create Web Service"
- Wait for deployment (usually 5-10 minutes)
- Your backend will be available at: `https://ritzone-backend.onrender.com`

---

## 🎨 Frontend Deployment

### Step 1: Create Frontend Service

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect the same GitHub repository: `https://github.com/MASTER-2222/RitKart`

2. **Configure Frontend Service**
   ```
   Name: ritzone-frontend
   Environment: Node
   Region: Oregon (same as backend)
   Branch: main
   Root Directory: . (leave blank or use root)
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### Step 2: Frontend Environment Variables

Add these environment variables for your frontend service:

#### 🔗 API Integration
```env
NEXT_PUBLIC_BACKEND_URL=https://ritkart-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://ritkart-backend.onrender.com/api
```

#### 🗄️ Supabase Frontend Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://igzpodmmymbptmwebonh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc
```

#### 🌐 Next.js Configuration
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOST=0.0.0.0
```

#### 🎯 Application Configuration
```env
NEXT_PUBLIC_APP_NAME=RitZone
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=https://ritzone-frontend.onrender.com
```

### Step 3: Deploy Frontend
- Click "Create Web Service"
- Wait for deployment (usually 10-15 minutes)
- Your frontend will be available at: `https://ritzone-frontend.onrender.com`

---

## 🔄 Environment Variables Configuration

### Backend Environment Variables Summary
```env
# Database & Supabase
SUPABASE_URL=https://igzpodmmymbptmwebonh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc
POSTGRES_CONNECTION_STRING=postgresql://postgres:e%UKa?Y@2MdT7DH@db.igzpodmmymbptmwebonh.supabase.co:5432/postgres

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-complex
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-key-here

# Server Config
BACKEND_PORT=10000
NODE_ENV=production
FRONTEND_URL=https://ritzone-frontend.onrender.com
CORS_ALLOWED_ORIGINS=https://ritzone-frontend.onrender.com

# Admin
ADMIN_DEFAULT_EMAIL=admin@ritzone.com
ADMIN_DEFAULT_PASSWORD=RitZone@Admin2025!
```

### Frontend Environment Variables Summary
```env
# API Integration
NEXT_PUBLIC_BACKEND_URL=https://ritzone-backend.onrender.com/api
REACT_APP_BACKEND_URL=https://ritzone-backend.onrender.com/api

# Supabase Frontend
NEXT_PUBLIC_SUPABASE_URL=https://igzpodmmymbptmwebonh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc

# App Config
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=RitZone
NEXT_PUBLIC_APP_URL=https://ritzone-frontend.onrender.com
```

---

## 🌐 Domain Configuration

### Custom Domain Setup (Optional)

If you have a custom domain:

#### For Frontend:
1. Go to your frontend service settings
2. Click "Custom Domains"
3. Add your domain (e.g., `ritzone.com`)
4. Follow DNS configuration instructions

#### For Backend:
1. Go to your backend service settings
2. Click "Custom Domains"
3. Add your API subdomain (e.g., `api.ritzone.com`)
4. Update frontend environment variables accordingly

---

## 🗄️ Database Setup

### Step 1: Execute Database Schema

1. **Go to Supabase Dashboard**
   - Visit: https://igzpodmmymbptmwebonh.supabase.co
   - Navigate to "SQL Editor"

2. **Execute Database Schema**
   - Copy the contents from `/app/database-schema.sql` from your project
   - Paste into SQL Editor
   - Click "Run" to execute the schema

### Step 2: Verify Database Connection

1. **Test Backend Health**
   - Visit: `https://ritzone-backend.onrender.com/api/health`
   - Should return success message with database connection status

2. **Check Database Tables**
   - In Supabase Dashboard, go to "Table Editor"
   - Verify all tables are created successfully

---

## 🧪 Testing & Verification

### Backend Testing Checklist

1. **Health Check**
   ```bash
   curl https://ritzone-backend.onrender.com/api/health
   ```

2. **API Base Endpoint**
   ```bash
   curl https://ritzone-backend.onrender.com/api
   ```

3. **Test Authentication Endpoint**
   ```bash
   curl -X POST https://ritzone-backend.onrender.com/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"email":"test@example.com","password":"testpass123"}'
   ```

### Frontend Testing Checklist

1. **Homepage Load**
   - Visit: `https://ritzone-frontend.onrender.com`
   - Verify page loads without errors

2. **API Integration**
   - Check browser console for errors
   - Verify API calls are reaching backend

3. **Database Integration**
   - Test user registration/login
   - Verify product data loading

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Backend Issues

**Issue**: `Environment variables not found`
```bash
# Solution: Ensure all required env vars are set in Render Dashboard
# Check: Settings → Environment → Environment Variables
```

**Issue**: `Database connection failed`
```bash
# Solution: Verify PostgreSQL connection string
# Check: Supabase → Settings → Database → Connection String
```

**Issue**: `CORS errors`
```bash
# Solution: Update CORS_ALLOWED_ORIGINS to include frontend URL
CORS_ALLOWED_ORIGINS=https://ritzone-frontend.onrender.com
```

#### Frontend Issues

**Issue**: `API calls failing`
```bash
# Solution: Verify NEXT_PUBLIC_BACKEND_URL is correct
NEXT_PUBLIC_BACKEND_URL=https://ritzone-backend.onrender.com/api
```

**Issue**: `Build failures`
```bash
# Solution: Check build logs in Render Dashboard
# Common fix: Ensure all TypeScript errors are resolved
```

**Issue**: `Environment variables not accessible`
```bash
# Solution: Ensure frontend env vars start with NEXT_PUBLIC_
# Example: NEXT_PUBLIC_BACKEND_URL (not BACKEND_URL)
```

### Debugging Steps

1. **Check Render Logs**
   - Go to service → "Logs" tab
   - Look for error messages during build/runtime

2. **Verify Environment Variables**
   - Settings → Environment → Environment Variables
   - Ensure all required variables are present

3. **Test Locally First**
   ```bash
   # Test backend locally
   cd backend && npm start
   
   # Test frontend locally
   npm run dev
   ```

---

## 📋 Post-Deployment Tasks

### Step 1: Security Checklist
- [ ] Change default admin password
- [ ] Update JWT secrets to strong values
- [ ] Enable HTTPS (automatic with Render)
- [ ] Configure rate limiting appropriately

### Step 2: Performance Optimization
- [ ] Enable Render's CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up monitoring and alerts

### Step 3: Backup Strategy
- [ ] Configure Supabase automated backups
- [ ] Document recovery procedures
- [ ] Test backup restoration process

### Step 4: Domain & SSL
- [ ] Configure custom domain (if applicable)
- [ ] Verify SSL certificates
- [ ] Update DNS records

---

## 🎯 Success Verification

After successful deployment, you should be able to:

✅ **Frontend**: Access your app at `https://ritzone-frontend.onrender.com`
✅ **Backend**: API responds at `https://ritzone-backend.onrender.com/api`
✅ **Health Check**: Returns success at `/api/health`
✅ **Database**: Successfully connects to Supabase PostgreSQL
✅ **Authentication**: User registration/login works
✅ **Products**: Product data loads from database

---

## 📚 Additional Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Environment Variables**: [render.com/docs/environment-variables](https://render.com/docs/environment-variables)

---

## 🆘 Support

If you encounter any issues during deployment:

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Community Support**: [community.render.com](https://community.render.com)
3. **Documentation**: [render.com/docs](https://render.com/docs)

---

## 🎉 Congratulations!

Your RitZone application is now successfully deployed on Render.com with:
- ✅ Next.js Frontend
- ✅ Express.js Backend
- ✅ Supabase PostgreSQL Database
- ✅ Environment Variables Configuration
- ✅ Secure HTTPS Communication
- ✅ Scalable Infrastructure

Your application URLs:
- **Frontend**: https://ritzone-frontend.onrender.com
- **Backend API**: https://ritzone-backend.onrender.com/api
- **Health Check**: https://ritzone-backend.onrender.com/api/health

---

*Generated for RitZone deployment on Render.com - 2025*