package com.ritzone.service;

import com.ritzone.dto.ProductDTO;
import com.ritzone.dto.ProductFilterDTO;
import com.ritzone.dto.ProductSearchDTO;
import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.Product;
import com.ritzone.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for Product operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Get all products with pagination
     */
    @Cacheable(value = "products", key = "#pageable.pageNumber + '_' + #pageable.pageSize")
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        log.debug("Fetching all products with pagination: {}", pageable);
        Page<Product> products = productRepository.findByIsActiveTrue(pageable);
        return products.map(this::convertToDTO);
    }
    
    /**
     * Get product by ID
     */
    @Cacheable(value = "product", key = "#id")
    public ProductDTO getProductById(String id) {
        log.debug("Fetching product by ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        
        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product is not available");
        }
        
        // Increment view count
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        
        return convertToDTO(product);
    }
    
    /**
     * Get product by SKU
     */
    public ProductDTO getProductBySku(String sku) {
        log.debug("Fetching product by SKU: {}", sku);
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        
        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product is not available");
        }
        
        return convertToDTO(product);
    }
    
    /**
     * Get products by category
     */
    @Cacheable(value = "productsByCategory", key = "#category + '_' + #pageable.pageNumber")
    public Page<ProductDTO> getProductsByCategory(String category, Pageable pageable) {
        log.debug("Fetching products by category: {} with pagination: {}", category, pageable);
        Page<Product> products = productRepository.findByCategoryAndIsActiveTrue(category, pageable);
        return products.map(this::convertToDTO);
    }
    
    /**
     * Get products by brand
     */
    public Page<ProductDTO> getProductsByBrand(String brand, Pageable pageable) {
        log.debug("Fetching products by brand: {} with pagination: {}", brand, pageable);
        Page<Product> products = productRepository.findByBrandAndIsActiveTrue(brand, pageable);
        return products.map(this::convertToDTO);
    }
    
    /**
     * Search products
     */
    public Page<ProductDTO> searchProducts(ProductSearchDTO searchDTO, Pageable pageable) {
        log.debug("Searching products with criteria: {}", searchDTO);
        
        Page<Product> products;
        
        if (searchDTO.getQuery() != null && !searchDTO.getQuery().trim().isEmpty()) {
            if (searchDTO.getCategory() != null && !searchDTO.getCategory().trim().isEmpty()) {
                products = productRepository.findByTextSearchAndCategory(
                        searchDTO.getQuery(), searchDTO.getCategory(), pageable);
            } else {
                products = productRepository.findByTextSearch(searchDTO.getQuery(), pageable);
            }
        } else if (searchDTO.getCategory() != null && !searchDTO.getCategory().trim().isEmpty()) {
            products = productRepository.findByCategoryAndIsActiveTrue(searchDTO.getCategory(), pageable);
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
        }
        
        return products.map(this::convertToDTO);
    }
    
    /**
     * Filter products
     */
    public Page<ProductDTO> filterProducts(ProductFilterDTO filterDTO, Pageable pageable) {
        log.debug("Filtering products with criteria: {}", filterDTO);
        
        // Apply sorting
        Sort sort = createSort(filterDTO.getSortBy(), filterDTO.getSortDirection());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        
        Page<Product> products;
        
        if (filterDTO.getCategory() != null && filterDTO.getBrands() != null && !filterDTO.getBrands().isEmpty()) {
            products = productRepository.findByCategoryAndBrandsAndPriceRangeAndMinRating(
                    filterDTO.getCategory(),
                    filterDTO.getBrands(),
                    filterDTO.getMinPrice() != null ? filterDTO.getMinPrice() : BigDecimal.ZERO,
                    filterDTO.getMaxPrice() != null ? filterDTO.getMaxPrice() : BigDecimal.valueOf(999999),
                    filterDTO.getMinRating() != null ? filterDTO.getMinRating() : 0.0,
                    sortedPageable
            );
        } else if (filterDTO.getCategory() != null) {
            products = productRepository.findByCategoryAndPriceRange(
                    filterDTO.getCategory(),
                    filterDTO.getMinPrice() != null ? filterDTO.getMinPrice() : BigDecimal.ZERO,
                    filterDTO.getMaxPrice() != null ? filterDTO.getMaxPrice() : BigDecimal.valueOf(999999),
                    sortedPageable
            );
        } else {
            products = productRepository.findByPriceBetweenAndIsActiveTrue(
                    filterDTO.getMinPrice() != null ? filterDTO.getMinPrice() : BigDecimal.ZERO,
                    filterDTO.getMaxPrice() != null ? filterDTO.getMaxPrice() : BigDecimal.valueOf(999999),
                    sortedPageable
            );
        }
        
        return products.map(this::convertToDTO);
    }
    
    /**
     * Get featured products
     */
    @Cacheable(value = "featuredProducts")
    public List<ProductDTO> getFeaturedProducts() {
        log.debug("Fetching featured products");
        List<Product> products = productRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get products with discounts
     */
    public Page<ProductDTO> getProductsWithDiscount(Pageable pageable) {
        log.debug("Fetching products with discounts");
        Page<Product> products = productRepository.findProductsWithDiscount(pageable);
        return products.map(this::convertToDTO);
    }
    
    /**
     * Get Prime products
     */
    public Page<ProductDTO> getPrimeProducts(Pageable pageable) {
        log.debug("Fetching Prime products");
        Page<Product> products = productRepository.findByIsPrimeTrueAndIsActiveTrue(pageable);
        return products.map(this::convertToDTO);
    }
    
    /**
     * Get top selling products
     */
    @Cacheable(value = "topSellingProducts")
    public List<ProductDTO> getTopSellingProducts(int limit) {
        log.debug("Fetching top {} selling products", limit);
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.findTopSellingProducts(pageable);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get most viewed products
     */
    @Cacheable(value = "mostViewedProducts")
    public List<ProductDTO> getMostViewedProducts(int limit) {
        log.debug("Fetching top {} most viewed products", limit);
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.findMostViewedProducts(pageable);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get recently added products
     */
    public List<ProductDTO> getRecentlyAddedProducts(int limit) {
        log.debug("Fetching {} recently added products", limit);
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.findRecentlyAddedProducts(pageable);
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Get related products
     */
    public List<ProductDTO> getRelatedProducts(String productId, int limit) {
        log.debug("Fetching {} related products for product ID: {}", limit, productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> relatedProducts = productRepository.findRelatedProducts(
                product.getCategory(), productId, pageable);
        
        return relatedProducts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * Create new product (Admin only)
     */
    @CacheEvict(value = {"products", "productsByCategory", "featuredProducts"}, allEntries = true)
    public ProductDTO createProduct(ProductDTO productDTO) {
        log.debug("Creating new product: {}", productDTO.getTitle());
        
        Product product = convertToEntity(productDTO);
        product.setId(null); // Ensure new product
        product.setSku(generateSku());
        product.setIsActive(true);
        product.setViewCount(0L);
        product.setSalesCount(0L);
        
        Product savedProduct = productRepository.save(product);
        log.info("Created new product with ID: {}", savedProduct.getId());
        
        return convertToDTO(savedProduct);
    }
    
    /**
     * Update product (Admin only)
     */
    @CacheEvict(value = {"products", "product", "productsByCategory", "featuredProducts"}, allEntries = true)
    public ProductDTO updateProduct(String id, ProductDTO productDTO) {
        log.debug("Updating product with ID: {}", id);
        
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        
        // Update fields
        modelMapper.map(productDTO, existingProduct);
        existingProduct.setId(id); // Ensure ID doesn't change
        
        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Updated product with ID: {}", id);
        
        return convertToDTO(updatedProduct);
    }
    
    /**
     * Delete product (Admin only)
     */
    @CacheEvict(value = {"products", "product", "productsByCategory", "featuredProducts"}, allEntries = true)
    public void deleteProduct(String id) {
        log.debug("Deleting product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        
        // Soft delete
        product.setIsActive(false);
        productRepository.save(product);
        
        log.info("Soft deleted product with ID: {}", id);
    }
    
    /**
     * Update stock count
     */
    @CacheEvict(value = "product", key = "#productId")
    public void updateStock(String productId, int quantity) {
        log.debug("Updating stock for product ID: {} by quantity: {}", productId, quantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        int newStock = product.getStockCount() + quantity;
        product.setStockCount(Math.max(0, newStock));
        product.setInStock(product.getStockCount() > 0);
        
        productRepository.save(product);
        log.info("Updated stock for product ID: {} to {}", productId, product.getStockCount());
    }
    
    // Helper methods
    private ProductDTO convertToDTO(Product product) {
        return modelMapper.map(product, ProductDTO.class);
    }
    
    private Product convertToEntity(ProductDTO productDTO) {
        return modelMapper.map(productDTO, Product.class);
    }
    
    private String generateSku() {
        return "RZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        
        return switch (sortBy != null ? sortBy.toLowerCase() : "featured") {
            case "price" -> Sort.by(direction, "price");
            case "rating" -> Sort.by(direction, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "popularity" -> Sort.by(Sort.Direction.DESC, "viewCount");
            case "sales" -> Sort.by(Sort.Direction.DESC, "salesCount");
            default -> Sort.by(Sort.Direction.DESC, "isFeatured", "createdAt");
        };
    }
}
