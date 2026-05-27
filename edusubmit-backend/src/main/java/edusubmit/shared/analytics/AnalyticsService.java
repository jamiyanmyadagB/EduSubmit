package com.edusubmit.shared.analytics;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class AnalyticsService {

    @Autowired
    private BusinessMetrics businessMetrics;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // Real-time analytics cache
    private static final String ANALYTICS_CACHE_PREFIX = "analytics:";
    private static final int CACHE_TTL_MINUTES = 5;
    
    /**
     * Record user activity for analytics
     */
    @Async
    public CompletableFuture<Void> recordUserActivity(String userId, String activity, String details) {
        String key = ANALYTICS_CACHE_PREFIX + "user_activity:" + Instant.now().truncatedTo(ChronoUnit.MINUTES).toString();
        
        Map<String, Object> activityData = new HashMap<>();
        activityData.put("userId", userId);
        activityData.put("activity", activity);
        activityData.put("details", details);
        activityData.put("timestamp", Instant.now().toString());
        
        // Store in Redis for real-time analytics
        redisTemplate.opsForList().rightPush(key, activityData.toString());
        redisTemplate.expire(key, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        
        // Update business metrics
        switch (activity) {
            case "LOGIN":
                businessMetrics.recordUserLogin();
                break;
            case "LOGOUT":
                businessMetrics.recordUserLogout();
                break;
            case "REGISTRATION":
                businessMetrics.recordUserRegistration();
                break;
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Record assignment metrics
     */
    @Async
    public CompletableFuture<Void> recordAssignmentActivity(String assignmentId, String activity, long processingTimeMs) {
        // Update business metrics
        switch (activity) {
            case "CREATED":
                businessMetrics.recordAssignmentCreated();
                break;
            case "SUBMITTED":
                businessMetrics.recordAssignmentSubmitted();
                break;
            case "GRADED":
                businessMetrics.recordAssignmentGraded(processingTimeMs);
                break;
        }
        
        // Store detailed analytics
        String key = ANALYTICS_CACHE_PREFIX + "assignment_activity:" + Instant.now().truncatedTo(ChronoUnit.MINUTES).toString();
        Map<String, Object> activityData = new HashMap<>();
        activityData.put("assignmentId", assignmentId);
        activityData.put("activity", activity);
        activityData.put("processingTime", processingTimeMs);
        activityData.put("timestamp", Instant.now().toString());
        
        redisTemplate.opsForList().rightPush(key, activityData.toString());
        redisTemplate.expire(key, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Get real-time dashboard data
     */
    public Map<String, Object> getRealTimeDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();
        
        // User metrics
        dashboardData.put("activeUsers", getMetricValue("business.users.active"));
        dashboardData.put("totalRegistrations", getMetricValue("business.users.registered"));
        dashboardData.put("loginRate", getMetricRate("business.users.login", "1m"));
        
        // Assignment metrics
        dashboardData.put("pendingAssignments", getMetricValue("business.assignments.pending"));
        dashboardData.put("submissionRate", getMetricRate("business.assignments.submitted", "1m"));
        dashboardData.put("averageGradingTime", getMetricTimer("business.assignments.grading.time"));
        
        // Course metrics
        dashboardData.put("activeCourses", getMetricValue("business.courses.active"));
        dashboardData.put("totalEnrollments", getMetricValue("business.courses.total.enrollments"));
        
        // Performance metrics
        dashboardData.put("averageResponseTime", getMetricTimer("business.api.response.time"));
        dashboardData.put("errorRate", getErrorRate());
        dashboardData.put("slowRequestRate", getMetricRate("business.api.slow.requests", "1m"));
        
        // Cache metrics
        dashboardData.put("cacheHitRate", getCacheHitRate());
        dashboardData.put("averageCacheTime", getMetricTimer("business.cache.operation.time"));
        
        // Database metrics
        dashboardData.put("databaseQueryRate", getMetricRate("business.database.queries", "1m"));
        dashboardData.put("slowQueryRate", getMetricRate("business.database.slow.queries", "1m"));
        dashboardData.put("averageQueryTime", getMetricTimer("business.database.query.time"));
        
        return dashboardData;
    }
    
    /**
     * Get hourly activity summary
     */
    public Map<String, Object> getHourlyActivitySummary() {
        Map<String, Object> summary = new HashMap<>();
        
        Instant now = Instant.now();
        for (int i = 0; i < 24; i++) {
            Instant hour = now.minus(i, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
            String key = ANALYTICS_CACHE_PREFIX + "user_activity:" + hour.toString();
            
            List<String> activities = redisTemplate.opsForList().range(key, 0, -1);
            summary.put("hour_" + i + "_activities", activities != null ? activities.size() : 0);
        }
        
        return summary;
    }
    
    /**
     * Get top performing courses
     */
    public List<Map<String, Object>> getTopPerformingCourses() {
        // This would typically query a database or analytics store
        // For now, return placeholder data
        return List.of(
            Map.of("courseId", "CS101", "submissions", 150, "averageGrade", 85.5),
            Map.of("courseId", "MATH201", "submissions", 120, "averageGrade", 82.3),
            Map.of("courseId", "ENG301", "submissions", 95, "averageGrade", 88.7)
        );
    }
    
    /**
     * Get user engagement metrics
     */
    public Map<String, Object> getUserEngagementMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Daily active users
        metrics.put("dailyActiveUsers", getDailyActiveUsers());
        
        // User retention rate
        metrics.put("retentionRate", calculateRetentionRate());
        
        // Average session duration
        metrics.put("averageSessionDuration", getAverageSessionDuration());
        
        // User activity breakdown
        metrics.put("activityBreakdown", getActivityBreakdown());
        
        return metrics;
    }
    
    /**
     * Scheduled task to update aggregate metrics
     */
    @Scheduled(fixedRate = 60000) // Every minute
    public void updateAggregateMetrics() {
        // Update active users count
        updateActiveUsersCount();
        
        // Update pending assignments count
        updatePendingAssignmentsCount();
        
        // Update cache hit rate
        updateCacheHitRate();
    }
    
    // Helper methods
    private double getMetricValue(String metricName) {
        return meterRegistry.get(metricName).gauge().value();
    }
    
    private double getMetricRate(String metricName, String rate) {
        return meterRegistry.get(metricName).counter().count();
    }
    
    private double getMetricTimer(String metricName) {
        return meterRegistry.get(metricName).timer().mean(java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    private double getErrorRate() {
        double totalRequests = getMetricRate("business.api.response.time", "1m");
        double errors = getMetricRate("business.api.errors", "1m");
        return totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    }
    
    private double getCacheHitRate() {
        double hits = getMetricRate("business.cache.hits", "1m");
        double misses = getMetricRate("business.cache.misses", "1m");
        return (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0;
    }
    
    private long getDailyActiveUsers() {
        // Implementation would query user activity logs
        return 1250; // Placeholder
    }
    
    private double calculateRetentionRate() {
        // Implementation would calculate based on user activity over time
        return 78.5; // Placeholder
    }
    
    private double getAverageSessionDuration() {
        // Implementation would calculate from session logs
        return 25.5; // Placeholder in minutes
    }
    
    private Map<String, Double> getActivityBreakdown() {
        return Map.of(
            "assignments", 45.2,
            "submissions", 32.8,
            "courses", 15.5,
            "other", 6.5
        );
    }
    
    private void updateActiveUsersCount() {
        // Implementation would count currently active users
        businessMetrics.setActiveUsers(850); // Placeholder
    }
    
    private void updatePendingAssignmentsCount() {
        // Implementation would count pending assignments
        businessMetrics.setPendingAssignments(125); // Placeholder
    }
    
    private void updateCacheHitRate() {
        // Cache hit rate is calculated in real-time, no update needed
    }
}
