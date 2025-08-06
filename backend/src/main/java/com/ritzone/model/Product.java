package com.ritzone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Product entity representing items in the RitZone catalog
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    
    @Id
    private String id;
    
    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    @TextIndexed(weight = 10)
    private String title;
    
    @TextIndexed(weight = 5)
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.01", message = "Original price must be greater than 0")
    private BigDecimal originalPrice;
    
    @NotBlank(message = "Category is required")
    @Indexed
    private String category;
    
    @NotBlank(message = "Brand is required")
    @Indexed
    private String brand;
    
    @NotBlank(message = "SKU is required")
    @Indexed(unique = true)
    private String sku;
    
    @Min(value = 0, message = "Stock count cannot be negative")
    private Integer stockCount;
    
    @Builder.Default
    private Boolean inStock = true;
    
    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Builder.Default
    private Double rating = 0.0;
    
    @Min(value = 0, message = "Review count cannot be negative")
    @Builder.Default
    private Integer reviewCount = 0;
    
    @NotEmpty(message = "At least one image is required")
    private List<String> images;
    
    @Builder.Default
    private Boolean isPrime = false;
    
    @Builder.Default
    private Boolean isDeliveryTomorrow = false;
    
    @Min(value = 0, message = "Discount cannot be negative")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private Integer discount;
    
    private List<String> features;
    
    private Map<String, String> specifications;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Boolean isFeatured = false;
    
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    private Double weight; // in kg
    
    private Dimensions dimensions;
    
    @TextIndexed(weight = 3)
    private List<String> tags;
    
    @Min(value = 0, message = "View count cannot be negative")
    @Builder.Default
    private Long viewCount = 0L;
    
    @Min(value = 0, message = "Sales count cannot be negative")
    @Builder.Default
    private Long salesCount = 0L;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Nested class for product dimensions
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Dimensions {
        private Double length; // in cm
        private Double width;  // in cm
        private Double height; // in cm
    }
    
    // Helper methods
    public String getMainImage() {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }
    
    public BigDecimal getDiscountAmount() {
        if (originalPrice != null && discount != null && discount > 0) {
            return originalPrice.subtract(price);
        }
        return BigDecimal.ZERO;
    }
    
    public Double getDiscountPercentage() {
        if (originalPrice != null && originalPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = originalPrice.subtract(price);
            return discountAmount.divide(originalPrice, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        return 0.0;
    }
    
    public Boolean hasDiscount() {
        return originalPrice != null && originalPrice.compareTo(price) > 0;
    }
}
