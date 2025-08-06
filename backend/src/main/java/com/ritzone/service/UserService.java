package com.ritzone.service;

import com.ritzone.dto.UserDTO;
import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.User;
import com.ritzone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for user operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    /**
     * Get all users with pagination
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    /**
     * Get user by ID
     */
    public User getUserById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    /**
     * Create new user
     */
    public User createUser(UserDTO userDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("User with email '" + userDTO.getEmail() + "' already exists");
        }
        
        User user = modelMapper.map(userDTO, User.class);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    /**
     * Update user
     */
    public User updateUser(String id, UserDTO userDTO) {
        User existingUser = getUserById(id);
        
        // Check if email is being changed and if new email already exists
        if (!existingUser.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("User with email '" + userDTO.getEmail() + "' already exists");
        }
        
        // Update fields
        existingUser.setFirstName(userDTO.getFirstName());
        existingUser.setLastName(userDTO.getLastName());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setPhoneNumber(userDTO.getPhone());
        existingUser.setProfileImage(userDTO.getProfileImage());
        existingUser.setIsActive(userDTO.getIsActive());
        existingUser.setIsEmailVerified(userDTO.getEmailVerified());
        existingUser.setIsPhoneVerified(userDTO.getPhoneVerified());
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(existingUser);
    }
    
    /**
     * Delete user
     */
    public void deleteUser(String id) {
        User user = getUserById(id);
        userRepository.delete(user);
        log.info("User deleted: {}", user.getEmail());
    }
    
    /**
     * Update user status (activate/deactivate)
     */
    public User updateUserStatus(String id, Boolean isActive) {
        User user = getUserById(id);
        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User status updated: {} - Active: {}", user.getEmail(), isActive);
        
        return savedUser;
    }
    
    /**
     * Get active users count
     */
    public long getActiveUsersCount() {
        return userRepository.countByIsActiveTrue();
    }
    
    /**
     * Get total users count
     */
    public long getTotalUsersCount() {
        return userRepository.count();
    }
    
    /**
     * Search users by name or email
     */
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        // Simplified search - you can implement custom query later
        return userRepository.findAll(pageable);
    }
}
