package com.ritzone.service;

import com.ritzone.dto.MediaDTO;
import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.Media;
import com.ritzone.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for media operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {
    
    private final MediaRepository mediaRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Get all media with pagination and filters
     */
    public Page<Media> getAllMedia(Pageable pageable, String folder, String fileType) {
        if (folder != null && fileType != null) {
            return mediaRepository.findByFileTypeAndFolder(fileType, folder, pageable);
        } else if (folder != null) {
            return mediaRepository.findByFolder(folder, pageable);
        } else if (fileType != null) {
            return mediaRepository.findByFileType(fileType, pageable);
        }
        return mediaRepository.findAll(pageable);
    }
    
    /**
     * Get media by ID
     */
    public Media getMediaById(String id) {
        return mediaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + id));
    }
    
    /**
     * Upload media file
     */
    public Media uploadMedia(MultipartFile file, String folder, String altText, String caption, String uploadedBy) {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Determine file type
            String mimeType = file.getContentType();
            String fileType = determineFileType(mimeType);
            
            // For now, we'll store the file URL as a placeholder
            // In a real implementation, you would upload to cloud storage
            String fileUrl = "/uploads/" + (folder != null ? folder + "/" : "") + uniqueFilename;
            
            Media media = Media.builder()
                .fileName(uniqueFilename)
                .originalFileName(originalFilename)
                .url(fileUrl)
                .fileType(fileType)
                .mimeType(mimeType)
                .fileSize(file.getSize())
                .altText(altText)
                .caption(caption)
                .folder(folder)
                .uploadedBy(uploadedBy)
                .isPublic(true)
                .usageCount(0L)
                .createdAt(LocalDateTime.now())
                .build();
            
            Media savedMedia = mediaRepository.save(media);
            log.info("Media uploaded: {} by {}", originalFilename, uploadedBy);
            
            return savedMedia;
            
        } catch (Exception e) {
            log.error("Failed to upload media file", e);
            throw new RuntimeException("Failed to upload media file: " + e.getMessage());
        }
    }
    
    /**
     * Update media metadata
     */
    public Media updateMedia(String id, MediaDTO mediaDTO) {
        Media existingMedia = getMediaById(id);
        
        // Update metadata fields
        existingMedia.setAltText(mediaDTO.getAltText());
        existingMedia.setCaption(mediaDTO.getCaption());
        existingMedia.setTags(mediaDTO.getTags());
        existingMedia.setFolder(mediaDTO.getFolder());
        existingMedia.setTitle(mediaDTO.getTitle());
        existingMedia.setDescription(mediaDTO.getDescription());
        existingMedia.setIsPublic(mediaDTO.getIsPublic());
        existingMedia.setUpdatedAt(LocalDateTime.now());
        
        return mediaRepository.save(existingMedia);
    }
    
    /**
     * Delete media
     */
    public void deleteMedia(String id) {
        Media media = getMediaById(id);
        
        // Check if media is being used
        if (media.getUsageCount() > 0) {
            throw new RuntimeException("Cannot delete media that is currently in use");
        }
        
        mediaRepository.delete(media);
        log.info("Media deleted: {}", media.getFileName());
    }
    
    /**
     * Search media
     */
    public Page<Media> searchMedia(String searchTerm, Pageable pageable) {
        return mediaRepository.searchMedia(searchTerm, pageable);
    }
    
    /**
     * Get media by tags
     */
    public Page<Media> getMediaByTag(String tag, Pageable pageable) {
        return mediaRepository.findByTagsContaining(tag).stream()
            .collect(java.util.stream.Collectors.collectingAndThen(
                java.util.stream.Collectors.toList(),
                list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
            ));
    }
    
    /**
     * Get unused media
     */
    public Page<Media> getUnusedMedia(Pageable pageable) {
        return mediaRepository.findUnusedMedia().stream()
            .collect(java.util.stream.Collectors.collectingAndThen(
                java.util.stream.Collectors.toList(),
                list -> new org.springframework.data.domain.PageImpl<>(list, pageable, list.size())
            ));
    }
    
    /**
     * Determine file type from MIME type
     */
    private String determineFileType(String mimeType) {
        if (mimeType == null) return "unknown";
        
        if (mimeType.startsWith("image/")) return "image";
        if (mimeType.startsWith("video/")) return "video";
        if (mimeType.startsWith("audio/")) return "audio";
        if (mimeType.equals("application/pdf")) return "document";
        if (mimeType.startsWith("text/")) return "document";
        
        return "file";
    }
}
