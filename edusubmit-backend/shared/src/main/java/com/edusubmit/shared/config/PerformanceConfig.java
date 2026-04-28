package com.edusubmit.shared.config;

import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Configuration
public class PerformanceConfig implements WebMvcConfigurer {

    @Bean
    public MeterRegistryCustomizer<?> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "edusubmit",
            "environment", "staging"
        );
    }

    @Bean
    public PerformanceInterceptor performanceInterceptor() {
        return new PerformanceInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(performanceInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/actuator/**", "/health/**");
    }

    @Bean
    public PerformanceFilter performanceFilter() {
        return new PerformanceFilter();
    }

    public static class PerformanceInterceptor implements org.springframework.web.servlet.HandlerInterceptor {
        
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            request.setAttribute("startTime", System.currentTimeMillis());
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
            Long startTime = (Long) request.getAttribute("startTime");
            if (startTime != null) {
                long duration = System.currentTimeMillis() - startTime;
                request.setAttribute("requestDuration", duration);
                
                // Log slow requests
                if (duration > 1000) {
                    System.out.println("SLOW REQUEST: " + request.getRequestURI() + " took " + duration + "ms");
                }
            }
        }
    }

    public static class PerformanceFilter extends OncePerRequestFilter {
        
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            
            long startTime = System.currentTimeMillis();
            
            // Add performance headers
            response.setHeader("X-Response-Time", String.valueOf(startTime));
            response.setHeader("X-Application-Version", "1.0.0");
            
            try {
                filterChain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                response.setHeader("X-Response-Duration", String.valueOf(duration));
                
                // Log performance metrics
                if (duration > 500) {
                    System.out.println("PERFORMANCE WARNING: " + request.getMethod() + " " + request.getRequestURI() + " took " + duration + "ms");
                }
            }
        }
    }
}
