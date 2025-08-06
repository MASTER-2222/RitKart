package com.ritzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for Product
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDTO {
    
    private String id;
    
    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.01", message = "Original price must be greater than 0")
    private BigDecimal originalPrice;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Brand is required")
    private String brand;
    
    private String sku;
    
    @Min(value = 0, message = "Stock count cannot be negative")
    private Integer stockCount;
    
    private Boolean inStock;
    
    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    private Double rating;
    
    @Min(value = 0, message = "Review count cannot be negative")
    private Integer reviewCount;
    
    @NotEmpty(message = "At least one image is required")
    private List<String> images;
    
    private Boolean isPrime;
    
    private Boolean isDeliveryTomorrow;
    
    @Min(value = 0, message = "Discount cannot be negative")
    @Max(value = 100, message = "Discount cannot exceed 100%")
    private Integer discount;
    
    private List<String> features;
    
    private Map<String, String> specifications;
    
    private Boolean isActive;
    
    private Boolean isFeatured;
    
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    private Double weight;
    
    private DimensionsDTO dimensions;
    
    private List<String> tags;
    
    private Long viewCount;
    
    private Long salesCount;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Computed fields
    private String mainImage;
    private BigDecimal discountAmount;
    private Double discountPercentage;
    private Boolean hasDiscount;
    
    /**
     * DTO for product dimensions
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class DimensionsDTO {
        private Double length; // in cm
        private Double width;  // in cm
        private Double height; // in cm
    }
    
    // Helper methods for computed fields
    public String getMainImage() {
        return images != null && !images.isEmpty() ? images.get(0) : null;
    }
    
    public BigDecimal getDiscountAmount() {
        if (originalPrice != null && price != null) {
            return originalPrice.subtract(price);
        }
        return BigDecimal.ZERO;
    }
    
    public Double getDiscountPercentage() {
        if (originalPrice != null && originalPrice.compareTo(BigDecimal.ZERO) > 0 && price != null) {
            BigDecimal discountAmount = originalPrice.subtract(price);
            return discountAmount.divide(originalPrice, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        return 0.0;
    }
    
    public Boolean getHasDiscount() {
        return originalPrice != null && price != null && originalPrice.compareTo(price) > 0;
    }
}
