package com.edusubmit.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT authentication filter that sets Spring Security context.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(String jwtSecret) {
        this.jwtUtil = new JwtUtil(jwtSecret);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring("Bearer ".length());

        try {
            JwtClaims claims = jwtUtil.parse(token);

            // Convert role to granted authority.
            // NOTE: role is expected to be "STUDENT"/"TEACHER"/"ADMIN".
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(claims.getRole()));

            var auth = new UsernamePasswordAuthenticationToken(
                    claims.getEmail(),
                    null,
                    authorities
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception ex) {
            // Token invalid -> clear security context and continue.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}

