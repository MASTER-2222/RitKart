package com.ritzone.repository;

import com.ritzone.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Find by email
    Optional<User> findByEmail(String email);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find by phone number
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    // Check if phone number exists
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Find by verification tokens
    Optional<User> findByEmailVerificationToken(String token);
    
    Optional<User> findByPhoneVerificationToken(String token);
    
    Optional<User> findByPasswordResetToken(String token);
    
    // Find active users
    Page<User> findByIsActiveTrue(Pageable pageable);
    
    List<User> findByIsActiveTrue();
    
    // Find by role
    @Query("{'roles': ?0, 'isActive': true}")
    List<User> findByRole(User.Role role);
    
    @Query("{'roles': ?0, 'isActive': true}")
    Page<User> findByRole(User.Role role, Pageable pageable);
    
    // Find admins
    @Query("{'roles': {$in: ['ADMIN', 'SUPER_ADMIN']}, 'isActive': true}")
    List<User> findAdmins();
    
    // Find customers
    @Query("{'roles': 'CUSTOMER', 'isActive': true}")
    Page<User> findCustomers(Pageable pageable);
    
    // Find verified users
    Page<User> findByIsEmailVerifiedTrueAndIsActiveTrue(Pageable pageable);
    
    // Find unverified users
    Page<User> findByIsEmailVerifiedFalseAndIsActiveTrue(Pageable pageable);
    
    // Find Prime users
    Page<User> findByIsPrimeUserTrueAndIsActiveTrue(Pageable pageable);
    
    List<User> findByIsPrimeUserTrueAndIsActiveTrue();
    
    // Find users with expired Prime
    @Query("{'isPrimeUser': true, 'primeExpiryDate': {$lt: ?0}, 'isActive': true}")
    List<User> findUsersWithExpiredPrime(LocalDateTime currentDate);
    
    // Find users by registration date
    @Query("{'createdAt': {$gte: ?0, $lte: ?1}, 'isActive': true}")
    List<User> findUsersByRegistrationDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find users by last login
    @Query("{'lastLoginAt': {$gte: ?0}, 'isActive': true}")
    List<User> findUsersByLastLoginAfter(LocalDateTime date);
    
    @Query("{'lastLoginAt': {$lt: ?0}, 'isActive': true}")
    List<User> findInactiveUsersSince(LocalDateTime date);
    
    // Search users by name or email
    @Query("{'$or': [" +
           "{'firstName': {$regex: ?0, $options: 'i'}}, " +
           "{'lastName': {$regex: ?0, $options: 'i'}}, " +
           "{'email': {$regex: ?0, $options: 'i'}}" +
           "], 'isActive': true}")
    Page<User> searchUsers(String searchTerm, Pageable pageable);
    
    // Find users by name
    @Query("{'$or': [" +
           "{'firstName': {$regex: ?0, $options: 'i'}}, " +
           "{'lastName': {$regex: ?0, $options: 'i'}}" +
           "], 'isActive': true}")
    List<User> findByNameContaining(String name);
    
    // Count methods
    long countByIsActiveTrue();
    
    long countByIsEmailVerifiedTrueAndIsActiveTrue();
    
    long countByIsPrimeUserTrueAndIsActiveTrue();
    
    @Query(value = "{'roles': 'CUSTOMER', 'isActive': true}", count = true)
    long countCustomers();
    
    @Query(value = "{'roles': {$in: ['ADMIN', 'SUPER_ADMIN']}, 'isActive': true}", count = true)
    long countAdmins();
    
    // Find users registered today
    @Query("{'createdAt': {$gte: ?0}, 'isActive': true}")
    List<User> findUsersRegisteredToday(LocalDateTime startOfDay);
    
    // Find users with password reset token expiry
    @Query("{'passwordResetToken': {$exists: true}, 'passwordResetTokenExpiry': {$lt: ?0}}")
    List<User> findUsersWithExpiredPasswordResetToken(LocalDateTime currentDate);
    
    // Find users by preferences
    @Query("{'preferences.favoriteCategories': {$in: ?0}, 'isActive': true}")
    List<User> findUsersByFavoriteCategories(List<String> categories);
    
    @Query("{'preferences.language': ?0, 'isActive': true}")
    List<User> findUsersByLanguage(String language);
    
    @Query("{'preferences.emailNotifications': true, 'isActive': true}")
    List<User> findUsersWithEmailNotificationsEnabled();
    
    @Query("{'preferences.smsNotifications': true, 'isActive': true}")
    List<User> findUsersWithSmsNotificationsEnabled();
    
    // Statistics queries
    @Query(value = "{'createdAt': {$gte: ?0, $lte: ?1}}", count = true)
    long countUsersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find users for bulk operations
    @Query("{'isActive': true}")
    List<User> findAllActiveUsers();
    
    // Find users by address city
    @Query("{'addresses.city': ?0, 'isActive': true}")
    List<User> findUsersByCity(String city);
    
    // Find users by address state
    @Query("{'addresses.state': ?0, 'isActive': true}")
    List<User> findUsersByState(String state);
    
    // Find users by address country
    @Query("{'addresses.country': ?0, 'isActive': true}")
    List<User> findUsersByCountry(String country);
}
