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

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Admin entity for RitZone admin panel access
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "admins")
public class Admin {
    
    @Id
    private String id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Indexed(unique = true)
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @Builder.Default
    private String role = "ADMIN";
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Boolean isSuperAdmin = false;
    
    private String profileImage;
    
    private String phone;
    
    private List<String> permissions;
    
    private LocalDateTime lastLogin;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Security fields
    private Integer failedLoginAttempts;
    private LocalDateTime accountLockedUntil;
    private String resetPasswordToken;
    private LocalDateTime resetPasswordExpiry;
    
    // Helper methods
    public boolean isAccountLocked() {
        return accountLockedUntil != null && accountLockedUntil.isAfter(LocalDateTime.now());
    }
    
    public boolean hasPermission(String permission) {
        return isSuperAdmin || (permissions != null && permissions.contains(permission));
    }
}
