package com.edusubmit.shared.security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitingService {

    private final RedisTemplate<String, String> redisTemplate;
    
    // Rate limiting configurations
    private static final int DEFAULT_REQUEST_LIMIT = 100;
    private static final Duration DEFAULT_WINDOW = Duration.ofMinutes(1);
    
    // API-specific limits
    private static final int AUTH_REQUEST_LIMIT = 10;
    private static final int SUBMISSION_REQUEST_LIMIT = 50;
    private static final int FILE_UPLOAD_REQUEST_LIMIT = 20;
    
    public RateLimitingService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String key, int limit, Duration window) {
        String redisKey = "rate_limit:" + key;
        
        try {
            // Get current count
            String countStr = redisTemplate.opsForValue().get(redisKey);
            int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
            
            if (currentCount >= limit) {
                return false;
            }
            
            // Increment counter
            Long newCount = redisTemplate.opsForValue().increment(redisKey);
            
            // Set expiration if this is the first request
            if (newCount == 1) {
                redisTemplate.expire(redisKey, window);
            }
            
            return true;
        } catch (Exception e) {
            // Log error and allow request if Redis is unavailable
            System.err.println("Rate limiting error: " + e.getMessage());
            return true;
        }
    }
    
    public boolean isAllowed(String userId, String endpoint) {
        String key = userId + ":" + endpoint;
        
        // Apply different limits based on endpoint
        switch (endpoint) {
            case "/api/auth/login":
            case "/api/auth/register":
                return isAllowed(key, AUTH_REQUEST_LIMIT, Duration.ofMinutes(5));
            case "/api/submissions":
                return isAllowed(key, SUBMISSION_REQUEST_LIMIT, Duration.ofMinutes(1));
            case "/api/files/upload":
                return isAllowed(key, FILE_UPLOAD_REQUEST_LIMIT, Duration.ofMinutes(1));
            default:
                return isAllowed(key, DEFAULT_REQUEST_LIMIT, DEFAULT_WINDOW);
        }
    }
    
    public boolean isIpAllowed(String ipAddress) {
        String key = "ip:" + ipAddress;
        return isAllowed(key, DEFAULT_REQUEST_LIMIT * 2, DEFAULT_WINDOW);
    }
    
    public RateLimitInfo getRateLimitInfo(String key, int limit, Duration window) {
        String redisKey = "rate_limit:" + key;
        
        try {
            String countStr = redisTemplate.opsForValue().get(redisKey);
            int currentCount = countStr != null ? Integer.parseInt(countStr) : 0;
            
            Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            
            return new RateLimitInfo(
                currentCount,
                limit,
                ttl != null && ttl > 0 ? ttl : window.getSeconds(),
                currentCount < limit
            );
        } catch (Exception e) {
            return new RateLimitInfo(0, limit, window.getSeconds(), true);
        }
    }
    
    public void resetRateLimit(String key) {
        String redisKey = "rate_limit:" + key;
        redisTemplate.delete(redisKey);
    }
    
    public static class RateLimitInfo {
        private final int currentRequests;
        private final int maxRequests;
        private final long resetTimeSeconds;
        private final boolean allowed;
        
        public RateLimitInfo(int currentRequests, int maxRequests, long resetTimeSeconds, boolean allowed) {
            this.currentRequests = currentRequests;
            this.maxRequests = maxRequests;
            this.resetTimeSeconds = resetTimeSeconds;
            this.allowed = allowed;
        }
        
        public int getCurrentRequests() { return currentRequests; }
        public int getMaxRequests() { return maxRequests; }
        public long getResetTimeSeconds() { return resetTimeSeconds; }
        public boolean isAllowed() { return allowed; }
        public int getRemainingRequests() { return Math.max(0, maxRequests - currentRequests); }
    }
}
