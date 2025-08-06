package com.ritzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for product search criteria
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductSearchDTO {
    
    private String query;
    
    private String category;
    
    private String sortBy; // relevance, price, rating, newest, popularity
    
    private String sortDirection; // asc, desc
    
    // Default values
    public String getSortBy() {
        return sortBy != null ? sortBy : "relevance";
    }
    
    public String getSortDirection() {
        return sortDirection != null ? sortDirection : "desc";
    }
}
