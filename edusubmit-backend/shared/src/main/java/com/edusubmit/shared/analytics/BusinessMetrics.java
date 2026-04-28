package com.edusubmit.shared.analytics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class BusinessMetrics {

    private final MeterRegistry meterRegistry;
    
    // User Metrics
    private final Counter userRegistrationCounter;
    private final Counter userLoginCounter;
    private final Counter userLogoutCounter;
    private final AtomicLong activeUsersGauge;
    
    // Assignment Metrics
    private final Counter assignmentCreatedCounter;
    private final Counter assignmentSubmittedCounter;
    private final Counter assignmentGradedCounter;
    private final Timer gradingTimer;
    private final AtomicLong pendingAssignmentsGauge;
    
    // Submission Metrics
    private final Counter submissionUploadCounter;
    private final Counter submissionPlagiarismCheckCounter;
    private final Timer plagiarismCheckTimer;
    private final AtomicLong totalSubmissionsGauge;
    
    // Course Metrics
    private final Counter courseCreatedCounter;
    private final Counter studentEnrollmentCounter;
    private final AtomicLong activeCoursesGauge;
    private final AtomicLong totalEnrollmentsGauge;
    
    // Performance Metrics
    private final Timer apiResponseTimer;
    private final Counter slowRequestCounter;
    private final Counter errorCounter;
    
    // Cache Metrics
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;
    private final Timer cacheOperationTimer;
    
    // Database Metrics
    private final Counter dbQueryCounter;
    private final Timer dbQueryTimer;
    private final Counter slowDbQueryCounter;
    
    public BusinessMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize User Metrics
        this.userRegistrationCounter = Counter.builder("business.users.registered")
            .description("Total number of user registrations")
            .register(meterRegistry);
            
        this.userLoginCounter = Counter.builder("business.users.login")
            .description("Total number of user logins")
            .register(meterRegistry);
            
        this.userLogoutCounter = Counter.builder("business.users.logout")
            .description("Total number of user logouts")
            .register(meterRegistry);
            
        this.activeUsersGauge = AtomicLong(0);
        Gauge.builder("business.users.active")
            .description("Number of currently active users")
            .register(meterRegistry, this, BusinessMetrics::getActiveUsers);
        
        // Initialize Assignment Metrics
        this.assignmentCreatedCounter = Counter.builder("business.assignments.created")
            .description("Total number of assignments created")
            .register(meterRegistry);
            
        this.assignmentSubmittedCounter = Counter.builder("business.assignments.submitted")
            .description("Total number of assignments submitted")
            .register(meterRegistry);
            
        this.assignmentGradedCounter = Counter.builder("business.assignments.graded")
            .description("Total number of assignments graded")
            .register(meterRegistry);
            
        this.gradingTimer = Timer.builder("business.assignments.grading.time")
            .description("Time taken to grade assignments")
            .register(meterRegistry);
            
        this.pendingAssignmentsGauge = AtomicLong(0);
        Gauge.builder("business.assignments.pending")
            .description("Number of pending assignments")
            .register(meterRegistry, this, BusinessMetrics::getPendingAssignments);
        
        // Initialize Submission Metrics
        this.submissionUploadCounter = Counter.builder("business.submissions.uploaded")
            .description("Total number of submissions uploaded")
            .register(meterRegistry);
            
        this.submissionPlagiarismCheckCounter = Counter.builder("business.submissions.plagiarism.checked")
            .description("Total number of plagiarism checks performed")
            .register(meterRegistry);
            
        this.plagiarismCheckTimer = Timer.builder("business.submissions.plagiarism.check.time")
            .description("Time taken for plagiarism checks")
            .register(meterRegistry);
            
        this.totalSubmissionsGauge = AtomicLong(0);
        Gauge.builder("business.submissions.total")
            .description("Total number of submissions")
            .register(meterRegistry, this, BusinessMetrics::getTotalSubmissions);
        
        // Initialize Course Metrics
        this.courseCreatedCounter = Counter.builder("business.courses.created")
            .description("Total number of courses created")
            .register(meterRegistry);
            
        this.studentEnrollmentCounter = Counter.builder("business.courses.enrollments")
            .description("Total number of student enrollments")
            .register(meterRegistry);
            
        this.activeCoursesGauge = AtomicLong(0);
        Gauge.builder("business.courses.active")
            .description("Number of active courses")
            .register(meterRegistry, this, BusinessMetrics::getActiveCourses);
            
        this.totalEnrollmentsGauge = AtomicLong(0);
        Gauge.builder("business.courses.total.enrollments")
            .description("Total number of enrollments")
            .register(meterRegistry, this, BusinessMetrics::getTotalEnrollments);
        
        // Initialize Performance Metrics
        this.apiResponseTimer = Timer.builder("business.api.response.time")
            .description("API response time")
            .register(meterRegistry);
            
        this.slowRequestCounter = Counter.builder("business.api.slow.requests")
            .description("Number of slow API requests")
            .register(meterRegistry);
            
        this.errorCounter = Counter.builder("business.api.errors")
            .description("Number of API errors")
            .register(meterRegistry);
        
        // Initialize Cache Metrics
        this.cacheHitCounter = Counter.builder("business.cache.hits")
            .description("Number of cache hits")
            .register(meterRegistry);
            
        this.cacheMissCounter = Counter.builder("business.cache.misses")
            .description("Number of cache misses")
            .register(meterRegistry);
            
        this.cacheOperationTimer = Timer.builder("business.cache.operation.time")
            .description("Cache operation time")
            .register(meterRegistry);
        
        // Initialize Database Metrics
        this.dbQueryCounter = Counter.builder("business.database.queries")
            .description("Number of database queries")
            .register(meterRegistry);
            
        this.dbQueryTimer = Timer.builder("business.database.query.time")
            .description("Database query time")
            .register(meterRegistry);
            
        this.slowDbQueryCounter = Counter.builder("business.database.slow.queries")
            .description("Number of slow database queries")
            .register(meterRegistry);
    }
    
    // User Metrics Methods
    public void recordUserRegistration() {
        userRegistrationCounter.increment();
        activeUsersGauge.incrementAndGet();
    }
    
    public void recordUserLogin() {
        userLoginCounter.increment();
    }
    
    public void recordUserLogout() {
        userLogoutCounter.increment();
        activeUsersGauge.decrementAndGet();
    }
    
    public void setActiveUsers(long count) {
        activeUsersGauge.set(count);
    }
    
    // Assignment Metrics Methods
    public void recordAssignmentCreated() {
        assignmentCreatedCounter.increment();
        pendingAssignmentsGauge.incrementAndGet();
    }
    
    public void recordAssignmentSubmitted() {
        assignmentSubmittedCounter.increment();
        pendingAssignmentsGauge.decrementAndGet();
    }
    
    public void recordAssignmentGraded(long gradingTimeMs) {
        assignmentGradedCounter.increment();
        gradingTimer.record(gradingTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    public void setPendingAssignments(long count) {
        pendingAssignmentsGauge.set(count);
    }
    
    // Submission Metrics Methods
    public void recordSubmissionUpload() {
        submissionUploadCounter.increment();
        totalSubmissionsGauge.incrementAndGet();
    }
    
    public void recordPlagiarismCheck(long checkTimeMs) {
        submissionPlagiarismCheckCounter.increment();
        plagiarismCheckTimer.record(checkTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    public void setTotalSubmissions(long count) {
        totalSubmissionsGauge.set(count);
    }
    
    // Course Metrics Methods
    public void recordCourseCreated() {
        courseCreatedCounter.increment();
        activeCoursesGauge.incrementAndGet();
    }
    
    public void recordStudentEnrollment() {
        studentEnrollmentCounter.increment();
        totalEnrollmentsGauge.incrementAndGet();
    }
    
    public void setActiveCourses(long count) {
        activeCoursesGauge.set(count);
    }
    
    public void setTotalEnrollments(long count) {
        totalEnrollmentsGauge.set(count);
    }
    
    // Performance Metrics Methods
    public void recordApiResponse(long responseTimeMs) {
        apiResponseTimer.record(responseTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
        if (responseTimeMs > 1000) {
            slowRequestCounter.increment();
        }
    }
    
    public void recordApiError() {
        errorCounter.increment();
    }
    
    // Cache Metrics Methods
    public void recordCacheHit() {
        cacheHitCounter.increment();
    }
    
    public void recordCacheMiss() {
        cacheMissCounter.increment();
    }
    
    public void recordCacheOperation(long operationTimeMs) {
        cacheOperationTimer.record(operationTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
    }
    
    // Database Metrics Methods
    public void recordDatabaseQuery(long queryTimeMs) {
        dbQueryCounter.increment();
        dbQueryTimer.record(queryTimeMs, java.util.concurrent.TimeUnit.MILLISECONDS);
        if (queryTimeMs > 100) {
            slowDbQueryCounter.increment();
        }
    }
    
    // Gauge getter methods
    private double getActiveUsers() {
        return activeUsersGauge.get();
    }
    
    private double getPendingAssignments() {
        return pendingAssignmentsGauge.get();
    }
    
    private double getTotalSubmissions() {
        return totalSubmissionsGauge.get();
    }
    
    private double getActiveCourses() {
        return activeCoursesGauge.get();
    }
    
    private double getTotalEnrollments() {
        return totalEnrollmentsGauge.get();
    }
}
