package com.ritzone.repository;

import com.ritzone.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Cart entity
 */
@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    
    // Find cart by user ID
    Optional<Cart> findByUserId(String userId);
    
    // Find active cart by user ID
    Optional<Cart> findByUserIdAndIsActiveTrue(String userId);
    
    // Check if user has active cart
    boolean existsByUserIdAndIsActiveTrue(String userId);
    
    // Find all active carts
    List<Cart> findByIsActiveTrue();
    
    // Find carts with items
    @Query("{'items': {$exists: true, $not: {$size: 0}}, 'isActive': true}")
    List<Cart> findCartsWithItems();
    
    // Find empty carts
    @Query("{'$or': [{'items': {$exists: false}}, {'items': {$size: 0}}], 'isActive': true}")
    List<Cart> findEmptyCarts();
    
    // Find carts containing specific product
    @Query("{'items.productId': ?0, 'isActive': true}")
    List<Cart> findCartsContainingProduct(String productId);
    
    // Find abandoned carts (not updated for X days)
    @Query("{'updatedAt': {$lt: ?0}, 'items': {$exists: true, $not: {$size: 0}}, 'isActive': true}")
    List<Cart> findAbandonedCarts(LocalDateTime cutoffDate);
    
    // Find carts updated after specific date
    @Query("{'updatedAt': {$gte: ?0}, 'isActive': true}")
    List<Cart> findCartsUpdatedAfter(LocalDateTime date);
    
    // Find carts created in date range
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}, 'isActive': true}")
    List<Cart> findCartsCreatedInRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Count methods
    long countByIsActiveTrue();
    
    @Query(value = "{'items': {$exists: true, $not: {$size: 0}}, 'isActive': true}", count = true)
    long countCartsWithItems();
    
    @Query(value = "{'$or': [{'items': {$exists: false}}, {'items': {$size: 0}}], 'isActive': true}", count = true)
    long countEmptyCarts();
    
    // Find carts with out of stock items
    @Query("{'items.inStock': false, 'isActive': true}")
    List<Cart> findCartsWithOutOfStockItems();
    
    // Find carts with Prime items
    @Query("{'items.isPrime': true, 'isActive': true}")
    List<Cart> findCartsWithPrimeItems();
    
    // Delete inactive carts
    void deleteByIsActiveFalse();
    
    // Delete old empty carts
    @Query(value = "{'$or': [{'items': {$exists: false}}, {'items': {$size: 0}}], 'updatedAt': {$lt: ?0}}", delete = true)
    void deleteOldEmptyCarts(LocalDateTime cutoffDate);
}
