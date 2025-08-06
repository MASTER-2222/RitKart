package com.ritzone.repository;

import com.ritzone.model.SystemSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SystemSettings entity
 */
@Repository
public interface SystemSettingsRepository extends MongoRepository<SystemSettings, String> {
    
    /**
     * Find setting by key
     */
    Optional<SystemSettings> findByKey(String key);
    
    /**
     * Find settings by category
     */
    List<SystemSettings> findByCategory(String category);
    
    /**
     * Find public settings
     */
    List<SystemSettings> findByIsPublicTrue();
    
    /**
     * Find editable settings
     */
    List<SystemSettings> findByIsEditableTrue();
    
    /**
     * Find settings that require restart
     */
    List<SystemSettings> findByRequiresRestartTrue();
    
    /**
     * Find settings by type
     */
    List<SystemSettings> findByType(String type);
    
    /**
     * Find settings by category and public
     */
    List<SystemSettings> findByCategoryAndIsPublicTrue(String category);
    
    /**
     * Find settings by category and editable
     */
    List<SystemSettings> findByCategoryAndIsEditableTrue(String category);
    
    /**
     * Search settings by key or description
     */
    @Query("{'$or': [{'key': {'$regex': ?0, '$options': 'i'}}, {'description': {'$regex': ?0, '$options': 'i'}}]}")
    List<SystemSettings> searchSettings(String searchTerm);
    
    /**
     * Find settings updated by admin
     */
    List<SystemSettings> findByUpdatedBy(String adminId);
    
    /**
     * Check if key exists
     */
    boolean existsByKey(String key);
    
    /**
     * Count settings by category
     */
    long countByCategory(String category);
    
    /**
     * Find all categories
     */
    @Query(value = "{}", fields = "{'category': 1}")
    List<SystemSettings> findAllCategories();
}
