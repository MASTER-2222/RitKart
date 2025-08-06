package com.ritzone.service;

import com.ritzone.model.Product;
import com.ritzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Service to initialize database with sample data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService implements CommandLineRunner {
    
    private final ProductRepository productRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            log.info("Database is empty. Initializing with sample data...");
            initializeProducts();
            log.info("Sample data initialization completed!");
        } else {
            log.info("Database already contains data. Skipping initialization.");
        }
    }
    
    private void initializeProducts() {
        List<Product> sampleProducts = Arrays.asList(
            // Electronics
            createProduct("1", "Apple MacBook Pro 14-inch M3 Chip with 8-Core CPU and 10-Core GPU", 
                "The most advanced MacBook Pro ever", new BigDecimal("1599"), new BigDecimal("1999"),
                "electronics", "Apple", "RZ-MACBOOK-M3", 25, 4.8, 2847,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop&crop=center",
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop&crop=center"
                ),
                true, true, 20, true, true,
                Arrays.asList("M3 Chip", "14-inch Liquid Retina XDR display", "Up to 22 hours battery life"),
                Map.of("Processor", "Apple M3 chip", "Memory", "8GB unified memory", "Storage", "512GB SSD")),
            
            createProduct("2", "Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones",
                "Industry-leading noise canceling with Dual Noise Sensor technology", new BigDecimal("248"), new BigDecimal("349"),
                "electronics", "Sony", "RZ-SONY-WH1000XM4", 50, 4.6, 15432,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&crop=center",
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop&crop=center"
                ),
                true, true, 29, true, false,
                Arrays.asList("Industry-leading noise canceling", "30-hour battery life", "Touch Sensor controls"),
                Map.of("Driver Unit", "40mm", "Frequency Response", "4 Hz-40,000 Hz", "Battery Life", "30 hours")),
            
            createProduct("3", "Samsung 65\" Class 4K UHD Smart LED TV with HDR",
                "Crystal clear 4K UHD resolution with HDR support", new BigDecimal("547"), new BigDecimal("799"),
                "electronics", "Samsung", "RZ-SAMSUNG-TV65", 15, 4.5, 8934,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop&crop=center"
                ),
                true, false, 32, true, false,
                Arrays.asList("4K UHD Resolution", "HDR Support", "Smart TV Platform"),
                Map.of("Screen Size", "65 inches", "Resolution", "3840 x 2160", "HDR", "HDR10+")),
            
            // Fashion
            createProduct("4", "Nike Air Max 270 Running Shoes",
                "Comfortable running shoes with Max Air cushioning", new BigDecimal("130"), new BigDecimal("150"),
                "fashion", "Nike", "RZ-NIKE-AM270", 100, 4.4, 5621,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center"
                ),
                false, false, 13, true, false,
                Arrays.asList("Max Air cushioning", "Breathable mesh upper", "Durable rubber outsole"),
                Map.of("Material", "Synthetic and mesh", "Sole", "Rubber", "Closure", "Lace-up")),
            
            createProduct("5", "Levi's 501 Original Fit Jeans",
                "The original blue jean since 1873", new BigDecimal("59.50"), new BigDecimal("69.50"),
                "fashion", "Levi's", "RZ-LEVIS-501", 200, 4.3, 12743,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center"
                ),
                false, false, 14, true, false,
                Arrays.asList("100% cotton denim", "Button fly", "Classic straight fit"),
                Map.of("Material", "100% Cotton", "Fit", "Straight", "Rise", "Mid")),
            
            // Books
            createProduct("6", "The Psychology of Money by Morgan Housel",
                "Timeless lessons on wealth, greed, and happiness", new BigDecimal("14.99"), new BigDecimal("18.99"),
                "books", "Harriman House", "RZ-BOOK-POM", 500, 4.7, 89234,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop&crop=center"
                ),
                true, true, 21, true, false,
                Arrays.asList("Bestselling finance book", "Easy to understand", "Practical advice"),
                Map.of("Pages", "256", "Publisher", "Harriman House", "Language", "English")),
            
            // Home & Garden
            createProduct("7", "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
                "7 appliances in 1: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer", 
                new BigDecimal("79.95"), new BigDecimal("99.95"),
                "home", "Instant Pot", "RZ-INSTANT-DUO", 75, 4.6, 45678,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1585515656973-a0b8b2a4e4c9?w=300&h=300&fit=crop&crop=center"
                ),
                true, false, 20, true, false,
                Arrays.asList("7-in-1 functionality", "6-quart capacity", "10 safety features"),
                Map.of("Capacity", "6 Quart", "Material", "Stainless Steel", "Programs", "13 Smart Programs")),
            
            // Sports & Outdoors
            createProduct("8", "Yeti Rambler 20 oz Tumbler",
                "Double-wall vacuum insulated tumbler", new BigDecimal("35"), new BigDecimal("40"),
                "sports", "Yeti", "RZ-YETI-RAMBLER", 150, 4.8, 23456,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop&crop=center"
                ),
                false, false, 12, true, false,
                Arrays.asList("Double-wall vacuum insulation", "Dishwasher safe", "No Sweat Design"),
                Map.of("Capacity", "20 oz", "Material", "Stainless Steel", "Insulation", "Double-wall vacuum")),
            
            // Grocery
            createProduct("9", "Organic Whole Milk - 1 Gallon",
                "Fresh organic whole milk from grass-fed cows", new BigDecimal("5.99"), null,
                "grocery", "Organic Valley", "RZ-MILK-ORGANIC", 50, 4.5, 1234,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&crop=center"
                ),
                false, true, null, true, false,
                Arrays.asList("Organic certified", "Grass-fed cows", "No artificial hormones"),
                Map.of("Size", "1 Gallon", "Type", "Whole Milk", "Organic", "Yes")),
            
            // Beauty & Personal Care
            createProduct("10", "CeraVe Moisturizing Cream",
                "Daily face and body moisturizer for dry skin", new BigDecimal("16.99"), new BigDecimal("19.99"),
                "beauty", "CeraVe", "RZ-CERAVE-MOIST", 200, 4.4, 34567,
                Arrays.asList(
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop&crop=center"
                ),
                false, false, 15, true, false,
                Arrays.asList("3 essential ceramides", "Hyaluronic acid", "24-hour hydration"),
                Map.of("Size", "16 oz", "Skin Type", "Dry skin", "Key Ingredients", "Ceramides, Hyaluronic Acid"))
        );
        
        productRepository.saveAll(sampleProducts);
        log.info("Saved {} sample products to database", sampleProducts.size());
    }
    
    private Product createProduct(String id, String title, String description, BigDecimal price, BigDecimal originalPrice,
                                String category, String brand, String sku, int stockCount, double rating, int reviewCount,
                                List<String> images, boolean isPrime, boolean isDeliveryTomorrow, Integer discount,
                                boolean isActive, boolean isFeatured, List<String> features, Map<String, String> specifications) {
        return Product.builder()
                .id(id)
                .title(title)
                .description(description)
                .price(price)
                .originalPrice(originalPrice)
                .category(category)
                .brand(brand)
                .sku(sku)
                .stockCount(stockCount)
                .inStock(stockCount > 0)
                .rating(rating)
                .reviewCount(reviewCount)
                .images(images)
                .isPrime(isPrime)
                .isDeliveryTomorrow(isDeliveryTomorrow)
                .discount(discount)
                .features(features)
                .specifications(specifications)
                .isActive(isActive)
                .isFeatured(isFeatured)
                .weight(1.0)
                .tags(Arrays.asList(category, brand.toLowerCase()))
                .viewCount(0L)
                .salesCount(0L)
                .build();
    }
}
