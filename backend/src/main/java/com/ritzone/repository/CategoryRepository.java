package com.ritzone.repository;

import com.ritzone.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity
 */
@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    
    /**
     * Find category by slug
     */
    Optional<Category> findBySlug(String slug);
    
    /**
     * Find category by name
     */
    Optional<Category> findByName(String name);
    
    /**
     * Find all active categories
     */
    List<Category> findByIsActiveTrue(Sort sort);
    
    /**
     * Find all featured categories
     */
    List<Category> findByIsFeaturedTrue(Sort sort);
    
    /**
     * Find categories by parent category
     */
    List<Category> findByParentCategoryId(String parentCategoryId, Sort sort);
    
    /**
     * Find root categories (no parent)
     */
    @Query("{'parentCategoryId': {'$exists': false}}")
    List<Category> findRootCategories(Sort sort);
    
    /**
     * Find categories with children
     */
    @Query("{'childCategoryIds': {'$exists': true, '$ne': []}}")
    List<Category> findCategoriesWithChildren();
    
    /**
     * Search categories by name or description
     */
    @Query("{'$or': [{'name': {'$regex': ?0, '$options': 'i'}}, {'description': {'$regex': ?0, '$options': 'i'}}]}")
    List<Category> searchCategories(String searchTerm);
    
    /**
     * Find categories ordered by sort order
     */
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();
    
    /**
     * Check if slug exists
     */
    boolean existsBySlug(String slug);
    
    /**
     * Check if name exists
     */
    boolean existsByName(String name);
    
    /**
     * Count active categories
     */
    long countByIsActiveTrue();
}
