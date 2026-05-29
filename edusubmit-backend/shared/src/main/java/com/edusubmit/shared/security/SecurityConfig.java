package com.edusubmit.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Shared security configuration:
 * - JWT filter installed
 * - Stateless sessions
 * - Method security enabled (enables @RequireRole via custom voter)
 *
 * NOTE: We still need method-security integration; those pieces will be added next.
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = false, securedEnabled = true)
public class SecurityConfig {

    @Bean
    public JwtAuthFilter jwtAuthFilter(@Value("${JWT_SECRET:default-secret-key-change-in-production-256-bit}") String jwtSecret) {
        return new JwtAuthFilter(jwtSecret);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                // Stateless JWT
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Public endpoints
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/me").authenticated()
                        .anyRequest().authenticated()
                )

                // Install JWT auth filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // Keep default exception handling
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}

