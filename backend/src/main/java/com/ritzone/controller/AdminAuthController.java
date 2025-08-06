package com.ritzone.controller;

import com.ritzone.dto.AdminLoginDTO;
import com.ritzone.dto.AdminResponseDTO;
import com.ritzone.model.Admin;
import com.ritzone.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Authentication Controller for login/logout operations
 */
@RestController
@RequestMapping("/admin/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Authentication", description = "Admin login and authentication operations")
@CrossOrigin(origins = {"http://localhost:3000", "https://ritkart-frontend.onrender.com"})
public class AdminAuthController {
    
    private final AdminService adminService;
    
    @PostMapping("/login")
    @Operation(summary = "Admin login", description = "Authenticate admin user and return JWT token")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginDTO loginDTO) {
        try {
            log.info("Admin login attempt for username: {}", loginDTO.getUsername());
            
            Map<String, Object> response = adminService.authenticateAdmin(loginDTO);
            
            log.info("Admin login successful for username: {}", loginDTO.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Admin login failed for username: {}", loginDTO.getUsername(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid credentials", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Admin logout", description = "Logout admin user and invalidate token")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            adminService.logoutAdmin(token);
            return ResponseEntity.ok(Map.of("message", "Logout successful"));
        } catch (Exception e) {
            log.error("Admin logout failed", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Logout failed", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/profile")
    @Operation(summary = "Get admin profile", description = "Get current admin user profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String token) {
        try {
            AdminResponseDTO admin = adminService.getAdminProfile(token);
            return ResponseEntity.ok(admin);
        } catch (Exception e) {
            log.error("Failed to get admin profile", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to get profile", "message", e.getMessage()));
        }
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update admin profile", description = "Update current admin user profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody AdminResponseDTO updateDTO) {
        try {
            AdminResponseDTO updatedAdmin = adminService.updateAdminProfile(token, updateDTO);
            return ResponseEntity.ok(updatedAdmin);
        } catch (Exception e) {
            log.error("Failed to update admin profile", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update profile", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/change-password")
    @Operation(summary = "Change admin password", description = "Change current admin password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> passwordData) {
        try {
            adminService.changeAdminPassword(
                token, 
                passwordData.get("currentPassword"), 
                passwordData.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            log.error("Failed to change admin password", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to change password", "message", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-token")
    @Operation(summary = "Verify admin token", description = "Verify if admin token is valid")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            boolean isValid = adminService.verifyAdminToken(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("valid", false, "message", e.getMessage()));
        }
    }
}
