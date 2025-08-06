package com.ritzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for product filtering criteria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductFilterDTO {
    
    private String category;
    
    private List<String> brands;
    
    private BigDecimal minPrice;
    
    private BigDecimal maxPrice;
    
    private Double minRating;
    
    private Boolean isPrime;
    
    private Boolean inStock;
    
    private Boolean hasDiscount;
    
    private List<String> tags;
    
    private String sortBy; // price, rating, newest, popularity, sales, featured
    
    private String sortDirection; // asc, desc
    
    // Default values
    public String getSortBy() {
        return sortBy != null ? sortBy : "featured";
    }
    
    public String getSortDirection() {
        return sortDirection != null ? sortDirection : "asc";
    }
}
