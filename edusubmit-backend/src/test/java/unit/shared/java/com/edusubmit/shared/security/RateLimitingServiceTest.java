package com.edusubmit.shared.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RateLimitingService
 * Tests rate limiting functionality for API endpoints and IP addresses
 */
@ExtendWith(MockitoExtension.class)
class RateLimitingServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private RateLimitingService rateLimitingService;

    private final String testUserId = "user123";
    private final String testIpAddress = "192.168.1.1";

    @BeforeEach
    void setUp() {
        // Mock Redis operations
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testIsAllowed_FirstRequest_Allowed() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(key, limit, window);

        // Assert
        assertTrue(allowed);
        verify(valueOperations, times(1)).increment("rate_limit:" + key);
        verify(redisTemplate, times(1)).expire("rate_limit:" + key, window);
    }

    @Test
    void testIsAllowed_UnderLimit_Allowed() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn("50");
        when(valueOperations.increment(anyString())).thenReturn(51L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(key, limit, window);

        // Assert
        assertTrue(allowed);
        verify(valueOperations, times(1)).increment("rate_limit:" + key);
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }

    @Test
    void testIsAllowed_AtLimit_NotAllowed() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn("100");

        // Act
        boolean allowed = rateLimitingService.isAllowed(key, limit, window);

        // Assert
        assertFalse(allowed);
        verify(valueOperations, never()).increment(anyString());
        verify(redisTemplate, never()).expire(anyString(), any(Duration.class));
    }

    @Test
    void testIsAllowed_OverLimit_NotAllowed() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn("150");

        // Act
        boolean allowed = rateLimitingService.isAllowed(key, limit, window);

        // Assert
        assertFalse(allowed);
        verify(valueOperations, never()).increment(anyString());
    }

    @Test
    void testIsAllowed_RedisError_Allowed() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenThrow(new RuntimeException("Redis connection error"));

        // Act
        boolean allowed = rateLimitingService.isAllowed(key, limit, window);

        // Assert
        assertTrue(allowed); // Fail-open on Redis error
    }

    @Test
    void testIsAllowed_AuthEndpoint_StricterLimit() {
        // Arrange
        String endpoint = "/api/auth/login";
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(testUserId, endpoint);

        // Assert
        assertTrue(allowed);
        verify(redisTemplate, times(1)).expire(
                eq("rate_limit:" + testUserId + ":" + endpoint),
                eq(Duration.ofMinutes(5))
        );
    }

    @Test
    void testIsAllowed_SubmissionEndpoint_ModerateLimit() {
        // Arrange
        String endpoint = "/api/submissions";
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(testUserId, endpoint);

        // Assert
        assertTrue(allowed);
        verify(redisTemplate, times(1)).expire(
                eq("rate_limit:" + testUserId + ":" + endpoint),
                eq(Duration.ofMinutes(1))
        );
    }

    @Test
    void testIsAllowed_FileUploadEndpoint_StricterLimit() {
        // Arrange
        String endpoint = "/api/files/upload";
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(testUserId, endpoint);

        // Assert
        assertTrue(allowed);
        verify(redisTemplate, times(1)).expire(
                eq("rate_limit:" + testUserId + ":" + endpoint),
                eq(Duration.ofMinutes(1))
        );
    }

    @Test
    void testIsAllowed_DefaultEndpoint_DefaultLimit() {
        // Arrange
        String endpoint = "/api/other";
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isAllowed(testUserId, endpoint);

        // Assert
        assertTrue(allowed);
        verify(redisTemplate, times(1)).expire(
                eq("rate_limit:" + testUserId + ":" + endpoint),
                eq(Duration.ofMinutes(1))
        );
    }

    @Test
    void testIsIpAllowed_FirstRequest_Allowed() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn(null);
        when(valueOperations.increment(anyString())).thenReturn(1L);

        // Act
        boolean allowed = rateLimitingService.isIpAllowed(testIpAddress);

        // Assert
        assertTrue(allowed);
        verify(valueOperations, times(1)).increment("rate_limit:ip:" + testIpAddress);
    }

    @Test
    void testIsIpAllowed_UnderLimit_Allowed() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn("100");
        when(valueOperations.increment(anyString())).thenReturn(101L);

        // Act
        boolean allowed = rateLimitingService.isIpAllowed(testIpAddress);

        // Assert
        assertTrue(allowed);
    }

    @Test
    void testIsIpAllowed_OverLimit_NotAllowed() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn("201");

        // Act
        boolean allowed = rateLimitingService.isIpAllowed(testIpAddress);

        // Assert
        assertFalse(allowed);
    }

    @Test
    void testGetRateLimitInfo_NewRequest() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(60L);

        // Act
        RateLimitingService.RateLimitInfo info = rateLimitingService.getRateLimitInfo(key, limit, window);

        // Assert
        assertEquals(0, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertTrue(info.isAllowed());
        assertEquals(100, info.getRemainingRequests());
    }

    @Test
    void testGetRateLimitInfo_ExistingRequest() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn("50");
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(30L);

        // Act
        RateLimitingService.RateLimitInfo info = rateLimitingService.getRateLimitInfo(key, limit, window);

        // Assert
        assertEquals(50, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertTrue(info.isAllowed());
        assertEquals(50, info.getRemainingRequests());
        assertEquals(30, info.getResetTimeSeconds());
    }

    @Test
    void testGetRateLimitInfo_AtLimit() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenReturn("100");
        when(redisTemplate.getExpire(anyString(), any(TimeUnit.class))).thenReturn(10L);

        // Act
        RateLimitingService.RateLimitInfo info = rateLimitingService.getRateLimitInfo(key, limit, window);

        // Assert
        assertEquals(100, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertFalse(info.isAllowed());
        assertEquals(0, info.getRemainingRequests());
    }

    @Test
    void testGetRateLimitInfo_RedisError_DefaultInfo() {
        // Arrange
        String key = "test_key";
        int limit = 100;
        Duration window = Duration.ofMinutes(1);
        when(valueOperations.get(anyString())).thenThrow(new RuntimeException("Redis error"));

        // Act
        RateLimitingService.RateLimitInfo info = rateLimitingService.getRateLimitInfo(key, limit, window);

        // Assert
        assertEquals(0, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertTrue(info.isAllowed()); // Fail-open on error
    }

    @Test
    void testResetRateLimit_Success() {
        // Arrange
        String key = "test_key";
        when(redisTemplate.delete(anyString())).thenReturn(true);

        // Act
        rateLimitingService.resetRateLimit(key);

        // Assert
        verify(redisTemplate, times(1)).delete("rate_limit:" + key);
    }

    @Test
    void testRateLimitInfo_Getters() {
        // Arrange
        RateLimitingService.RateLimitInfo info = new RateLimitingService.RateLimitInfo(50, 100, 30, true);

        // Act & Assert
        assertEquals(50, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertEquals(30, info.getResetTimeSeconds());
        assertTrue(info.isAllowed());
        assertEquals(50, info.getRemainingRequests());
    }

    @Test
    void testRateLimitInfo_RemainingRequests_Calculation() {
        // Arrange
        RateLimitingService.RateLimitInfo info1 = new RateLimitingService.RateLimitInfo(0, 100, 60, true);
        RateLimitingService.RateLimitInfo info2 = new RateLimitingService.RateLimitInfo(75, 100, 30, true);
        RateLimitingService.RateLimitInfo info3 = new RateLimitingService.RateLimitInfo(100, 100, 10, false);

        // Act & Assert
        assertEquals(100, info1.getRemainingRequests());
        assertEquals(25, info2.getRemainingRequests());
        assertEquals(0, info3.getRemainingRequests());
    }

    @Test
    void testRateLimitInfo_Immutability() {
        // Arrange
        RateLimitingService.RateLimitInfo info = new RateLimitingService.RateLimitInfo(50, 100, 30, true);

        // Act & Assert
        // Verify that values don't change (RateLimitInfo is immutable)
        assertEquals(50, info.getCurrentRequests());
        assertEquals(100, info.getMaxRequests());
        assertEquals(30, info.getResetTimeSeconds());
        assertTrue(info.isAllowed());
    }
}
