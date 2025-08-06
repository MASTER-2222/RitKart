package com.ritzone.repository;

import com.ritzone.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Product entity
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    
    // Find by basic properties
    Optional<Product> findBySku(String sku);
    
    List<Product> findByCategory(String category);
    
    Page<Product> findByCategory(String category, Pageable pageable);
    
    List<Product> findByBrand(String brand);
    
    Page<Product> findByBrand(String brand, Pageable pageable);
    
    // Find active products
    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    Page<Product> findByCategoryAndIsActiveTrue(String category, Pageable pageable);
    
    Page<Product> findByBrandAndIsActiveTrue(String brand, Pageable pageable);
    
    // Find featured products
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();
    
    Page<Product> findByIsFeaturedTrueAndIsActiveTrue(Pageable pageable);
    
    // Find by price range
    Page<Product> findByPriceBetweenAndIsActiveTrue(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    @Query("{'category': ?0, 'price': {$gte: ?1, $lte: ?2}, 'isActive': true}")
    Page<Product> findByCategoryAndPriceRange(String category, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    // Find by rating
    Page<Product> findByRatingGreaterThanEqualAndIsActiveTrue(Double minRating, Pageable pageable);
    
    @Query("{'category': ?0, 'rating': {$gte: ?1}, 'isActive': true}")
    Page<Product> findByCategoryAndMinRating(String category, Double minRating, Pageable pageable);
    
    // Find Prime products
    List<Product> findByIsPrimeTrueAndIsActiveTrue();
    
    Page<Product> findByIsPrimeTrueAndIsActiveTrue(Pageable pageable);
    
    // Find products with discounts
    @Query("{'originalPrice': {$exists: true}, 'discount': {$gt: 0}, 'isActive': true}")
    Page<Product> findProductsWithDiscount(Pageable pageable);
    
    // Find in stock products
    Page<Product> findByInStockTrueAndIsActiveTrue(Pageable pageable);
    
    @Query("{'category': ?0, 'inStock': true, 'isActive': true}")
    Page<Product> findByCategoryAndInStock(String category, Pageable pageable);
    
    // Text search
    @Query("{'$text': {'$search': ?0}, 'isActive': true}")
    Page<Product> findByTextSearch(String searchText, Pageable pageable);
    
    @Query("{'$text': {'$search': ?0}, 'category': ?1, 'isActive': true}")
    Page<Product> findByTextSearchAndCategory(String searchText, String category, Pageable pageable);
    
    // Complex filtering
    @Query("{'category': ?0, 'brand': {$in: ?1}, 'price': {$gte: ?2, $lte: ?3}, 'rating': {$gte: ?4}, 'isActive': true}")
    Page<Product> findByCategoryAndBrandsAndPriceRangeAndMinRating(
            String category, 
            List<String> brands, 
            BigDecimal minPrice, 
            BigDecimal maxPrice, 
            Double minRating, 
            Pageable pageable
    );
    
    // Find by multiple categories
    @Query("{'category': {$in: ?0}, 'isActive': true}")
    Page<Product> findByCategories(List<String> categories, Pageable pageable);
    
    // Find by multiple brands
    @Query("{'brand': {$in: ?0}, 'isActive': true}")
    Page<Product> findByBrands(List<String> brands, Pageable pageable);
    
    // Find by tags
    @Query("{'tags': {$in: ?0}, 'isActive': true}")
    Page<Product> findByTags(List<String> tags, Pageable pageable);
    
    // Top selling products
    @Query(value = "{'isActive': true}", sort = "{'salesCount': -1}")
    List<Product> findTopSellingProducts(Pageable pageable);
    
    // Most viewed products
    @Query(value = "{'isActive': true}", sort = "{'viewCount': -1}")
    List<Product> findMostViewedProducts(Pageable pageable);
    
    // Recently added products
    @Query(value = "{'isActive': true}", sort = "{'createdAt': -1}")
    List<Product> findRecentlyAddedProducts(Pageable pageable);
    
    // Best rated products
    @Query(value = "{'isActive': true, 'reviewCount': {$gte: 10}}", sort = "{'rating': -1}")
    List<Product> findBestRatedProducts(Pageable pageable);
    
    // Related products (same category, different product)
    @Query("{'category': ?0, '_id': {$ne: ?1}, 'isActive': true}")
    List<Product> findRelatedProducts(String category, String excludeProductId, Pageable pageable);
    
    // Count methods
    long countByCategory(String category);
    
    long countByBrand(String brand);
    
    long countByIsActiveTrue();
    
    long countByCategoryAndIsActiveTrue(String category);
    
    // Aggregation queries for statistics
    @Query(value = "{}", fields = "{'category': 1}")
    List<Product> findAllCategories();
    
    @Query(value = "{}", fields = "{'brand': 1}")
    List<Product> findAllBrands();
    
    // Custom update methods would be handled in service layer
    // using MongoTemplate for complex updates
}
