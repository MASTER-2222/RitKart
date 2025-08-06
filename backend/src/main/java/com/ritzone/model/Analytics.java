package com.ritzone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Analytics entity for tracking website metrics and statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics")
public class Analytics {
    
    @Id
    private String id;
    
    @Indexed
    private LocalDate date;
    
    // Traffic metrics
    @Builder.Default
    private Long totalVisitors = 0L;
    
    @Builder.Default
    private Long uniqueVisitors = 0L;
    
    @Builder.Default
    private Long pageViews = 0L;
    
    @Builder.Default
    private Long bounceRate = 0L; // percentage
    
    @Builder.Default
    private Long avgSessionDuration = 0L; // in seconds
    
    // E-commerce metrics
    @Builder.Default
    private Long totalOrders = 0L;
    
    @Builder.Default
    private Double totalRevenue = 0.0;
    
    @Builder.Default
    private Double avgOrderValue = 0.0;
    
    @Builder.Default
    private Long conversionRate = 0L; // percentage
    
    @Builder.Default
    private Long cartAbandonmentRate = 0L; // percentage
    
    // Product metrics
    @Builder.Default
    private Long totalProducts = 0L;
    
    @Builder.Default
    private Long productsViewed = 0L;
    
    @Builder.Default
    private Long productsAddedToCart = 0L;
    
    @Builder.Default
    private Long productsPurchased = 0L;
    
    // User metrics
    @Builder.Default
    private Long newUsers = 0L;
    
    @Builder.Default
    private Long returningUsers = 0L;
    
    @Builder.Default
    private Long totalRegistrations = 0L;
    
    // Top performing data
    private Map<String, Long> topProducts; // productId -> views/sales
    private Map<String, Long> topCategories; // categoryId -> views
    private Map<String, Long> topPages; // page -> views
    private Map<String, Long> trafficSources; // source -> visitors
    private Map<String, Long> deviceTypes; // device -> users
    private Map<String, Long> browsers; // browser -> users
    private Map<String, Long> countries; // country -> users
    
    // Search metrics
    @Builder.Default
    private Long totalSearches = 0L;
    
    private Map<String, Long> topSearchTerms; // term -> count
    private Map<String, Long> searchResultsClicked; // term -> clicks
    
    // Performance metrics
    @Builder.Default
    private Double avgPageLoadTime = 0.0; // in seconds
    
    @Builder.Default
    private Long serverErrors = 0L;
    
    @Builder.Default
    private Long apiCalls = 0L;
    
    // Inventory metrics
    @Builder.Default
    private Long lowStockProducts = 0L;
    
    @Builder.Default
    private Long outOfStockProducts = 0L;
    
    @Builder.Default
    private Double inventoryTurnover = 0.0;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    // Helper methods
    public Double getConversionRatePercentage() {
        if (totalVisitors == 0) return 0.0;
        return (totalOrders.doubleValue() / totalVisitors.doubleValue()) * 100;
    }
    
    public Double getBounceRatePercentage() {
        return bounceRate.doubleValue();
    }
    
    public String getFormattedRevenue() {
        return String.format("$%.2f", totalRevenue);
    }
    
    public String getFormattedAvgOrderValue() {
        return String.format("$%.2f", avgOrderValue);
    }
}
