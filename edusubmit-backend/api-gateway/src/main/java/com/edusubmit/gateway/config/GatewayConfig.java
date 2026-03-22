package com.edusubmit.gateway.config;

import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Auth Service Routes
            .route("auth-service", r -> r.path("/api/auth/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("auth-service")
                        .setFallbackUri("forward:/fallback/auth")
                    )
                )
                .uri("lb://auth-service"))

            // Assignment Service Routes
            .route("assignment-service", r -> r.path("/api/assignments/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("assignment-service")
                        .setFallbackUri("forward:/fallback/assignment")
                    )
                )
                .uri("lb://assignment-service"))

            // Submission Service Routes
            .route("submission-service", r -> r.path("/api/submissions/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("submission-service")
                        .setFallbackUri("forward:/fallback/submission")
                    )
                )
                .uri("lb://submission-service"))

            // Grading Service Routes
            .route("grading-service", r -> r.path("/api/grading/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("grading-service")
                        .setFallbackUri("forward:/fallback/grading")
                    )
                )
                .uri("lb://grading-service"))

            // Exam Schedule Service Routes
            .route("exam-schedule-service", r -> r.path("/api/exam-schedule/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("exam-schedule-service")
                        .setFallbackUri("forward:/fallback/exam-schedule")
                    )
                )
                .uri("lb://exam-schedule-service"))

            // Notification Service Routes
            .route("notification-service", r -> r.path("/api/notifications/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("notification-service")
                        .setFallbackUri("forward:/fallback/notification")
                    )
                )
                .uri("lb://notification-service"))

            // Admin Routes (can be routed to any service based on context)
            .route("admin-routes", r -> r.path("/api/admin/**")
                .filters(f -> f
                    .stripPrefix(2)
                    .circuitBreaker(config -> config
                        .setName("admin-service")
                        .setFallbackUri("forward:/fallback/admin")
                    )
                )
                .uri("lb://auth-service"))

            .build();
    }
}
