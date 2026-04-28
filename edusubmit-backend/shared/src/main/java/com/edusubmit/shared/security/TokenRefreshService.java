package com.edusubmit.shared.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class TokenRefreshService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.jwt.refresh-expiration:604800000}") // 7 days
    private long refreshExpirationMs;
    
    @Value("${app.jwt.access-expiration:900000}") // 15 minutes
    private long accessExpirationMs;
    
    private final RedisTemplate<String, String> redisTemplate;
    
    public TokenRefreshService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public TokenPair generateTokenPair(String username, String role) {
        // Generate access token
        String accessToken = generateAccessToken(username, role);
        
        // Generate refresh token
        String refreshToken = generateRefreshToken(username);
        
        // Store refresh token in Redis
        storeRefreshToken(refreshToken, username);
        
        return new TokenPair(accessToken, refreshToken);
    }
    
    public String refreshAccessToken(String refreshToken) {
        // Validate refresh token
        if (!validateRefreshToken(refreshToken)) {
            throw new SecurityException("Invalid or expired refresh token");
        }
        
        // Get username from refresh token
        String username = getUsernameFromRefreshToken(refreshToken);
        
        // Generate new access token
        String role = getUserRole(username); // Implement this method
        String newAccessToken = generateAccessToken(username, role);
        
        return newAccessToken;
    }
    
    public void revokeRefreshToken(String refreshToken) {
        String key = "refresh_token:" + refreshToken;
        redisTemplate.delete(key);
    }
    
    private String generateAccessToken(String username, String role) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(accessExpirationMs, ChronoUnit.MILLIS)))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    private String generateRefreshToken(String username) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        String tokenId = UUID.randomUUID().toString();
        
        return Jwts.builder()
                .setSubject(username)
                .claim("type", "refresh")
                .claim("tokenId", tokenId)
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(refreshExpirationMs, ChronoUnit.MILLIS)))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    private void storeRefreshToken(String refreshToken, String username) {
        String key = "refresh_token:" + refreshToken;
        redisTemplate.opsForValue().set(key, username, refreshExpirationMs, TimeUnit.MILLISECONDS);
    }
    
    private boolean validateRefreshToken(String refreshToken) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken);
            
            // Check if token exists in Redis
            String key = "refresh_token:" + refreshToken;
            return redisTemplate.hasKey(key);
            
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    
    private String getUsernameFromRefreshToken(String refreshToken) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken).getBody();
        return claims.getSubject();
    }
    
    private String getUserRole(String username) {
        // Implement user role lookup from database
        return "USER"; // Default role
    }
    
    public static class TokenPair {
        private final String accessToken;
        private final String refreshToken;
        
        public TokenPair(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }
        
        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
    }
}
