package com.edusubmit.auth.controller;

import com.edusubmit.auth.entity.User;
import com.edusubmit.auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final SecretKey key = Keys.hmacShaKeyFor(
        "mySuperSecretKey123456789012345678901234567890".getBytes(StandardCharsets.UTF_8)
    );

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
            
            if (userOpt.isEmpty()) {
                log.warn("User not found: {}", request.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }
            
            User user = userOpt.get();
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                log.warn("Invalid password for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }
            
            if (!"ACTIVE".equals(user.getStatus().toString())) {
                log.warn("Inactive user login attempt: {}", request.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Account is not active"));
            }
            
            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            // Generate JWT token
            String token = generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().toString()
            ));
            
            log.info("Successful login for: {}", request.getEmail());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Login failed"));
        }
    }
    
    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 86400000); // 24 hours
        
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("roles", user.getRole().toString())
            .claim("userId", user.getId())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact();
    }
    
    public static class LoginRequest {
        private String email;
        private String password;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
