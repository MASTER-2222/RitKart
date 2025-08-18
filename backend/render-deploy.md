# RitZone Backend Production Deployment Guide for Render

## 🚨 CRITICAL ISSUE: Backend Showing Blank Screen

Your backend at `https://ritkart-backend.onrender.com/api` shows blank screen because:

### **1. Environment Variables Setup**

In your **Render Dashboard** for the backend service, set these environment variables:

```bash
# ==============================================
# 🌐 SERVER CONFIGURATION
# ==============================================
NODE_ENV=production
PORT=10000
BACKEND_HOST=0.0.0.0
BACKEND_API_PREFIX=/api

# ==============================================
# 🔗 CORS & FRONTEND URL  
# ==============================================
CORS_ALLOWED_ORIGINS=https://ritzone-frontend.onrender.com
FRONTEND_URL=https://ritzone-frontend.onrender.com

# ==============================================
# 🗄️ SUPABASE CONFIGURATION
# ==============================================
SUPABASE_URL=https://igzpodmmymbptmwebonh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDczNDIsImV4cCI6MjA3MDEyMzM0Mn0.eOy5F_0pE7ki3TXl49bW5c0K1TWGKf2_Vpn1IRKWQRc
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenBvZG1teW1icHRtd2Vib25oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU0NzM0MiwiZXhwIjoyMDcwMTIzMzQyfQ.v5X_Xf2sg2ISCxLzBqBnzD3mb383pF3-qI27BEvjG7I

# ==============================================
# 🐘 DATABASE CONFIGURATION
# ==============================================
POSTGRES_CONNECTION_STRING=postgresql://postgres:e%UKa?Y@2MdT7DH@db.igzpodmmymbptmwebonh.supabase.co:5432/postgres
POSTGRES_HOST=db.igzpodmmymbptmwebonh.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=e%UKa?Y@2MdT7DH

# ==============================================
# 🔐 SECURITY CONFIGURATION
# ==============================================
JWT_SECRET=735d128c902bf4824911f474289823e989ad7da659f7b444594ccfd31142a10b1590e26867bba1661f0a29480be1ee161732cccaa7be44bf7a1e933599bcca54
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
ENCRYPTION_KEY=ed6c177f4b5ac4cbe9096d60db199f3e01e48e983d98a788e4442ca73d066777
SESSION_SECRET=1a2a67680e51448eeb4e799994657eb49fc0a0b9cdfe0906cf2b6b928c9d7d71dd052108e3ae764399c8c9e82c7b6052

# ==============================================
# 📊 MONITORING & RATE LIMITING
# ==============================================
LOG_LEVEL=info
DEBUG=false
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=900

# ==============================================
# 👨‍💼 ADMIN CONFIGURATION
# ==============================================
ADMIN_DEFAULT_EMAIL=admin@ritzone.com
ADMIN_DEFAULT_PASSWORD=RitZone@Admin2025!
```

### **2. Build Commands in Render**

**Build Command:**
```bash
cd backend && npm install
```

**Start Command:**
```bash
cd backend && npm start
```

### **3. Root Directory Configuration**

In Render Dashboard, set **Root Directory** to: `backend`

### **4. Node.js Version**

Set **Runtime** to: `Node.js 18` or higher

## 🔍 **Testing After Deployment**

Once deployed correctly, these URLs should work:

1. **Health Check:** `https://ritkart-backend.onrender.com/api/health`
2. **API Root:** `https://ritkart-backend.onrender.com/api`
3. **Products:** `https://ritkart-backend.onrender.com/api/products`

## 🚨 **Common Issues & Solutions**

### Issue: "Module not found" errors
**Solution:** Ensure all dependencies in `package.json` are installed

### Issue: Port binding errors  
**Solution:** Render automatically provides PORT environment variable

### Issue: CORS errors
**Solution:** Set CORS_ALLOWED_ORIGINS to your frontend domain

### Issue: Database connection fails
**Solution:** Verify all SUPABASE_* environment variables are set correctly

## 📞 **Immediate Action Items**

1. **Set Environment Variables** in Render Dashboard (copy from above)
2. **Update Build/Start Commands** as specified
3. **Set Root Directory** to `backend`
4. **Redeploy** the service
5. **Test** the endpoints listed above

Your backend will work immediately after proper configuration!