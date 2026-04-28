package com.edusubmit.shared.analytics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;
    
    @Autowired
    private BusinessMetrics businessMetrics;

    /**
     * Get real-time dashboard data
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ANALYTICS_READ')")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> dashboardData = analyticsService.getRealTimeDashboardData();
        return ResponseEntity.ok(dashboardData);
    }

    /**
     * Get hourly activity summary
     */
    @GetMapping("/activity/hourly")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ANALYTICS_READ')")
    public ResponseEntity<Map<String, Object>> getHourlyActivitySummary() {
        Map<String, Object> summary = analyticsService.getHourlyActivitySummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * Get top performing courses
     */
    @GetMapping("/courses/top-performing")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ANALYTICS_READ')")
    public ResponseEntity<List<Map<String, Object>>> getTopPerformingCourses() {
        List<Map<String, Object>> courses = analyticsService.getTopPerformingCourses();
        return ResponseEntity.ok(courses);
    }

    /**
     * Get user engagement metrics
     */
    @GetMapping("/users/engagement")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ANALYTICS_READ')")
    public ResponseEntity<Map<String, Object>> getUserEngagementMetrics() {
        Map<String, Object> metrics = analyticsService.getUserEngagementMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Record user activity (async)
     */
    @PostMapping("/activity/user")
    @PreAuthorize("hasRole('USER')")
    public CompletableFuture<ResponseEntity<String>> recordUserActivity(
            @RequestBody Map<String, String> activityData) {
        
        String userId = activityData.get("userId");
        String activity = activityData.get("activity");
        String details = activityData.get("details");
        
        return analyticsService.recordUserActivity(userId, activity, details)
            .thenApply(v -> ResponseEntity.ok("Activity recorded successfully"));
    }

    /**
     * Record assignment activity (async)
     */
    @PostMapping("/activity/assignment")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public CompletableFuture<ResponseEntity<String>> recordAssignmentActivity(
            @RequestBody Map<String, Object> activityData) {
        
        String assignmentId = (String) activityData.get("assignmentId");
        String activity = (String) activityData.get("activity");
        Long processingTime = activityData.get("processingTime") != null ? 
            ((Number) activityData.get("processingTime")).longValue() : 0L;
        
        return analyticsService.recordAssignmentActivity(assignmentId, activity, processingTime)
            .thenApply(v -> ResponseEntity.ok("Assignment activity recorded successfully"));
    }

    /**
     * Get system health metrics
     */
    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SYSTEM_READ')")
    public ResponseEntity<Map<String, Object>> getSystemHealthMetrics() {
        Map<String, Object> healthMetrics = Map.of(
            "activeUsers", businessMetrics.getActiveUsers(),
            "pendingAssignments", businessMetrics.getPendingAssignments(),
            "totalSubmissions", businessMetrics.getTotalSubmissions(),
            "activeCourses", businessMetrics.getActiveCourses(),
            "totalEnrollments", businessMetrics.getTotalEnrollments(),
            "cacheHitRate", calculateCacheHitRate(),
            "errorRate", calculateErrorRate(),
            "averageResponseTime", calculateAverageResponseTime()
        );
        
        return ResponseEntity.ok(healthMetrics);
    }

    /**
     * Get performance metrics
     */
    @GetMapping("/performance")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        Map<String, Object> performanceMetrics = Map.of(
            "apiResponseTime", Map.of(
                "mean", calculateAverageResponseTime(),
                "p95", calculatePercentileResponseTime(95),
                "p99", calculatePercentileResponseTime(99)
            ),
            "databasePerformance", Map.of(
                "queryRate", calculateDatabaseQueryRate(),
                "slowQueryRate", calculateSlowQueryRate(),
                "averageQueryTime", calculateAverageQueryTime()
            ),
            "cachePerformance", Map.of(
                "hitRate", calculateCacheHitRate(),
                "averageOperationTime", calculateAverageCacheTime()
            ),
            "errorMetrics", Map.of(
                "errorRate", calculateErrorRate(),
                "totalErrors", businessMetrics.getErrorCounter().count()
            )
        );
        
        return ResponseEntity.ok(performanceMetrics);
    }

    /**
     * Get business metrics summary
     */
    @GetMapping("/business/summary")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('BUSINESS_READ')")
    public ResponseEntity<Map<String, Object>> getBusinessMetricsSummary() {
        Map<String, Object> businessSummary = Map.of(
            "userMetrics", Map.of(
                "totalRegistrations", businessMetrics.getUserRegistrationCounter().count(),
                "totalLogins", businessMetrics.getUserLoginCounter().count(),
                "activeUsers", businessMetrics.getActiveUsers()
            ),
            "assignmentMetrics", Map.of(
                "totalCreated", businessMetrics.getAssignmentCreatedCounter().count(),
                "totalSubmitted", businessMetrics.getAssignmentSubmittedCounter().count(),
                "totalGraded", businessMetrics.getAssignmentGradedCounter().count(),
                "pending", businessMetrics.getPendingAssignments(),
                "averageGradingTime", businessMetrics.getGradingTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS)
            ),
            "submissionMetrics", Map.of(
                "totalUploaded", businessMetrics.getSubmissionUploadCounter().count(),
                "plagiarismChecks", businessMetrics.getSubmissionPlagiarismCheckCounter().count(),
                "totalSubmissions", businessMetrics.getTotalSubmissions(),
                "averagePlagiarismTime", businessMetrics.getPlagiarismCheckTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS)
            ),
            "courseMetrics", Map.of(
                "totalCreated", businessMetrics.getCourseCreatedCounter().count(),
                "totalEnrollments", businessMetrics.getTotalEnrollments(),
                "activeCourses", businessMetrics.getActiveCourses()
            )
        );
        
        return ResponseEntity.ok(businessSummary);
    }

    // Helper methods for calculations
    private double calculateCacheHitRate() {
        double hits = businessMetrics.getCacheHitCounter().count();
        double misses = businessMetrics.getCacheMissCounter().count();
        return (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;
    }

    private double calculateErrorRate() {
        double totalRequests = businessMetrics.getApiResponseTimer().count();
        double errors = businessMetrics.getErrorCounter().count();
        return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    }

    private double calculateAverageResponseTime() {
        return businessMetrics.getApiResponseTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    private double calculatePercentileResponseTime(double percentile) {
        // This would typically use the actual percentile from the timer
        // For now, return the mean as a placeholder
        return businessMetrics.getApiResponseTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    private double calculateDatabaseQueryRate() {
        return businessMetrics.getDbQueryCounter().count() / 60.0; // queries per minute
    }

    private double calculateSlowQueryRate() {
        return businessMetrics.getSlowDbQueryCounter().count() / 60.0; // slow queries per minute
    }

    private double calculateAverageQueryTime() {
        return businessMetrics.getDbQueryTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    private double calculateAverageCacheTime() {
        return businessMetrics.getCacheOperationTimer().mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }
}
