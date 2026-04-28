package com.edusubmit.shared.security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class ApiKeyService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SecureRandom secureRandom;
    
    public ApiKeyService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.secureRandom = new SecureRandom();
    }

    public ApiKey generateApiKey(String userId, String name, List<String> permissions, int expiresInDays) {
        // Generate secure API key
        String apiKey = generateSecureApiKey();
        
        // Create API key metadata
        ApiKeyMetadata metadata = new ApiKeyMetadata(
            apiKey,
            userId,
            name,
            permissions,
            Instant.now(),
            Instant.now().plus(expiresInDays, ChronoUnit.DAYS),
            true
        );
        
        // Store API key in Redis
        storeApiKey(apiKey, metadata);
        
        // Store user's API keys mapping
        String userKeysKey = "user_api_keys:" + userId;
        redisTemplate.opsForSet().add(userKeysKey, apiKey);
        redisTemplate.expire(userKeysKey, expiresInDays + 1, TimeUnit.DAYS);
        
        return new ApiKey(apiKey, metadata);
    }
    
    public ApiKeyMetadata validateApiKey(String apiKey) {
        String key = "api_key:" + apiKey;
        
        try {
            String metadataStr = redisTemplate.opsForValue().get(key);
            if (metadataStr == null) {
                return null;
            }
            
            ApiKeyMetadata metadata = parseApiKeyMetadata(metadataStr);
            
            // Check if API key is active and not expired
            if (!metadata.isActive() || metadata.getExpiresAt().isBefore(Instant.now())) {
                return null;
            }
            
            // Update last used timestamp
            metadata.setLastUsedAt(Instant.now());
            storeApiKey(apiKey, metadata);
            
            return metadata;
        } catch (Exception e) {
            System.err.println("API key validation error: " + e.getMessage());
            return null;
        }
    }
    
    public boolean revokeApiKey(String apiKey) {
        String key = "api_key:" + apiKey;
        
        try {
            String metadataStr = redisTemplate.opsForValue().get(key);
            if (metadataStr == null) {
                return false;
            }
            
            ApiKeyMetadata metadata = parseApiKeyMetadata(metadataStr);
            metadata.setActive(false);
            storeApiKey(apiKey, metadata);
            
            return true;
        } catch (Exception e) {
            System.err.println("API key revocation error: " + e.getMessage());
            return false;
        }
    }
    
    public List<String> getUserApiKeys(String userId) {
        String userKeysKey = "user_api_keys:" + userId;
        
        try {
            return redisTemplate.opsForSet().members(userKeysKey).stream().toList();
        } catch (Exception e) {
            System.err.println("Error getting user API keys: " + e.getMessage());
            return List.of();
        }
    }
    
    public boolean hasPermission(String apiKey, String requiredPermission) {
        ApiKeyMetadata metadata = validateApiKey(apiKey);
        
        if (metadata == null) {
            return false;
        }
        
        return metadata.getPermissions().contains(requiredPermission) ||
               metadata.getPermissions().contains("*");
    }
    
    private String generateSecureApiKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return "esk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    
    private void storeApiKey(String apiKey, ApiKeyMetadata metadata) {
        String key = "api_key:" + apiKey;
        String metadataStr = serializeApiKeyMetadata(metadata);
        
        long ttl = ChronoUnit.SECONDS.between(Instant.now(), metadata.getExpiresAt());
        redisTemplate.opsForValue().set(key, metadataStr, ttl, TimeUnit.SECONDS);
    }
    
    private String serializeApiKeyMetadata(ApiKeyMetadata metadata) {
        Map<String, Object> map = new HashMap<>();
        map.put("apiKey", metadata.getApiKey());
        map.put("userId", metadata.getUserId());
        map.put("name", metadata.getName());
        map.put("permissions", String.join(",", metadata.getPermissions()));
        map.put("createdAt", metadata.getCreatedAt().toString());
        map.put("expiresAt", metadata.getExpiresAt().toString());
        map.put("lastUsedAt", metadata.getLastUsedAt().toString());
        map.put("active", metadata.isActive());
        
        // Simple serialization - in production, use JSON
        return map.toString();
    }
    
    private ApiKeyMetadata parseApiKeyMetadata(String metadataStr) {
        // Simple parsing - in production, use JSON parser
        Map<String, String> map = parseSimpleMap(metadataStr);
        
        return new ApiKeyMetadata(
            map.get("apiKey"),
            map.get("userId"),
            map.get("name"),
            List.of(map.get("permissions").split(",")),
            Instant.parse(map.get("createdAt")),
            Instant.parse(map.get("expiresAt")),
            Instant.parse(map.get("lastUsedAt")),
            Boolean.parseBoolean(map.get("active"))
        );
    }
    
    private Map<String, String> parseSimpleMap(String str) {
        Map<String, String> map = new HashMap<>();
        // Simple parsing implementation
        // In production, use proper JSON parser
        return map;
    }
    
    public static class ApiKey {
        private final String key;
        private final ApiKeyMetadata metadata;
        
        public ApiKey(String key, ApiKeyMetadata metadata) {
            this.key = key;
            this.metadata = metadata;
        }
        
        public String getKey() { return key; }
        public ApiKeyMetadata getMetadata() { return metadata; }
    }
    
    public static class ApiKeyMetadata {
        private String apiKey;
        private String userId;
        private String name;
        private List<String> permissions;
        private Instant createdAt;
        private Instant expiresAt;
        private Instant lastUsedAt;
        private boolean active;
        
        public ApiKeyMetadata(String apiKey, String userId, String name, List<String> permissions,
                           Instant createdAt, Instant expiresAt, boolean active) {
            this.apiKey = apiKey;
            this.userId = userId;
            this.name = name;
            this.permissions = permissions;
            this.createdAt = createdAt;
            this.expiresAt = expiresAt;
            this.lastUsedAt = createdAt;
            this.active = active;
        }
        
        // Getters and setters
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<String> getPermissions() { return permissions; }
        public void setPermissions(List<String> permissions) { this.permissions = permissions; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
        public Instant getLastUsedAt() { return lastUsedAt; }
        public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }
    }
}
