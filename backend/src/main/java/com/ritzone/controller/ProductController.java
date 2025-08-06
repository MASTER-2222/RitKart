package com.ritzone.controller;

import com.ritzone.dto.ProductDTO;
import com.ritzone.dto.ProductFilterDTO;
import com.ritzone.dto.ProductSearchDTO;
import com.ritzone.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for Product operations
 */
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Products", description = "Product management APIs")
@CrossOrigin(origins = {"http://localhost:3000", "https://ritkart-frontend.onrender.com"})
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * Get all products with pagination
     */
    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve all active products with pagination")
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /products - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get product by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID")
    public ResponseEntity<ProductDTO> getProductById(
            @Parameter(description = "Product ID") @PathVariable String id) {
        
        log.info("GET /products/{}", id);
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    /**
     * Get product by SKU
     */
    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get product by SKU", description = "Retrieve a specific product by its SKU")
    public ResponseEntity<ProductDTO> getProductBySku(
            @Parameter(description = "Product SKU") @PathVariable String sku) {
        
        log.info("GET /products/sku/{}", sku);
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }
    
    /**
     * Get products by category
     */
    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category", description = "Retrieve products filtered by category")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @Parameter(description = "Product category") @PathVariable String category,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /products/category/{} - page: {}, size: {}", category, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByCategory(category, pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get products by brand
     */
    @GetMapping("/brand/{brand}")
    @Operation(summary = "Get products by brand", description = "Retrieve products filtered by brand")
    public ResponseEntity<Page<ProductDTO>> getProductsByBrand(
            @Parameter(description = "Product brand") @PathVariable String brand,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /products/brand/{} - page: {}, size: {}", brand, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsByBrand(brand, pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Search products
     */
    @PostMapping("/search")
    @Operation(summary = "Search products", description = "Search products with various criteria")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @Valid @RequestBody ProductSearchDTO searchDTO,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("POST /products/search - criteria: {}, page: {}, size: {}", searchDTO, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.searchProducts(searchDTO, pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Filter products
     */
    @PostMapping("/filter")
    @Operation(summary = "Filter products", description = "Filter products with advanced criteria")
    public ResponseEntity<Page<ProductDTO>> filterProducts(
            @Valid @RequestBody ProductFilterDTO filterDTO,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("POST /products/filter - criteria: {}, page: {}, size: {}", filterDTO, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.filterProducts(filterDTO, pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get featured products
     */
    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Retrieve all featured products")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        log.info("GET /products/featured");
        List<ProductDTO> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get products with discounts
     */
    @GetMapping("/discounts")
    @Operation(summary = "Get discounted products", description = "Retrieve products with discounts")
    public ResponseEntity<Page<ProductDTO>> getProductsWithDiscount(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /products/discounts - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getProductsWithDiscount(pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get Prime products
     */
    @GetMapping("/prime")
    @Operation(summary = "Get Prime products", description = "Retrieve Prime eligible products")
    public ResponseEntity<Page<ProductDTO>> getPrimeProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        log.info("GET /products/prime - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getPrimeProducts(pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get top selling products
     */
    @GetMapping("/top-selling")
    @Operation(summary = "Get top selling products", description = "Retrieve top selling products")
    public ResponseEntity<List<ProductDTO>> getTopSellingProducts(
            @Parameter(description = "Number of products to return") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /products/top-selling - limit: {}", limit);
        List<ProductDTO> products = productService.getTopSellingProducts(limit);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get most viewed products
     */
    @GetMapping("/most-viewed")
    @Operation(summary = "Get most viewed products", description = "Retrieve most viewed products")
    public ResponseEntity<List<ProductDTO>> getMostViewedProducts(
            @Parameter(description = "Number of products to return") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /products/most-viewed - limit: {}", limit);
        List<ProductDTO> products = productService.getMostViewedProducts(limit);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get recently added products
     */
    @GetMapping("/recent")
    @Operation(summary = "Get recently added products", description = "Retrieve recently added products")
    public ResponseEntity<List<ProductDTO>> getRecentlyAddedProducts(
            @Parameter(description = "Number of products to return") @RequestParam(defaultValue = "10") int limit) {
        
        log.info("GET /products/recent - limit: {}", limit);
        List<ProductDTO> products = productService.getRecentlyAddedProducts(limit);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get related products
     */
    @GetMapping("/{id}/related")
    @Operation(summary = "Get related products", description = "Retrieve products related to a specific product")
    public ResponseEntity<List<ProductDTO>> getRelatedProducts(
            @Parameter(description = "Product ID") @PathVariable String id,
            @Parameter(description = "Number of products to return") @RequestParam(defaultValue = "6") int limit) {
        
        log.info("GET /products/{}/related - limit: {}", id, limit);
        List<ProductDTO> products = productService.getRelatedProducts(id, limit);
        return ResponseEntity.ok(products);
    }
}
