package com.ritzone.repository;

import com.ritzone.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Order entity
 */
@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    
    // Find by order number
    Optional<Order> findByOrderNumber(String orderNumber);
    
    // Find by user
    Page<Order> findByUserId(String userId, Pageable pageable);
    
    List<Order> findByUserId(String userId);
    
    // Find by status
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    // Find by user and status
    Page<Order> findByUserIdAndStatus(String userId, Order.OrderStatus status, Pageable pageable);
    
    List<Order> findByUserIdAndStatus(String userId, Order.OrderStatus status);
    
    // Find by date range
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    Page<Order> findByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
    List<Order> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find by user and date range
    @Query("{'userId': ?0, 'createdAt': {$gte: ?1, $lte: ?2}}")
    Page<Order> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Find recent orders
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<Order> findRecentOrders(Pageable pageable);
    
    // Find by total amount range
    @Query("{'totalAmount': {$gte: ?0, $lte: ?1}}")
    Page<Order> findByTotalAmountRange(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable);
    
    // Find Prime orders
    Page<Order> findByIsPrimeOrderTrue(Pageable pageable);
    
    List<Order> findByIsPrimeOrderTrue();
    
    // Find orders by payment status
    @Query("{'paymentInfo.paymentStatus': ?0}")
    Page<Order> findByPaymentStatus(String paymentStatus, Pageable pageable);
    
    // Find orders by payment method
    @Query("{'paymentInfo.paymentMethod': ?0}")
    Page<Order> findByPaymentMethod(String paymentMethod, Pageable pageable);
    
    // Find orders with specific product
    @Query("{'items.productId': ?0}")
    Page<Order> findOrdersContainingProduct(String productId, Pageable pageable);
    
    // Find orders by shipping carrier
    @Query("{'shippingInfo.carrier': ?0}")
    Page<Order> findByShippingCarrier(String carrier, Pageable pageable);
    
    // Find orders by shipping method
    @Query("{'shippingInfo.shippingMethod': ?0}")
    Page<Order> findByShippingMethod(String shippingMethod, Pageable pageable);
    
    // Find orders by city
    @Query("{'shippingAddress.city': ?0}")
    Page<Order> findByShippingCity(String city, Pageable pageable);
    
    // Find orders by state
    @Query("{'shippingAddress.state': ?0}")
    Page<Order> findByShippingState(String state, Pageable pageable);
    
    // Find orders by country
    @Query("{'shippingAddress.country': ?0}")
    Page<Order> findByShippingCountry(String country, Pageable pageable);
    
    // Find orders that need to be shipped
    @Query("{'status': {$in: ['CONFIRMED', 'PROCESSING']}}")
    List<Order> findOrdersToShip();
    
    // Find orders that are shipped but not delivered
    @Query("{'status': {$in: ['SHIPPED', 'OUT_FOR_DELIVERY']}}")
    List<Order> findShippedOrders();
    
    // Find overdue orders (estimated delivery passed)
    @Query("{'status': {$in: ['SHIPPED', 'OUT_FOR_DELIVERY']}, 'estimatedDeliveryDate': {$lt: ?0}}")
    List<Order> findOverdueOrders(LocalDateTime currentDate);
    
    // Find orders that can be cancelled
    @Query("{'status': {$in: ['PENDING', 'CONFIRMED']}}")
    List<Order> findCancellableOrders();
    
    // Count methods
    long countByStatus(Order.OrderStatus status);
    
    long countByUserId(String userId);
    
    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", count = true)
    long countByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query(value = "{'userId': ?0, 'status': ?1}", count = true)
    long countByUserIdAndStatus(String userId, Order.OrderStatus status);
    
    // Aggregation for statistics
    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", fields = "{'totalAmount': 1}")
    List<Order> findOrdersForRevenueCalculation(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find today's orders
    @Query("{'createdAt': {$gte: ?0}}")
    List<Order> findTodaysOrders(LocalDateTime startOfDay);
    
    // Find this month's orders
    @Query("{'createdAt': {$gte: ?0}}")
    List<Order> findThisMonthsOrders(LocalDateTime startOfMonth);
    
    // Find orders by coupon code
    @Query("{'couponCode': ?0}")
    List<Order> findByCouponCode(String couponCode);
    
    // Find orders with notes
    @Query("{'notes': {$exists: true, $ne: null, $ne: ''}}")
    Page<Order> findOrdersWithNotes(Pageable pageable);
    
    // Find orders by tracking number
    @Query("{'shippingInfo.trackingNumber': ?0}")
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    // Find orders by transaction ID
    @Query("{'paymentInfo.transactionId': ?0}")
    Optional<Order> findByTransactionId(String transactionId);
    
    // Find orders by Stripe payment intent ID
    @Query("{'paymentInfo.stripePaymentIntentId': ?0}")
    Optional<Order> findByStripePaymentIntentId(String paymentIntentId);
    
    // Find orders for specific user in date range with status
    @Query("{'userId': ?0, 'status': ?1, 'createdAt': {$gte: ?2, $lte: ?3}}")
    List<Order> findByUserIdAndStatusAndDateRange(
            String userId, 
            Order.OrderStatus status, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );
    
    // Find high-value orders
    @Query("{'totalAmount': {$gte: ?0}}")
    List<Order> findHighValueOrders(BigDecimal minAmount);
    
    // Find orders with multiple items
    @Query("{'$expr': {'$gt': [{'$size': '$items'}, 1]}}")
    Page<Order> findOrdersWithMultipleItems(Pageable pageable);
    
    // Find single item orders
    @Query("{'$expr': {'$eq': [{'$size': '$items'}, 1]}}")
    Page<Order> findSingleItemOrders(Pageable pageable);
}
