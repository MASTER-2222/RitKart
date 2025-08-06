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

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Cart entity representing user shopping carts in RitZone
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carts")
public class Cart {
    
    @Id
    private String id;
    
    @NotBlank(message = "User ID is required")
    @Indexed(unique = true)
    private String userId;
    
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();
    
    @Builder.Default
    private Boolean isActive = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Nested class for cart items
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItem {
        private String productId;
        private String productTitle;
        private String productImage;
        private String productSku;
        private BigDecimal unitPrice;
        private BigDecimal originalPrice;
        private Integer quantity;
        private Boolean isPrime;
        private Boolean inStock;
        private String productBrand;
        private String productCategory;
        private LocalDateTime addedAt;
        private LocalDateTime updatedAt;
    }
    
    // Helper methods
    public Integer getTotalItems() {
        return items != null ? items.stream().mapToInt(CartItem::getQuantity).sum() : 0;
    }
    
    public BigDecimal getSubtotal() {
        return items != null ? 
                items.stream()
                        .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalSavings() {
        return items != null ? 
                items.stream()
                        .filter(item -> item.getOriginalPrice() != null)
                        .map(item -> {
                            BigDecimal savings = item.getOriginalPrice().subtract(item.getUnitPrice());
                            return savings.multiply(BigDecimal.valueOf(item.getQuantity()));
                        })
                        .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;
    }
    
    public Boolean isEmpty() {
        return items == null || items.isEmpty();
    }
    
    public Boolean hasOutOfStockItems() {
        return items != null && items.stream().anyMatch(item -> !item.getInStock());
    }
    
    public Boolean hasPrimeItems() {
        return items != null && items.stream().anyMatch(CartItem::getIsPrime);
    }
    
    public List<CartItem> getOutOfStockItems() {
        return items != null ? 
                items.stream().filter(item -> !item.getInStock()).toList() : new ArrayList<>();
    }
    
    public List<CartItem> getInStockItems() {
        return items != null ? 
                items.stream().filter(CartItem::getInStock).toList() : new ArrayList<>();
    }
}
