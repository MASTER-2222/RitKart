package com.ritzone.service;

import com.ritzone.dto.CategoryDTO;
import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.Category;
import com.ritzone.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for category operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Get all categories
     */
    public List<Category> getAllCategories() {
        return categoryRepository.findAll(Sort.by("sortOrder").ascending());
    }
    
    /**
     * Get category by ID
     */
    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
    
    /**
     * Get category by slug
     */
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
    }
    
    /**
     * Create new category
     */
    public Category createCategory(CategoryDTO categoryDTO) {
        // Check if slug already exists
        if (categoryRepository.existsBySlug(categoryDTO.getSlug())) {
            throw new RuntimeException("Category with slug '" + categoryDTO.getSlug() + "' already exists");
        }
        
        Category category = modelMapper.map(categoryDTO, Category.class);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());
        
        return categoryRepository.save(category);
    }
    
    /**
     * Update category
     */
    public Category updateCategory(String id, CategoryDTO categoryDTO) {
        Category existingCategory = getCategoryById(id);
        
        // Check if slug is being changed and if new slug already exists
        if (!existingCategory.getSlug().equals(categoryDTO.getSlug()) && 
            categoryRepository.existsBySlug(categoryDTO.getSlug())) {
            throw new RuntimeException("Category with slug '" + categoryDTO.getSlug() + "' already exists");
        }
        
        // Update fields
        existingCategory.setName(categoryDTO.getName());
        existingCategory.setSlug(categoryDTO.getSlug());
        existingCategory.setDescription(categoryDTO.getDescription());
        existingCategory.setImage(categoryDTO.getImage());
        existingCategory.setIcon(categoryDTO.getIcon());
        existingCategory.setParentCategoryId(categoryDTO.getParentCategoryId());
        existingCategory.setIsActive(categoryDTO.getIsActive());
        existingCategory.setIsFeatured(categoryDTO.getIsFeatured());
        existingCategory.setSortOrder(categoryDTO.getSortOrder());
        existingCategory.setMetaTitle(categoryDTO.getMetaTitle());
        existingCategory.setMetaDescription(categoryDTO.getMetaDescription());
        existingCategory.setMetaKeywords(categoryDTO.getMetaKeywords());
        existingCategory.setUpdatedAt(LocalDateTime.now());
        
        return categoryRepository.save(existingCategory);
    }
    
    /**
     * Delete category
     */
    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
        log.info("Category deleted: {}", category.getName());
    }
    
    /**
     * Get active categories
     */
    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue(Sort.by("sortOrder").ascending());
    }
    
    /**
     * Get featured categories
     */
    public List<Category> getFeaturedCategories() {
        return categoryRepository.findByIsFeaturedTrue(Sort.by("sortOrder").ascending());
    }
    
    /**
     * Search categories
     */
    public List<Category> searchCategories(String searchTerm) {
        return categoryRepository.searchCategories(searchTerm);
    }
}
