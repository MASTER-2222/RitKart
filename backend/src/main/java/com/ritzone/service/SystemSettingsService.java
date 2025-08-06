package com.ritzone.service;

import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.SystemSettings;
import com.ritzone.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for system settings operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsService {
    
    private final SystemSettingsRepository systemSettingsRepository;
    
    /**
     * Get all settings or by category
     */
    public List<SystemSettings> getSettings(String category) {
        if (category != null && !category.isEmpty()) {
            return systemSettingsRepository.findByCategory(category);
        }
        return systemSettingsRepository.findAll();
    }
    
    /**
     * Get setting by key
     */
    public SystemSettings getSettingByKey(String key) {
        return systemSettingsRepository.findByKey(key)
            .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
    }
    
    /**
     * Update setting value
     */
    public SystemSettings updateSetting(String key, String value, String updatedBy) {
        SystemSettings setting = getSettingByKey(key);
        
        if (!setting.getIsEditable()) {
            throw new RuntimeException("Setting '" + key + "' is not editable");
        }
        
        setting.setValue(value);
        setting.setUpdatedBy(updatedBy);
        setting.setUpdatedAt(LocalDateTime.now());
        
        SystemSettings savedSetting = systemSettingsRepository.save(setting);
        log.info("Setting updated: {} = {} by {}", key, value, updatedBy);
        
        return savedSetting;
    }
    
    /**
     * Create new setting
     */
    public SystemSettings createSetting(SystemSettings setting) {
        if (systemSettingsRepository.existsByKey(setting.getKey())) {
            throw new RuntimeException("Setting with key '" + setting.getKey() + "' already exists");
        }
        
        setting.setCreatedAt(LocalDateTime.now());
        setting.setUpdatedAt(LocalDateTime.now());
        
        return systemSettingsRepository.save(setting);
    }
    
    /**
     * Delete setting
     */
    public void deleteSetting(String key) {
        SystemSettings setting = getSettingByKey(key);
        
        if (!setting.getIsEditable()) {
            throw new RuntimeException("Setting '" + key + "' cannot be deleted");
        }
        
        systemSettingsRepository.delete(setting);
        log.info("Setting deleted: {}", key);
    }
    
    /**
     * Get public settings (accessible by frontend)
     */
    public List<SystemSettings> getPublicSettings() {
        return systemSettingsRepository.findByIsPublicTrue();
    }
    
    /**
     * Get settings by category and public
     */
    public List<SystemSettings> getPublicSettingsByCategory(String category) {
        return systemSettingsRepository.findByCategoryAndIsPublicTrue(category);
    }
    
    /**
     * Search settings
     */
    public List<SystemSettings> searchSettings(String searchTerm) {
        return systemSettingsRepository.searchSettings(searchTerm);
    }
    
    /**
     * Initialize default settings
     */
    public void initializeDefaultSettings() {
        createDefaultSettingIfNotExists("site.name", "RitZone", "string", "general", "Website name", true, true);
        createDefaultSettingIfNotExists("site.description", "Your one-stop e-commerce destination", "string", "general", "Website description", true, true);
        createDefaultSettingIfNotExists("site.logo", "/images/logo.png", "string", "general", "Website logo URL", true, true);
        createDefaultSettingIfNotExists("site.favicon", "/images/favicon.ico", "string", "general", "Website favicon URL", true, true);
        
        createDefaultSettingIfNotExists("email.enabled", "true", "boolean", "email", "Enable email notifications", false, true);
        createDefaultSettingIfNotExists("email.from", "noreply@ritzone.com", "string", "email", "Default from email address", false, true);
        
        createDefaultSettingIfNotExists("payment.stripe.enabled", "false", "boolean", "payment", "Enable Stripe payments", false, true);
        createDefaultSettingIfNotExists("payment.cod.enabled", "true", "boolean", "payment", "Enable Cash on Delivery", false, true);
        
        createDefaultSettingIfNotExists("shipping.free.threshold", "35.00", "number", "shipping", "Free shipping threshold amount", false, true);
        createDefaultSettingIfNotExists("shipping.standard.cost", "5.99", "number", "shipping", "Standard shipping cost", false, true);
        createDefaultSettingIfNotExists("shipping.express.cost", "12.99", "number", "shipping", "Express shipping cost", false, true);
        
        createDefaultSettingIfNotExists("inventory.low.stock.threshold", "10", "number", "inventory", "Low stock alert threshold", false, true);
        createDefaultSettingIfNotExists("inventory.auto.reorder", "false", "boolean", "inventory", "Enable automatic reordering", false, true);
        
        log.info("Default system settings initialized");
    }
    
    /**
     * Create default setting if it doesn't exist
     */
    private void createDefaultSettingIfNotExists(String key, String value, String type, String category, String description, boolean isPublic, boolean isEditable) {
        if (!systemSettingsRepository.existsByKey(key)) {
            SystemSettings setting = SystemSettings.builder()
                .key(key)
                .value(value)
                .defaultValue(value)
                .type(type)
                .category(category)
                .description(description)
                .isPublic(isPublic)
                .isEditable(isEditable)
                .requiresRestart(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            systemSettingsRepository.save(setting);
        }
    }
    
    /**
     * Get system health information
     */
    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Database connectivity
        try {
            long settingsCount = systemSettingsRepository.count();
            health.put("database", "UP");
            health.put("settingsCount", settingsCount);
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("databaseError", e.getMessage());
        }
        
        // System information
        Runtime runtime = Runtime.getRuntime();
        health.put("totalMemory", runtime.totalMemory());
        health.put("freeMemory", runtime.freeMemory());
        health.put("usedMemory", runtime.totalMemory() - runtime.freeMemory());
        health.put("maxMemory", runtime.maxMemory());
        health.put("availableProcessors", runtime.availableProcessors());
        
        // Application information
        health.put("timestamp", LocalDateTime.now());
        health.put("status", "UP");
        
        return health;
    }
}
