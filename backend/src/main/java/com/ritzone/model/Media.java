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
import org.springframework.data.mongodb.core.index.TextIndexed;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Media entity for managing images, videos, and other media files
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "media")
public class Media {
    
    @Id
    private String id;
    
    @NotBlank(message = "File name is required")
    @TextIndexed(weight = 10)
    private String fileName;
    
    @NotBlank(message = "Original file name is required")
    private String originalFileName;
    
    @NotBlank(message = "File URL is required")
    private String url;
    
    private String thumbnailUrl;
    
    @NotBlank(message = "File type is required")
    private String fileType; // image, video, document, etc.
    
    @NotBlank(message = "MIME type is required")
    private String mimeType;
    
    @NotNull(message = "File size is required")
    @Min(value = 1, message = "File size must be greater than 0")
    private Long fileSize; // in bytes
    
    // Image specific fields
    private Integer width;
    private Integer height;
    
    // Alternative text for accessibility
    private String altText;
    
    // Caption/description
    @TextIndexed(weight = 5)
    private String caption;
    
    // Tags for organization
    @TextIndexed(weight = 3)
    private List<String> tags;
    
    // Folder/category organization
    @Indexed
    private String folder;
    
    // Usage tracking
    private List<String> usedInProducts;
    private List<String> usedInCategories;
    private List<String> usedInPages;
    
    @Builder.Default
    private Long usageCount = 0L;
    
    // Upload information
    @Indexed
    private String uploadedBy; // Admin ID who uploaded
    
    // Storage information
    private String storageProvider; // local, aws-s3, cloudinary, etc.
    private String storagePath;
    private Map<String, Object> storageMetadata;
    
    // SEO and metadata
    private String title;
    private String description;
    private Map<String, Object> exifData;
    
    @Builder.Default
    private Boolean isPublic = true;
    
    @Builder.Default
    private Boolean isOptimized = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isImage() {
        return fileType != null && fileType.equals("image");
    }
    
    public boolean isVideo() {
        return fileType != null && fileType.equals("video");
    }
    
    public String getFormattedFileSize() {
        if (fileSize == null) return "0 B";
        
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        double size = fileSize.doubleValue();
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }
    
    public boolean isUsed() {
        return usageCount != null && usageCount > 0;
    }
}
