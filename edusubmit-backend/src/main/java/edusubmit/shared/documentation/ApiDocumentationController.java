package com.edusubmit.shared.documentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/docs")
@Tag(name = "API Documentation", description = "API documentation and developer portal endpoints")
public class ApiDocumentationController {

    @Operation(
        summary = "Get API documentation",
        description = "Returns comprehensive API documentation with examples and usage guidelines",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "API documentation retrieved successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ApiDocumentationResponse.class)
                )
            )
        }
    )
    @GetMapping
    public ResponseEntity<ApiDocumentationResponse> getApiDocumentation() {
        ApiDocumentationResponse response = new ApiDocumentationResponse(
            "EduSubmit API Documentation",
            "1.0.0",
            generateApiEndpoints(),
            generateAuthenticationGuide(),
            generateCodeExamples()
        );
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Get authentication guide",
        description = "Returns detailed authentication guide with JWT and API key examples",
        responses = {
            @ApiResponse(responseCode = "200", description = "Authentication guide retrieved successfully")
        }
    )
    @GetMapping("/auth")
    public ResponseEntity<AuthenticationGuide> getAuthenticationGuide() {
        AuthenticationGuide guide = new AuthenticationGuide(
            generateJwtGuide(),
            generateApiKeyGuide(),
            generateOAuthGuide()
        );
        return ResponseEntity.ok(guide);
    }

    @Operation(
        summary = "Get code examples",
        description = "Returns code examples in multiple programming languages",
        parameters = {
            @Parameter(name = "language", description = "Programming language", example = "javascript")
        }
    )
    @GetMapping("/examples/{language}")
    public ResponseEntity<CodeExamples> getCodeExamples(
            @PathVariable String language) {
        CodeExamples examples = new CodeExamples(
            language,
            generateLanguageExamples(language)
        );
        return ResponseEntity.ok(examples);
    }

    @Operation(
        summary = "Get API usage statistics",
        description = "Returns API usage statistics and rate limiting information",
        security = @SecurityRequirement(name = "bearer-authentication")
    )
    @GetMapping("/stats")
    public ResponseEntity<ApiStats> getApiStats() {
        ApiStats stats = new ApiStats(
            "1000 requests/hour",
            "10 requests/minute for auth endpoints",
            "50 requests/minute for submissions",
            generateEndpointStats()
        );
        return ResponseEntity.ok(stats);
    }

    @Operation(
        summary = "Get SDK downloads",
        description = "Returns SDK download links and installation instructions"
    )
    @GetMapping("/sdks")
    public ResponseEntity<SdkDownloads> getSdkDownloads() {
        SdkDownloads downloads = new SdkDownloads(
            generateSdkList(),
            generateInstallationGuides()
        );
        return ResponseEntity.ok(downloads);
    }

    // Helper methods to generate documentation content
    private Map<String, Object> generateApiEndpoints() {
        return Map.of(
            "authentication", Map.of(
                "POST /api/auth/login", "User login",
                "POST /api/auth/register", "User registration",
                "POST /api/auth/refresh", "Token refresh",
                "POST /api/auth/logout", "User logout"
            ),
            "users", Map.of(
                "GET /api/users/profile", "Get user profile",
                "PUT /api/users/profile", "Update user profile",
                "GET /api/users/{id}", "Get user by ID"
            ),
            "assignments", Map.of(
                "GET /api/assignments", "List assignments",
                "POST /api/assignments", "Create assignment",
                "GET /api/assignments/{id}", "Get assignment details",
                "PUT /api/assignments/{id}", "Update assignment",
                "DELETE /api/assignments/{id}", "Delete assignment"
            ),
            "submissions", Map.of(
                "GET /api/submissions", "List submissions",
                "POST /api/submissions", "Submit assignment",
                "GET /api/submissions/{id}", "Get submission details",
                "POST /api/submissions/{id}/grade", "Grade submission"
            ),
            "analytics", Map.of(
                "GET /api/analytics/dashboard", "Get dashboard data",
                "GET /api/analytics/performance", "Get performance metrics",
                "GET /api/analytics/users/engagement", "Get user engagement"
            )
        );
    }

    private Map<String, Object> generateAuthenticationGuide() {
        return Map.of(
            "jwt", Map.of(
                "header", "Authorization: Bearer <token>",
                "example", "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "expiration", "15 minutes for access tokens, 7 days for refresh tokens"
            ),
            "api_key", Map.of(
                "header", "X-API-Key: <api_key>",
                "example", "X-API-Key: esk_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789",
                "permissions", "API keys have specific permissions based on scope"
            ),
            "oauth", Map.of(
                "flow", "Authorization Code Flow",
                "endpoints", Map.of(
                    "authorize", "/oauth/authorize",
                    "token", "/oauth/token"
                )
            )
        );
    }

    private Map<String, Object> generateCodeExamples() {
        return Map.of(
            "javascript", Map.of(
                "login", "fetch('/api/auth/login', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    email: 'user@example.com',\n    password: 'password'\n  })\n})",
                "getAssignments", "fetch('/api/assignments', {\n  headers: {\n    'Authorization': 'Bearer ' + token\n  }\n})"
            ),
            "python", Map.of(
                "login", "import requests\n\nresponse = requests.post('/api/auth/login', json={\n    'email': 'user@example.com',\n    'password': 'password'\n})",
                "getAssignments", "headers = {'Authorization': 'Bearer ' + token}\nresponse = requests.get('/api/assignments', headers=headers)"
            ),
            "java", Map.of(
                "login", "RestTemplate restTemplate = new RestTemplate();\n\nMap<String, String> request = new HashMap<>();\nrequest.put('email', 'user@example.com');\nrequest.put('password', 'password');\n\nResponseEntity<String> response = restTemplate.postForEntity('/api/auth/login', request, String.class);"
            )
        );
    }

    private Map<String, String> generateJwtGuide() {
        return Map.of(
            "description", "JWT tokens are used for authenticating API requests",
            "format", "Bearer <token>",
            "example", "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh", "Use refresh token to get new access token before expiration"
        );
    }

    private Map<String, String> generateApiKeyGuide() {
        return Map.of(
            "description", "API keys provide programmatic access to the API",
            "format", "X-API-Key: <api_key>",
            "example", "X-API-Key: esk_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789",
            "permissions", "API keys can be scoped to specific permissions"
        );
    }

    private Map<String, String> generateOAuthGuide() {
        return Map.of(
            "description", "OAuth 2.0 authorization code flow",
            "authorize_url", "/oauth/authorize",
            "token_url", "/oauth/token",
            "scopes", "read, write, admin"
        );
    }

    private Map<String, Object> generateLanguageExamples(String language) {
        return Map.of(
            "authentication", "// Authentication example for " + language,
            "api_calls", "// API call examples for " + language,
            "error_handling", "// Error handling examples for " + language
        );
    }

    private Map<String, String> generateEndpointStats() {
        return Map.of(
            "/api/auth/login", "500 requests/hour",
            "/api/assignments", "1000 requests/hour",
            "/api/submissions", "500 requests/hour",
            "/api/analytics", "200 requests/hour"
        );
    }

    private Map<String, String> generateSdkList() {
        return Map.of(
            "javascript", "https://github.com/edusubmit/js-sdk",
            "python", "https://github.com/edusubmit/python-sdk",
            "java", "https://github.com/edusubmit/java-sdk",
            "nodejs", "https://github.com/edusubmit/node-sdk"
        );
    }

    private Map<String, String> generateInstallationGuides() {
        return Map.of(
            "javascript", "npm install @edusubmit/js-sdk",
            "python", "pip install edusubmit-sdk",
            "java", "implementation 'com.edusubmit:java-sdk:1.0.0'",
            "nodejs", "npm install @edusubmit/node-sdk"
        );
    }

    // Response classes
    public static class ApiDocumentationResponse {
        private String title;
        private String version;
        private Map<String, Object> endpoints;
        private Map<String, Object> authentication;
        private Map<String, Object> codeExamples;

        public ApiDocumentationResponse(String title, String version, Map<String, Object> endpoints,
                                     Map<String, Object> authentication, Map<String, Object> codeExamples) {
            this.title = title;
            this.version = version;
            this.endpoints = endpoints;
            this.authentication = authentication;
            this.codeExamples = codeExamples;
        }

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public Map<String, Object> getEndpoints() { return endpoints; }
        public void setEndpoints(Map<String, Object> endpoints) { this.endpoints = endpoints; }
        public Map<String, Object> getAuthentication() { return authentication; }
        public void setAuthentication(Map<String, Object> authentication) { this.authentication = authentication; }
        public Map<String, Object> getCodeExamples() { return codeExamples; }
        public void setCodeExamples(Map<String, Object> codeExamples) { this.codeExamples = codeExamples; }
    }

    public static class AuthenticationGuide {
        private Map<String, String> jwt;
        private Map<String, String> apiKey;
        private Map<String, String> oauth;

        public AuthenticationGuide(Map<String, String> jwt, Map<String, String> apiKey, Map<String, String> oauth) {
            this.jwt = jwt;
            this.apiKey = apiKey;
            this.oauth = oauth;
        }

        // Getters and setters
        public Map<String, String> getJwt() { return jwt; }
        public void setJwt(Map<String, String> jwt) { this.jwt = jwt; }
        public Map<String, String> getApiKey() { return apiKey; }
        public void setApiKey(Map<String, String> apiKey) { this.apiKey = apiKey; }
        public Map<String, String> getOauth() { return oauth; }
        public void setOauth(Map<String, String> oauth) { this.oauth = oauth; }
    }

    public static class CodeExamples {
        private String language;
        private Map<String, Object> examples;

        public CodeExamples(String language, Map<String, Object> examples) {
            this.language = language;
            this.examples = examples;
        }

        // Getters and setters
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        public Map<String, Object> getExamples() { return examples; }
        public void setExamples(Map<String, Object> examples) { this.examples = examples; }
    }

    public static class ApiStats {
        private String rateLimit;
        private String authRateLimit;
        private String submissionRateLimit;
        private Map<String, String> endpointStats;

        public ApiStats(String rateLimit, String authRateLimit, String submissionRateLimit, Map<String, String> endpointStats) {
            this.rateLimit = rateLimit;
            this.authRateLimit = authRateLimit;
            this.submissionRateLimit = submissionRateLimit;
            this.endpointStats = endpointStats;
        }

        // Getters and setters
        public String getRateLimit() { return rateLimit; }
        public void setRateLimit(String rateLimit) { this.rateLimit = rateLimit; }
        public String getAuthRateLimit() { return authRateLimit; }
        public void setAuthRateLimit(String authRateLimit) { this.authRateLimit = authRateLimit; }
        public String getSubmissionRateLimit() { return submissionRateLimit; }
        public void setSubmissionRateLimit(String submissionRateLimit) { this.submissionRateLimit = submissionRateLimit; }
        public Map<String, String> getEndpointStats() { return endpointStats; }
        public void setEndpointStats(Map<String, String> endpointStats) { this.endpointStats = endpointStats; }
    }

    public static class SdkDownloads {
        private Map<String, String> sdks;
        private Map<String, String> installationGuides;

        public SdkDownloads(Map<String, String> sdks, Map<String, String> installationGuides) {
            this.sdks = sdks;
            this.installationGuides = installationGuides;
        }

        // Getters and setters
        public Map<String, String> getSdks() { return sdks; }
        public void setSdks(Map<String, String> sdks) { this.sdks = sdks; }
        public Map<String, String> getInstallationGuides() { return installationGuides; }
        public void setInstallationGuides(Map<String, String> installationGuides) { this.installationGuides = installationGuides; }
    }
}
