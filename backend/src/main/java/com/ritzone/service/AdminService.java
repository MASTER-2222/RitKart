package com.ritzone.service;

import com.ritzone.dto.AdminLoginDTO;
import com.ritzone.dto.AdminResponseDTO;
import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.Admin;
import com.ritzone.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for admin operations and authentication
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final JwtService jwtService;
    
    /**
     * Initialize default admin user
     */
    public void initializeDefaultAdmin() {
        try {
            if (adminRepository.findByUsername("ritmukherjee").isEmpty()) {
                Admin defaultAdmin = Admin.builder()
                    .username("ritmukherjee")
                    .password(passwordEncoder.encode("ritmukherjee"))
                    .email("admin@ritzone.com")
                    .fullName("Rit Mukherjee")
                    .role("SUPER_ADMIN")
                    .isActive(true)
                    .isSuperAdmin(true)
                    .createdAt(LocalDateTime.now())
                    .build();
                
                adminRepository.save(defaultAdmin);
                log.info("Default admin user created successfully");
            }
        } catch (Exception e) {
            log.error("Failed to initialize default admin", e);
        }
    }
    
    /**
     * Authenticate admin user
     */
    public Map<String, Object> authenticateAdmin(AdminLoginDTO loginDTO) {
        Admin admin = adminRepository.findByUsername(loginDTO.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        
        if (!admin.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }
        
        if (admin.isAccountLocked()) {
            throw new RuntimeException("Account is locked. Please try again later.");
        }
        
        if (!passwordEncoder.matches(loginDTO.getPassword(), admin.getPassword())) {
            handleFailedLogin(admin);
            throw new RuntimeException("Invalid credentials");
        }
        
        // Reset failed login attempts on successful login
        admin.setFailedLoginAttempts(0);
        admin.setAccountLockedUntil(null);
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);
        
        // Generate JWT token
        String token = jwtService.generateAdminToken(admin);
        
        AdminResponseDTO adminResponse = modelMapper.map(admin, AdminResponseDTO.class);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("admin", adminResponse);
        response.put("expiresIn", jwtService.getExpirationTime());
        
        return response;
    }
    
    /**
     * Handle failed login attempts
     */
    private void handleFailedLogin(Admin admin) {
        int attempts = admin.getFailedLoginAttempts() != null ? admin.getFailedLoginAttempts() : 0;
        attempts++;
        admin.setFailedLoginAttempts(attempts);
        
        if (attempts >= 5) {
            admin.setAccountLockedUntil(LocalDateTime.now().plusMinutes(30));
        }
        
        adminRepository.save(admin);
    }
    
    /**
     * Logout admin user
     */
    public void logoutAdmin(String token) {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just log the logout
        log.info("Admin logged out");
    }
    
    /**
     * Get admin profile from token
     */
    public AdminResponseDTO getAdminProfile(String token) {
        String adminId = getAdminIdFromToken(token);
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        return modelMapper.map(admin, AdminResponseDTO.class);
    }
    
    /**
     * Update admin profile
     */
    public AdminResponseDTO updateAdminProfile(String token, AdminResponseDTO updateDTO) {
        String adminId = getAdminIdFromToken(token);
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        // Update allowed fields
        admin.setFullName(updateDTO.getFullName());
        admin.setEmail(updateDTO.getEmail());
        admin.setPhone(updateDTO.getPhone());
        admin.setProfileImage(updateDTO.getProfileImage());
        admin.setUpdatedAt(LocalDateTime.now());
        
        Admin savedAdmin = adminRepository.save(admin);
        return modelMapper.map(savedAdmin, AdminResponseDTO.class);
    }
    
    /**
     * Change admin password
     */
    public void changeAdminPassword(String token, String currentPassword, String newPassword) {
        String adminId = getAdminIdFromToken(token);
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        if (!passwordEncoder.matches(currentPassword, admin.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        admin.setPassword(passwordEncoder.encode(newPassword));
        admin.setUpdatedAt(LocalDateTime.now());
        adminRepository.save(admin);
    }
    
    /**
     * Verify admin token
     */
    public boolean verifyAdminToken(String token) {
        try {
            String cleanToken = token.replace("Bearer ", "");
            return jwtService.validateAdminToken(cleanToken);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get admin ID from token
     */
    public String getAdminIdFromToken(String token) {
        String cleanToken = token.replace("Bearer ", "");
        return jwtService.getAdminIdFromToken(cleanToken);
    }
}
