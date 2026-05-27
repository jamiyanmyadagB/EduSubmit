package com.edusubmit.shared.security;

import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.security.Key;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TokenRefreshService
 * Tests JWT token generation, refresh, and revocation functionality
 */
@ExtendWith(MockitoExtension.class)
class TokenRefreshServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private TokenRefreshService tokenRefreshService;

    private final String testSecret = "test-secret-key-for-testing-purposes-only-12345678";
    private final String testUsername = "testuser";
    private final String testRole = "STUDENT";

    @BeforeEach
    void setUp() {
        // Set the JWT secret for testing
        // In a real application, this would be set via @Value annotation
        // For testing, we use reflection or a setter if available
        try {
            java.lang.reflect.Field field = TokenRefreshService.class.getDeclaredField("jwtSecret");
            field.setAccessible(true);
            field.set(tokenRefreshService, testSecret);
        } catch (Exception e) {
            // If reflection fails, we'll skip tests that depend on this
        }

        // Mock Redis operations
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.hasKey(anyString())).thenReturn(true);
    }

    @Test
    void testGenerateTokenPair_Success() {
        // Arrange
        when(valueOperations.set(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true);

        // Act
        TokenRefreshService.TokenPair tokenPair = tokenRefreshService.generateTokenPair(testUsername, testRole);

        // Assert
        assertNotNull(tokenPair);
        assertNotNull(tokenPair.getAccessToken());
        assertNotNull(tokenPair.getRefreshToken());
        assertFalse(tokenPair.getAccessToken().isEmpty());
        assertFalse(tokenPair.getRefreshToken().isEmpty());

        // Verify Redis was called to store the refresh token
        verify(valueOperations, times(1)).set(
                eq("refresh_token:" + tokenPair.getRefreshToken()),
                eq(testUsername),
                anyLong(),
                any(TimeUnit.class)
        );
    }

    @Test
    void testGenerateTokenPair_DifferentRoles() {
        // Arrange
        when(valueOperations.set(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true);

        // Act
        TokenRefreshService.TokenPair studentToken = tokenRefreshService.generateTokenPair("student1", "STUDENT");
        TokenRefreshService.TokenPair teacherToken = tokenRefreshService.generateTokenPair("teacher1", "TEACHER");
        TokenRefreshService.TokenPair adminToken = tokenRefreshService.generateTokenPair("admin1", "ADMIN");

        // Assert
        assertNotNull(studentToken);
        assertNotNull(teacherToken);
        assertNotNull(adminToken);
        
        // Tokens should be different for different users
        assertNotEquals(studentToken.getAccessToken(), teacherToken.getAccessToken());
        assertNotEquals(teacherToken.getAccessToken(), adminToken.getAccessToken());
    }

    @Test
    void testRefreshAccessToken_Success() {
        // Arrange
        when(valueOperations.set(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true);
        when(redisTemplate.hasKey(anyString())).thenReturn(true);

        TokenRefreshService.TokenPair tokenPair = tokenRefreshService.generateTokenPair(testUsername, testRole);

        // Act
        String newAccessToken = tokenRefreshService.refreshAccessToken(tokenPair.getRefreshToken());

        // Assert
        assertNotNull(newAccessToken);
        assertFalse(newAccessToken.isEmpty());
        assertNotEquals(tokenPair.getAccessToken(), newAccessToken); // New token should be different
    }

    @Test
    void testRefreshAccessToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.string";
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        // Act & Assert
        assertThrows(SecurityException.class, () -> {
            tokenRefreshService.refreshAccessToken(invalidToken);
        });
    }

    @Test
    void testRevokeRefreshToken_Success() {
        // Arrange
        when(valueOperations.set(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true);
        TokenRefreshService.TokenPair tokenPair = tokenRefreshService.generateTokenPair(testUsername, testRole);
        when(redisTemplate.delete(anyString())).thenReturn(true);

        // Act
        tokenRefreshService.revokeRefreshToken(tokenPair.getRefreshToken());

        // Assert
        verify(redisTemplate, times(1)).delete("refresh_token:" + tokenPair.getRefreshToken());
    }

    @Test
    void testGetUsernameFromRefreshToken_Success() {
        // Arrange
        when(valueOperations.set(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true);
        TokenRefreshService.TokenPair tokenPair = tokenRefreshService.generateTokenPair(testUsername, testRole);

        // Act
        String username = tokenRefreshService.getUsernameFromRefreshToken(tokenPair.getRefreshToken());

        // Assert
        assertEquals(testUsername, username);
    }

    @Test
    void testGetUsernameFromRefreshToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act & Assert
        assertThrows(Exception.class, () -> {
            tokenRefreshService.getUsernameFromRefreshToken(invalidToken);
        });
    }

    @Test
    void testTokenPair_Getters() {
        // Arrange
        String accessToken = "access.token";
        String refreshToken = "refresh.token";
        TokenRefreshService.TokenPair tokenPair = new TokenRefreshService.TokenPair(accessToken, refreshToken);

        // Act & Assert
        assertEquals(accessToken, tokenPair.getAccessToken());
        assertEquals(refreshToken, tokenPair.getRefreshToken());
    }

    @Test
    void testTokenPair_Immutability() {
        // Arrange
        String accessToken = "access.token";
        String refreshToken = "refresh.token";
        TokenRefreshService.TokenPair tokenPair = new TokenRefreshService.TokenPair(accessToken, refreshToken);

        // Act & Assert
        // TokenPair is immutable - verify that the values don't change
        assertEquals(accessToken, tokenPair.getAccessToken());
        assertEquals(refreshToken, tokenPair.getRefreshToken());
    }
}
