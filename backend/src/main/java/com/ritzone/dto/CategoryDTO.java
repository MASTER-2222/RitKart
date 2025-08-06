package com.ritzone.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for category operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    
    private String id;
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Category slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;
    
    private String description;
    private String image;
    private String icon;
    private String parentCategoryId;
    private List<String> childCategoryIds;
    private Boolean isActive;
    private Boolean isFeatured;
    private Integer sortOrder;
    private String metaTitle;
    private String metaDescription;
    private List<String> metaKeywords;
}
