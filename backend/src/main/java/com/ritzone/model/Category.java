package com.ritzone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Category entity for organizing products
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "categories")
public class Category {
    
    @Id
    private String id;
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    @TextIndexed(weight = 10)
    @Indexed(unique = true)
    private String name;
    
    @NotBlank(message = "Category slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Indexed(unique = true)
    private String slug;
    
    @TextIndexed(weight = 5)
    private String description;
    
    private String image;
    
    private String icon;
    
    // Parent category for hierarchical structure
    private String parentCategoryId;
    
    // Child categories
    private List<String> childCategoryIds;
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Min(value = 0, message = "Sort order cannot be negative")
    @Builder.Default
    private Integer sortOrder = 0;
    
    // SEO fields
    private String metaTitle;
    private String metaDescription;
    private List<String> metaKeywords;
    
    // Statistics
    @Builder.Default
    private Long productCount = 0L;
    
    @Builder.Default
    private Long viewCount = 0L;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean hasParent() {
        return parentCategoryId != null && !parentCategoryId.isEmpty();
    }
    
    public boolean hasChildren() {
        return childCategoryIds != null && !childCategoryIds.isEmpty();
    }
    
    public String getDisplayName() {
        return name != null ? name : slug;
    }
}
