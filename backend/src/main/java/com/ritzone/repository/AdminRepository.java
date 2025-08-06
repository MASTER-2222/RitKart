package com.ritzone.repository;

import com.ritzone.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Admin entity
 */
@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {
    
    /**
     * Find admin by username
     */
    Optional<Admin> findByUsername(String username);
    
    /**
     * Find admin by email
     */
    Optional<Admin> findByEmail(String email);
    
    /**
     * Find admin by username or email
     */
    @Query("{'$or': [{'username': ?0}, {'email': ?0}]}")
    Optional<Admin> findByUsernameOrEmail(String usernameOrEmail);
    
    /**
     * Find all active admins
     */
    List<Admin> findByIsActiveTrue();
    
    /**
     * Find all super admins
     */
    List<Admin> findByIsSuperAdminTrue();
    
    /**
     * Find admins by role
     */
    List<Admin> findByRole(String role);
    
    /**
     * Find admins with failed login attempts
     */
    @Query("{'failedLoginAttempts': {'$gte': ?0}}")
    List<Admin> findByFailedLoginAttemptsGreaterThanEqual(int attempts);
    
    /**
     * Find locked accounts
     */
    @Query("{'accountLockedUntil': {'$gt': ?0}}")
    List<Admin> findLockedAccounts(LocalDateTime currentTime);
    
    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
}
