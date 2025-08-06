# RitZone Backend API

A comprehensive Spring Boot backend for the RitZone e-commerce platform, built with Java 17, Spring Boot 3.2.1, and MongoDB.

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
- **MongoDB Integration**: NoSQL database with Spring Data MongoDB
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **Exception Handling**: Global exception handling with meaningful error responses
- **Caching**: Redis-compatible caching for improved performance
- **API Documentation**: Swagger/OpenAPI 3.0 documentation
- **CORS Support**: Cross-origin resource sharing configuration
- **Logging**: Structured logging with SLF4J and Logback

## 🛠 Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data MongoDB**
- **Spring Security**
- **JWT (JSON Web Tokens)**
- **MongoDB**
- **Maven**
- **Swagger/OpenAPI 3.0**
- **Lombok**
- **ModelMapper**

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 4.4+ (local or MongoDB Atlas)
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/MASTER-2222/RitKart.git
cd RitKart/backend
```

### 2. Configure MongoDB
Update `src/main/resources/application.yml`:

**For Local MongoDB:**
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/ritzone
```

**For MongoDB Atlas:**
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://username:password@cluster.mongodb.net/ritzone?retryWrites=true&w=majority
```

### 3. Configure Environment Variables
Create a `.env` file or set environment variables:
```bash
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### 4. Build and Run
```bash
# Build the project
mvn clean compile

# Run the application
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

### 5. Access API Documentation
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **API Docs**: http://localhost:8080/api/api-docs
- **Health Check**: http://localhost:8080/api/actuator/health

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

### Users (Coming Soon)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Cart (Coming Soon)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{itemId}` - Update cart item
- `DELETE /api/cart/items/{itemId}` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders (Coming Soon)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}/cancel` - Cancel order

## 🗄 Database Schema

### Product Collection
```javascript
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "price": "Decimal128",
  "originalPrice": "Decimal128",
  "category": "String",
  "brand": "String",
  "sku": "String",
  "stockCount": "Number",
  "inStock": "Boolean",
  "rating": "Number",
  "reviewCount": "Number",
  "images": ["String"],
  "isPrime": "Boolean",
  "isDeliveryTomorrow": "Boolean",
  "discount": "Number",
  "features": ["String"],
  "specifications": "Object",
  "isActive": "Boolean",
  "isFeatured": "Boolean",
  "weight": "Number",
  "dimensions": {
    "length": "Number",
    "width": "Number",
    "height": "Number"
  },
  "tags": ["String"],
  "viewCount": "Number",
  "salesCount": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 🔧 Configuration

### Application Properties
Key configuration options in `application.yml`:

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
