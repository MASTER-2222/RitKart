package com.ritzone.service;

import com.ritzone.model.Admin;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Service for token generation and validation
 */
@Service
@Slf4j
public class JwtService {
    
    @Value("${jwt.secret:mySecretKey123456789012345678901234567890}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * Generate JWT token for admin
     */
    public String generateAdminToken(Admin admin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("adminId", admin.getId());
        claims.put("username", admin.getUsername());
        claims.put("role", admin.getRole());
        claims.put("isSuperAdmin", admin.getIsSuperAdmin());
        claims.put("permissions", admin.getPermissions());
        
        return createToken(claims, admin.getUsername());
    }
    
    /**
     * Create JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * Validate admin token
     */
    public boolean validateAdminToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get admin ID from token
     */
    public String getAdminIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("adminId", String.class);
    }
    
    /**
     * Get username from token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.getSubject();
    }
    
    /**
     * Get role from token
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }
    
    /**
     * Check if user is super admin
     */
    public boolean isSuperAdmin(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("isSuperAdmin", Boolean.class);
    }
    
    /**
     * Get claims from token
     */
    private Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = getClaimsFromToken(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    
    /**
     * Get expiration time in milliseconds
     */
    public long getExpirationTime() {
        return jwtExpiration;
    }
}
