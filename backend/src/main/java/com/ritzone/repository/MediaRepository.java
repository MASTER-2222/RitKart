package com.ritzone.repository;

import com.ritzone.model.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Media entity
 */
@Repository
public interface MediaRepository extends MongoRepository<Media, String> {
    
    /**
     * Find media by file type
     */
    Page<Media> findByFileType(String fileType, Pageable pageable);
    
    /**
     * Find media by folder
     */
    Page<Media> findByFolder(String folder, Pageable pageable);
    
    /**
     * Find media by file type and folder
     */
    Page<Media> findByFileTypeAndFolder(String fileType, String folder, Pageable pageable);
    
    /**
     * Find media by uploaded by admin
     */
    Page<Media> findByUploadedBy(String uploadedBy, Pageable pageable);
    
    /**
     * Find public media
     */
    Page<Media> findByIsPublicTrue(Pageable pageable);
    
    /**
     * Search media by filename or caption
     */
    @Query("{'$or': [{'fileName': {'$regex': ?0, '$options': 'i'}}, {'caption': {'$regex': ?0, '$options': 'i'}}, {'originalFileName': {'$regex': ?0, '$options': 'i'}}]}")
    Page<Media> searchMedia(String searchTerm, Pageable pageable);
    
    /**
     * Find media by tags
     */
    @Query("{'tags': {'$in': [?0]}}")
    List<Media> findByTagsContaining(String tag);
    
    /**
     * Find unused media (not used in any products, categories, or pages)
     */
    @Query("{'$and': [{'usedInProducts': {'$size': 0}}, {'usedInCategories': {'$size': 0}}, {'usedInPages': {'$size': 0}}]}")
    List<Media> findUnusedMedia();
    
    /**
     * Find media used in products
     */
    @Query("{'usedInProducts': {'$in': [?0]}}")
    List<Media> findByUsedInProductsContaining(String productId);
    
    /**
     * Find media used in categories
     */
    @Query("{'usedInCategories': {'$in': [?0]}}")
    List<Media> findByUsedInCategoriesContaining(String categoryId);
    
    /**
     * Find media by MIME type
     */
    List<Media> findByMimeType(String mimeType);
    
    /**
     * Find media larger than size
     */
    @Query("{'fileSize': {'$gt': ?0}}")
    List<Media> findByFileSizeGreaterThan(Long fileSize);
    
    /**
     * Count media by file type
     */
    long countByFileType(String fileType);
    
    /**
     * Count media by folder
     */
    long countByFolder(String folder);
    
    /**
     * Get total storage used
     */
    @Query(value = "{}", fields = "{'fileSize': 1}")
    List<Media> findAllFileSizes();
}
