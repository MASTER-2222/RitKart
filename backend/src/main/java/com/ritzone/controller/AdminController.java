package com.ritzone.controller;

import com.ritzone.dto.*;
import com.ritzone.model.*;
import com.ritzone.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Admin Panel Controller for managing all admin operations
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Panel", description = "Admin panel operations for managing the application")
@CrossOrigin(origins = {"http://localhost:3000", "https://ritkart-frontend.onrender.com"})
public class AdminController {
    
    private final ProductService productService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final OrderService orderService;
    private final MediaService mediaService;
    private final AnalyticsService analyticsService;
    private final SystemSettingsService systemSettingsService;
    private final AdminService adminService;
    
    // ================================
    // DASHBOARD & ANALYTICS
    // ================================
    
    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard data", description = "Get overview statistics for admin dashboard")
    public ResponseEntity<?> getDashboard(@RequestHeader("Authorization") String token) {
        try {
            adminService.verifyAdminToken(token);
            Map<String, Object> dashboardData = analyticsService.getDashboardData();
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Failed to get dashboard data", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get dashboard data", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/analytics")
    @Operation(summary = "Get analytics data", description = "Get detailed analytics and metrics")
    public ResponseEntity<?> getAnalytics(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "30") int days) {
        try {
            adminService.verifyAdminToken(token);
            List<Analytics> analytics = analyticsService.getAnalytics(days);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Failed to get analytics data", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get analytics", "message", e.getMessage()));
        }
    }
    
    // ================================
    // PRODUCT MANAGEMENT
    // ================================
    
    @GetMapping("/products")
    @Operation(summary = "Get all products for admin", description = "Get paginated list of all products with admin details")
    public ResponseEntity<?> getAllProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            adminService.verifyAdminToken(token);
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Product> products = productService.getAllProductsForAdmin(pageable);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Failed to get products for admin", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get products", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/products")
    @Operation(summary = "Create new product", description = "Create a new product")
    public ResponseEntity<?> createProduct(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ProductDTO productDTO) {
        try {
            adminService.verifyAdminToken(token);
            Product product = productService.createProduct(productDTO);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            log.error("Failed to create product", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to create product", "message", e.getMessage()));
        }
    }
    
    @PutMapping("/products/{id}")
    @Operation(summary = "Update product", description = "Update an existing product")
    public ResponseEntity<?> updateProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @Valid @RequestBody ProductDTO productDTO) {
        try {
            adminService.verifyAdminToken(token);
            Product product = productService.updateProduct(id, productDTO);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            log.error("Failed to update product with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update product", "message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete product", description = "Delete a product")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete product with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete product", "message", e.getMessage()));
        }
    }
    
    // ================================
    // CATEGORY MANAGEMENT
    // ================================
    
    @GetMapping("/categories")
    @Operation(summary = "Get all categories", description = "Get all categories for admin management")
    public ResponseEntity<?> getAllCategories(@RequestHeader("Authorization") String token) {
        try {
            adminService.verifyAdminToken(token);
            List<Category> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Failed to get categories", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get categories", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/categories")
    @Operation(summary = "Create new category", description = "Create a new category")
    public ResponseEntity<?> createCategory(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CategoryDTO categoryDTO) {
        try {
            adminService.verifyAdminToken(token);
            Category category = categoryService.createCategory(categoryDTO);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            log.error("Failed to create category", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to create category", "message", e.getMessage()));
        }
    }
    
    @PutMapping("/categories/{id}")
    @Operation(summary = "Update category", description = "Update an existing category")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @Valid @RequestBody CategoryDTO categoryDTO) {
        try {
            adminService.verifyAdminToken(token);
            Category category = categoryService.updateCategory(id, categoryDTO);
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            log.error("Failed to update category with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update category", "message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete category", description = "Delete a category")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete category with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete category", "message", e.getMessage()));
        }
    }

    // ================================
    // USER MANAGEMENT
    // ================================

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Get paginated list of all users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            adminService.verifyAdminToken(token);

            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<User> users = userService.getAllUsers(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Failed to get users", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get users", "message", e.getMessage()));
        }
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID", description = "Get detailed user information")
    public ResponseEntity<?> getUserById(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to get user with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get user", "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user", description = "Update user information")
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @Valid @RequestBody UserDTO userDTO) {
        try {
            adminService.verifyAdminToken(token);
            User user = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to update user with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update user", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user", description = "Delete a user account")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete user with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete user", "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status", description = "Activate or deactivate user account")
    public ResponseEntity<?> updateUserStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody Map<String, Boolean> statusData) {
        try {
            adminService.verifyAdminToken(token);
            User user = userService.updateUserStatus(id, statusData.get("isActive"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Failed to update user status for id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update user status", "message", e.getMessage()));
        }
    }

    // ================================
    // ORDER MANAGEMENT
    // ================================

    @GetMapping("/orders")
    @Operation(summary = "Get all orders", description = "Get paginated list of all orders")
    public ResponseEntity<?> getAllOrders(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            adminService.verifyAdminToken(token);

            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Order> orders = orderService.getAllOrders(pageable, status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Failed to get orders", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get orders", "message", e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get order by ID", description = "Get detailed order information")
    public ResponseEntity<?> getOrderById(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to get order with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get order", "message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order status", description = "Update order status and tracking")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody Map<String, String> statusData) {
        try {
            adminService.verifyAdminToken(token);
            Order order = orderService.updateOrderStatus(id, statusData.get("status"), statusData.get("trackingNumber"));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to update order status for id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update order status", "message", e.getMessage()));
        }
    }

    @GetMapping("/orders/stats")
    @Operation(summary = "Get order statistics", description = "Get order statistics for dashboard")
    public ResponseEntity<?> getOrderStats(@RequestHeader("Authorization") String token) {
        try {
            adminService.verifyAdminToken(token);
            Map<String, Object> stats = orderService.getOrderStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get order stats", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get order stats", "message", e.getMessage()));
        }
    }

    // ================================
    // MEDIA GALLERY MANAGEMENT
    // ================================

    @GetMapping("/media")
    @Operation(summary = "Get all media files", description = "Get paginated list of all media files")
    public ResponseEntity<?> getAllMedia(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String fileType) {
        try {
            adminService.verifyAdminToken(token);

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Media> media = mediaService.getAllMedia(pageable, folder, fileType);
            return ResponseEntity.ok(media);
        } catch (Exception e) {
            log.error("Failed to get media files", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get media files", "message", e.getMessage()));
        }
    }

    @PostMapping("/media/upload")
    @Operation(summary = "Upload media file", description = "Upload a new media file")
    public ResponseEntity<?> uploadMedia(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) String caption) {
        try {
            adminService.verifyAdminToken(token);
            String adminId = adminService.getAdminIdFromToken(token);

            Media media = mediaService.uploadMedia(file, folder, altText, caption, adminId);
            return ResponseEntity.ok(media);
        } catch (Exception e) {
            log.error("Failed to upload media file", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to upload media", "message", e.getMessage()));
        }
    }

    @PutMapping("/media/{id}")
    @Operation(summary = "Update media file", description = "Update media file metadata")
    public ResponseEntity<?> updateMedia(
            @RequestHeader("Authorization") String token,
            @PathVariable String id,
            @RequestBody MediaDTO mediaDTO) {
        try {
            adminService.verifyAdminToken(token);
            Media media = mediaService.updateMedia(id, mediaDTO);
            return ResponseEntity.ok(media);
        } catch (Exception e) {
            log.error("Failed to update media with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update media", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/media/{id}")
    @Operation(summary = "Delete media file", description = "Delete a media file")
    public ResponseEntity<?> deleteMedia(
            @RequestHeader("Authorization") String token,
            @PathVariable String id) {
        try {
            adminService.verifyAdminToken(token);
            mediaService.deleteMedia(id);
            return ResponseEntity.ok(Map.of("message", "Media deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete media with id: {}", id, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete media", "message", e.getMessage()));
        }
    }

    // ================================
    // INVENTORY MANAGEMENT
    // ================================

    @GetMapping("/inventory")
    @Operation(summary = "Get inventory overview", description = "Get inventory statistics and low stock alerts")
    public ResponseEntity<?> getInventoryOverview(@RequestHeader("Authorization") String token) {
        try {
            adminService.verifyAdminToken(token);
            Map<String, Object> inventory = productService.getInventoryOverview();
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            log.error("Failed to get inventory overview", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get inventory", "message", e.getMessage()));
        }
    }

    @GetMapping("/inventory/low-stock")
    @Operation(summary = "Get low stock products", description = "Get products with low stock levels")
    public ResponseEntity<?> getLowStockProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "10") int threshold) {
        try {
            adminService.verifyAdminToken(token);
            List<Product> lowStockProducts = productService.getLowStockProducts(threshold);
            return ResponseEntity.ok(lowStockProducts);
        } catch (Exception e) {
            log.error("Failed to get low stock products", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get low stock products", "message", e.getMessage()));
        }
    }

    @PutMapping("/inventory/{productId}/stock")
    @Operation(summary = "Update product stock", description = "Update product stock quantity")
    public ResponseEntity<?> updateProductStock(
            @RequestHeader("Authorization") String token,
            @PathVariable String productId,
            @RequestBody Map<String, Integer> stockData) {
        try {
            adminService.verifyAdminToken(token);
            Product product = productService.updateProductStock(productId, stockData.get("stockCount"));
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            log.error("Failed to update stock for product: {}", productId, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update stock", "message", e.getMessage()));
        }
    }

    // ================================
    // SYSTEM SETTINGS
    // ================================

    @GetMapping("/settings")
    @Operation(summary = "Get system settings", description = "Get all system settings by category")
    public ResponseEntity<?> getSystemSettings(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String category) {
        try {
            adminService.verifyAdminToken(token);
            List<SystemSettings> settings = systemSettingsService.getSettings(category);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            log.error("Failed to get system settings", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get settings", "message", e.getMessage()));
        }
    }

    @PutMapping("/settings/{key}")
    @Operation(summary = "Update system setting", description = "Update a system setting value")
    public ResponseEntity<?> updateSystemSetting(
            @RequestHeader("Authorization") String token,
            @PathVariable String key,
            @RequestBody Map<String, String> settingData) {
        try {
            adminService.verifyAdminToken(token);
            String adminId = adminService.getAdminIdFromToken(token);

            SystemSettings setting = systemSettingsService.updateSetting(key, settingData.get("value"), adminId);
            return ResponseEntity.ok(setting);
        } catch (Exception e) {
            log.error("Failed to update setting: {}", key, e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update setting", "message", e.getMessage()));
        }
    }

    @GetMapping("/system/health")
    @Operation(summary = "Get system health", description = "Get system health and monitoring data")
    public ResponseEntity<?> getSystemHealth(@RequestHeader("Authorization") String token) {
        try {
            adminService.verifyAdminToken(token);
            Map<String, Object> health = systemSettingsService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Failed to get system health", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get system health", "message", e.getMessage()));
        }
    }
}
