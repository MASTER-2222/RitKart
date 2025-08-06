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
import java.util.Map;

/**
 * System Settings entity for managing application configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "system_settings")
public class SystemSettings {
    
    @Id
    private String id;
    
    @NotBlank(message = "Setting key is required")
    @Indexed(unique = true)
    private String key;
    
    @NotBlank(message = "Setting value is required")
    private String value;
    
    private String description;
    
    @NotBlank(message = "Setting type is required")
    private String type; // string, number, boolean, json, array
    
    @NotBlank(message = "Category is required")
    @Indexed
    private String category; // general, email, payment, shipping, seo, etc.
    
    @Builder.Default
    private Boolean isPublic = false; // Can be accessed by frontend
    
    @Builder.Default
    private Boolean isEditable = true; // Can be modified through admin panel
    
    @Builder.Default
    private Boolean requiresRestart = false; // Requires application restart to take effect
    
    private String defaultValue;
    
    private String validationRule; // Regex or validation expression
    
    private Map<String, Object> options; // For dropdown/select options
    
    @Indexed
    private String updatedBy; // Admin ID who last updated
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Helper methods
    public Boolean getBooleanValue() {
        if (value == null) return false;
        return Boolean.parseBoolean(value);
    }
    
    public Integer getIntegerValue() {
        if (value == null) return 0;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    public Double getDoubleValue() {
        if (value == null) return 0.0;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
    
    public boolean isDefault() {
        return value != null && value.equals(defaultValue);
    }
}
