package com.edusubmit.shared.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class AdvancedSecurityFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitingService rateLimitingService;
    
    @Autowired
    private ApiKeyService apiKeyService;
    
    @Autowired
    private TokenRefreshService tokenRefreshService;
    
    // Endpoints that require API key authentication
    private static final List<String> API_KEY_REQUIRED_ENDPOINTS = Arrays.asList(
        "/api/admin/",
        "/api/analytics/",
        "/api/reports/",
        "/api/bulk/"
    );
    
    // Endpoints that bypass rate limiting
    private static final List<String> NO_RATE_LIMIT_ENDPOINTS = Arrays.asList(
        "/actuator/health",
        "/actuator/info",
        "/api/public/"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String clientIp = getClientIpAddress(request);
        String endpoint = request.getRequestURI();
        String method = request.getMethod();
        
        // 1. IP-based rate limiting
        if (!shouldBypassRateLimit(endpoint)) {
            if (!rateLimitingService.isIpAllowed(clientIp)) {
                sendRateLimitExceededResponse(response, "IP rate limit exceeded");
                return;
            }
        }
        
        // 2. API Key validation for sensitive endpoints
        if (requiresApiKey(endpoint)) {
            String apiKey = extractApiKey(request);
            if (apiKey == null || !apiKeyService.validateApiKey(apiKey)) {
                sendUnauthorizedResponse(response, "Valid API key required");
                return;
            }
            
            // Check API key permissions
            String requiredPermission = getRequiredPermission(endpoint, method);
            if (!apiKeyService.hasPermission(apiKey, requiredPermission)) {
                sendForbiddenResponse(response, "Insufficient permissions");
                return;
            }
        }
        
        // 3. User-based rate limiting (if authenticated)
        String userId = extractUserIdFromToken(request);
        if (userId != null && !shouldBypassRateLimit(endpoint)) {
            if (!rateLimitingService.isAllowed(userId, endpoint)) {
                sendRateLimitExceededResponse(response, "User rate limit exceeded");
                return;
            }
        }
        
        // Add security headers
        addSecurityHeaders(response);
        
        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }
    
    private boolean shouldBypassRateLimit(String endpoint) {
        return NO_RATE_LIMIT_ENDPOINTS.stream().anyMatch(endpoint::startsWith);
    }
    
    private boolean requiresApiKey(String endpoint) {
        return API_KEY_REQUIRED_ENDPOINTS.stream().anyMatch(endpoint::startsWith);
    }
    
    private String extractApiKey(HttpServletRequest request) {
        // Try header first
        String apiKey = request.getHeader("X-API-Key");
        if (apiKey != null) {
            return apiKey;
        }
        
        // Try query parameter
        apiKey = request.getParameter("api_key");
        if (apiKey != null) {
            return apiKey;
        }
        
        return null;
    }
    
    private String extractUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Validate token and extract user ID
                // This is a simplified implementation
                return tokenRefreshService.getUsernameFromRefreshToken(token);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
    
    private String getRequiredPermission(String endpoint, String method) {
        // Map endpoints to required permissions
        if (endpoint.startsWith("/api/admin/")) {
            return "ADMIN_ACCESS";
        } else if (endpoint.startsWith("/api/analytics/")) {
            return "ANALYTICS_READ";
        } else if (endpoint.startsWith("/api/reports/")) {
            return "REPORTS_READ";
        } else if (endpoint.startsWith("/api/bulk/") && "POST".equals(method)) {
            return "BULK_WRITE";
        } else if (endpoint.startsWith("/api/bulk/")) {
            return "BULK_READ";
        }
        
        return "READ";
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private void addSecurityHeaders(HttpServletResponse response) {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        response.setHeader("Content-Security-Policy", "default-src 'self'");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    }
    
    private void sendRateLimitExceededResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"error\":\"Rate limit exceeded\",\"message\":\"%s\",\"retryAfter\":60}", 
            message
        ));
    }
    
    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"error\":\"Unauthorized\",\"message\":\"%s\"}", 
            message
        ));
    }
    
    private void sendForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format(
            "{\"error\":\"Forbidden\",\"message\":\"%s\"}", 
            message
        ));
    }
}
