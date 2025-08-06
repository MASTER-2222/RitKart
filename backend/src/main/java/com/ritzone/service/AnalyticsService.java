package com.ritzone.service;

import com.ritzone.model.Analytics;
import com.ritzone.repository.AnalyticsRepository;
import com.ritzone.repository.OrderRepository;
import com.ritzone.repository.ProductRepository;
import com.ritzone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for analytics operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final AnalyticsRepository analyticsRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    
    /**
     * Get dashboard data
     */
    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Basic counts
        dashboardData.put("totalProducts", productRepository.count());
        dashboardData.put("totalUsers", userRepository.count());
        dashboardData.put("totalOrders", orderRepository.count());
        dashboardData.put("activeUsers", userRepository.countByIsActiveTrue());
        
        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        dashboardData.put("recentOrders", orderRepository.countByCreatedAtAfter(thirtyDaysAgo));
        dashboardData.put("recentUsers", userRepository.countByCreatedAtAfter(thirtyDaysAgo));
        
        // Revenue data
        Double totalRevenue = orderRepository.getTotalRevenue();
        dashboardData.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        // Order status breakdown
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("pending", orderRepository.countByStatus("PENDING"));
        ordersByStatus.put("processing", orderRepository.countByStatus("PROCESSING"));
        ordersByStatus.put("shipped", orderRepository.countByStatus("SHIPPED"));
        ordersByStatus.put("delivered", orderRepository.countByStatus("DELIVERED"));
        ordersByStatus.put("cancelled", orderRepository.countByStatus("CANCELLED"));
        dashboardData.put("ordersByStatus", ordersByStatus);
        
        // Product statistics
        dashboardData.put("lowStockProducts", productRepository.countByStockCountLessThan(10));
        dashboardData.put("outOfStockProducts", productRepository.countByStockCount(0));
        dashboardData.put("featuredProducts", productRepository.countByIsFeaturedTrue());
        
        return dashboardData;
    }
    
    /**
     * Get analytics for specified number of days
     */
    public List<Analytics> getAnalytics(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        return analyticsRepository.findByDateGreaterThanEqual(startDate);
    }
    
    /**
     * Get analytics by date range
     */
    public List<Analytics> getAnalyticsByDateRange(LocalDate startDate, LocalDate endDate) {
        return analyticsRepository.findByDateBetweenOrderByDateDesc(startDate, endDate);
    }
    
    /**
     * Create or update analytics for a specific date
     */
    public Analytics updateAnalytics(LocalDate date) {
        Analytics analytics = analyticsRepository.findByDate(date)
            .orElse(Analytics.builder().date(date).build());
        
        // Update metrics based on current data
        updateDailyMetrics(analytics, date);
        
        return analyticsRepository.save(analytics);
    }
    
    /**
     * Update daily metrics
     */
    private void updateDailyMetrics(Analytics analytics, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        // Order metrics
        Long dailyOrders = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        analytics.setTotalOrders(dailyOrders);
        
        // Revenue metrics
        Double dailyRevenue = orderRepository.getTotalRevenueByDateRange(startOfDay, endOfDay);
        analytics.setTotalRevenue(dailyRevenue != null ? dailyRevenue : 0.0);
        
        // User metrics
        Long newUsers = userRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        analytics.setNewUsers(newUsers);
        
        // Product metrics
        analytics.setTotalProducts(productRepository.count());
        analytics.setLowStockProducts(productRepository.countByStockCountLessThan(10));
        analytics.setOutOfStockProducts(productRepository.countByStockCount(0));
        
        // Calculate derived metrics
        if (analytics.getTotalVisitors() > 0) {
            double conversionRate = (analytics.getTotalOrders().doubleValue() / analytics.getTotalVisitors().doubleValue()) * 100;
            analytics.setConversionRate((long) conversionRate);
        }
        
        if (analytics.getTotalOrders() > 0) {
            double avgOrderValue = analytics.getTotalRevenue() / analytics.getTotalOrders();
            analytics.setAvgOrderValue(avgOrderValue);
        }
        
        analytics.setCreatedAt(LocalDateTime.now());
    }
    
    /**
     * Get revenue analytics
     */
    public Map<String, Object> getRevenueAnalytics(int days) {
        Map<String, Object> revenueData = new HashMap<>();
        
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Analytics> analytics = analyticsRepository.findByDateGreaterThanEqual(startDate);
        
        double totalRevenue = analytics.stream()
            .mapToDouble(Analytics::getTotalRevenue)
            .sum();
        
        long totalOrders = analytics.stream()
            .mapToLong(Analytics::getTotalOrders)
            .sum();
        
        double avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;
        
        revenueData.put("totalRevenue", totalRevenue);
        revenueData.put("totalOrders", totalOrders);
        revenueData.put("avgOrderValue", avgOrderValue);
        revenueData.put("dailyData", analytics);
        
        return revenueData;
    }
    
    /**
     * Get user analytics
     */
    public Map<String, Object> getUserAnalytics(int days) {
        Map<String, Object> userData = new HashMap<>();
        
        LocalDate startDate = LocalDate.now().minusDays(days);
        List<Analytics> analytics = analyticsRepository.findByDateGreaterThanEqual(startDate);
        
        long totalNewUsers = analytics.stream()
            .mapToLong(Analytics::getNewUsers)
            .sum();
        
        userData.put("totalNewUsers", totalNewUsers);
        userData.put("totalUsers", userRepository.count());
        userData.put("activeUsers", userRepository.countByIsActiveTrue());
        userData.put("dailyData", analytics);
        
        return userData;
    }
}
