package com.edusubmit.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;

/**
 * Minimal JWT utility for parsing tokens.
 *
 * IMPORTANT: Token expiry must be handled during token creation (auth-service).
 * Services only verify/parse.
 */
public class JwtUtil {

    private final Key key;

    public JwtUtil(String jwtSecret) {
        // HMAC key from env secret
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public JwtClaims parse(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

        Claims claims = jws.getPayload();

        Long userId = claims.get("userId", Long.class);
        String email = claims.get("email", String.class);
        String role = claims.get("role", String.class);

        return new JwtClaims(userId, email, role);
    }
}

