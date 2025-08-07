# RitZone Backend API

A comprehensive Node.js backend for the RitZone e-commerce platform, built with Express.js, TypeScript, and Supabase PostgreSQL.

## 🚀 Features

### Core Functionality
- **Product Management**: Complete CRUD operations for products
- **User Management**: User registration, authentication, and profile management
- **Shopping Cart**: Add, update, remove items from cart
- **Order Management**: Order creation, tracking, and status updates
- **Search & Filtering**: Advanced product search and filtering capabilities
- **Admin Dashboard**: Administrative functions for managing the platform

### Technical Features
- **RESTful API**: Clean and well-documented REST endpoints
- **Supabase Integration**: PostgreSQL database with Supabase backend-as-a-service
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation with Joi
- **Exception Handling**: Global exception handling with meaningful error responses
- **Rate Limiting**: API rate limiting for security and performance
- **CORS Support**: Cross-origin resource sharing configuration
- **Logging**: Structured logging with Morgan
- **Environment Configuration**: Centralized environment variable management

## 🛠 Technology Stack

- **Node.js 18+**
- **Express.js 4.19+**
- **Supabase (PostgreSQL)**
- **JWT (JSON Web Tokens)**
- **Joi (Validation)**
- **Bcrypt (Password Hashing)**
- **Morgan (Logging)**
- **Helmet (Security)**
- **CORS (Cross-Origin)**

## 📋 Prerequisites

- Node.js 18 or higher
- npm 8+ or Yarn
- Supabase account and project
- IDE (VS Code, WebStorm, or similar)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/MASTER-2222/RitKart.git
cd RitKart/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file using `.env.example` as template:
```bash
cp .env.example .env
```

Update the `.env` file with your credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# PostgreSQL Configuration
POSTGRES_CONNECTION_STRING=postgresql://postgres:password@host:5432/postgres

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret

# Server Configuration
BACKEND_PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Admin Configuration
ADMIN_DEFAULT_EMAIL=admin@ritzone.com
ADMIN_DEFAULT_PASSWORD=your-secure-password
```

### 4. Setup Database Schema
Execute the database schema in your Supabase SQL Editor:
```bash
# The schema file is located at: /database-schema.sql
# Copy and execute it in Supabase Dashboard > SQL Editor
```

### 5. Run the Application
```bash
# Development mode
npm run dev

# Production mode
npm start

# Or use the startup scripts
./start-backend.sh    # Linux/Mac
start-backend.bat     # Windows
```

The API will be available at: `http://localhost:8001/api`

### 6. Verify Installation
- **Health Check**: http://localhost:8001/api/health
- **API Base**: http://localhost:8001/api

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/sku/{sku}` - Get product by SKU
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/brand/{brand}` - Get products by brand
- `POST /api/products/search` - Search products
- `POST /api/products/filter` - Filter products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/discounts` - Get discounted products
- `GET /api/products/prime` - Get Prime products
- `GET /api/products/top-selling` - Get top selling products
- `GET /api/products/most-viewed` - Get most viewed products
- `GET /api/products/recent` - Get recently added products
- `GET /api/products/{id}/related` - Get related products

### Users
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders

### Categories
- `GET /api/categories` - Get all categories

## 🗄 Database Schema (PostgreSQL)

The application uses PostgreSQL via Supabase with the following main tables:

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category VARCHAR NOT NULL,
  brand VARCHAR,
  sku VARCHAR UNIQUE,
  stock_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  images TEXT[],
  is_prime BOOLEAN DEFAULT false,
  is_delivery_tomorrow BOOLEAN DEFAULT false,
  discount INTEGER DEFAULT 0,
  features TEXT[],
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  weight DECIMAL(8,2),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuration

### Environment Variables
The application uses environment variables for configuration. See `.env.example` for all available options.

### Key Configuration Files
- `config/environment.js` - Centralized environment configuration
- `server.js` - Main application server
- `package.json` - Dependencies and scripts

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/ritzone

jwt:
  secret: your-secret-key
  expiration: 86400000 # 24 hours

app:
  cors:
    allowed-origins:
      - http://localhost:3000
      - https://ritkart-frontend.onrender.com
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=ProductServiceTest

# Run tests with coverage
mvn test jacoco:report
```

## 📦 Deployment

### Docker Deployment
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/ritzone-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Build Docker Image
```bash
mvn clean package
docker build -t ritzone-backend .
docker run -p 8080:8080 ritzone-backend
```

## 🔒 Security

- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Input validation and sanitization
- SQL injection prevention (NoSQL injection for MongoDB)

## 📊 Monitoring

- Spring Boot Actuator endpoints
- Health checks
- Metrics collection
- Application logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: dev@ritzone.com
- GitHub Issues: [Create an issue](https://github.com/MASTER-2222/RitKart/issues)

## 🚧 Roadmap

- [ ] User authentication and authorization
- [ ] Shopping cart functionality
- [ ] Order management system
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Admin dashboard APIs
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Inventory management
- [ ] Analytics and reporting

---

**Built with ❤️ by the RitZone Development Team**
