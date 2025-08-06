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
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User entity representing customers and admins in RitZone
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {
    
    @Id
    private String id;
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid")
    private String phoneNumber;
    
    private String profileImage;
    
    @Builder.Default
    private List<Role> roles = List.of(Role.CUSTOMER);
    
    @Builder.Default
    private Boolean isActive = true;
    
    @Builder.Default
    private Boolean isEmailVerified = false;
    
    @Builder.Default
    private Boolean isPhoneVerified = false;
    
    private String emailVerificationToken;
    
    private String phoneVerificationToken;
    
    private String passwordResetToken;
    
    private LocalDateTime passwordResetTokenExpiry;
    
    private LocalDateTime lastLoginAt;
    
    @Builder.Default
    private Boolean isPrimeUser = false;
    
    private LocalDateTime primeExpiryDate;
    
    private List<Address> addresses;
    
    private List<PaymentMethod> paymentMethods;
    
    private UserPreferences preferences;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Enum for user roles
    public enum Role {
        CUSTOMER, ADMIN, SUPER_ADMIN
    }
    
    // Nested class for user addresses
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String id;
        private String type; // HOME, WORK, OTHER
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phoneNumber;
        private Boolean isDefault;
    }
    
    // Nested class for payment methods
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethod {
        private String id;
        private String type; // CREDIT_CARD, DEBIT_CARD, PAYPAL, etc.
        private String cardNumber; // masked
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String brand; // VISA, MASTERCARD, etc.
        private Boolean isDefault;
        private String stripePaymentMethodId;
    }
    
    // Nested class for user preferences
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreferences {
        private Boolean emailNotifications;
        private Boolean smsNotifications;
        private Boolean pushNotifications;
        private String language;
        private String currency;
        private String timezone;
        private List<String> favoriteCategories;
    }
    
    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive && isEmailVerified;
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public Boolean hasRole(Role role) {
        return roles.contains(role);
    }
    
    public Boolean isAdmin() {
        return hasRole(Role.ADMIN) || hasRole(Role.SUPER_ADMIN);
    }
    
    public Address getDefaultAddress() {
        return addresses != null ? 
                addresses.stream()
                        .filter(addr -> Boolean.TRUE.equals(addr.getIsDefault()))
                        .findFirst()
                        .orElse(null) : null;
    }
    
    public PaymentMethod getDefaultPaymentMethod() {
        return paymentMethods != null ? 
                paymentMethods.stream()
                        .filter(pm -> Boolean.TRUE.equals(pm.getIsDefault()))
                        .findFirst()
                        .orElse(null) : null;
    }
}
