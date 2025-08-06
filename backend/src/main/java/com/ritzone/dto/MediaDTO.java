package com.ritzone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for media operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaDTO {
    
    private String id;
    private String fileName;
    private String originalFileName;
    private String url;
    private String thumbnailUrl;
    private String fileType;
    private String mimeType;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String altText;
    private String caption;
    private List<String> tags;
    private String folder;
    private String title;
    private String description;
    private Boolean isPublic;
}
