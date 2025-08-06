package com.ritzone.repository;

import com.ritzone.model.Analytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Analytics entity
 */
@Repository
public interface AnalyticsRepository extends MongoRepository<Analytics, String> {
    
    /**
     * Find analytics by date
     */
    Optional<Analytics> findByDate(LocalDate date);
    
    /**
     * Find analytics between dates
     */
    List<Analytics> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find analytics for last N days
     */
    @Query("{'date': {'$gte': ?0}}")
    List<Analytics> findByDateGreaterThanEqual(LocalDate startDate);
    
    /**
     * Get total visitors for date range
     */
    @Query(value = "{'date': {'$gte': ?0, '$lte': ?1}}", fields = "{'totalVisitors': 1}")
    List<Analytics> getTotalVisitorsForDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get total revenue for date range
     */
    @Query(value = "{'date': {'$gte': ?0, '$lte': ?1}}", fields = "{'totalRevenue': 1}")
    List<Analytics> getTotalRevenueForDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get total orders for date range
     */
    @Query(value = "{'date': {'$gte': ?0, '$lte': ?1}}", fields = "{'totalOrders': 1}")
    List<Analytics> getTotalOrdersForDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find latest analytics
     */
    Optional<Analytics> findTopByOrderByDateDesc();
    
    /**
     * Find analytics with high bounce rate
     */
    @Query("{'bounceRate': {'$gt': ?0}}")
    List<Analytics> findByBounceRateGreaterThan(Long bounceRate);
    
    /**
     * Find analytics with low conversion rate
     */
    @Query("{'conversionRate': {'$lt': ?0}}")
    List<Analytics> findByConversionRateLessThan(Long conversionRate);
    
    /**
     * Get analytics for specific month
     */
    @Query("{'date': {'$gte': ?0, '$lt': ?1}}")
    List<Analytics> findByMonth(LocalDate monthStart, LocalDate monthEnd);
    
    /**
     * Count analytics records
     */
    long countByDateBetween(LocalDate startDate, LocalDate endDate);
}
