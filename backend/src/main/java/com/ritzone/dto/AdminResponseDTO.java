package com.ritzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for admin response data (without sensitive information)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponseDTO {
    
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Boolean isActive;
    private Boolean isSuperAdmin;
    private String profileImage;
    private String phone;
    private List<String> permissions;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
