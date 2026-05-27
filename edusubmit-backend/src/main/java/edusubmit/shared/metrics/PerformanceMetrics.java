package com.edusubmit.shared.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class PerformanceMetrics {

    private final MeterRegistry meterRegistry;
    
    // Counters
    private final Counter apiRequestCounter;
    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;
    private final Counter databaseQueryCounter;
    private final Counter slowQueryCounter;
    
    // Timers
    private final Timer apiResponseTimer;
    private final Timer databaseQueryTimer;
    private final Timer cacheOperationTimer;
    
    public PerformanceMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Initialize counters
        this.apiRequestCounter = Counter.builder("api.requests.total")
            .description("Total number of API requests")
            .register(meterRegistry);
            
        this.cacheHitCounter = Counter.builder("cache.hits.total")
            .description("Total number of cache hits")
            .register(meterRegistry);
            
        this.cacheMissCounter = Counter.builder("cache.misses.total")
            .description("Total number of cache misses")
            .register(meterRegistry);
            
        this.databaseQueryCounter = Counter.builder("database.queries.total")
            .description("Total number of database queries")
            .register(meterRegistry);
            
        this.slowQueryCounter = Counter.builder("database.slow.queries.total")
            .description("Total number of slow database queries (>100ms)")
            .register(meterRegistry);
        
        // Initialize timers
        this.apiResponseTimer = Timer.builder("api.response.time")
            .description("API response time in milliseconds")
            .register(meterRegistry);
            
        this.databaseQueryTimer = Timer.builder("database.query.time")
            .description("Database query time in milliseconds")
            .register(meterRegistry);
            
        this.cacheOperationTimer = Timer.builder("cache.operation.time")
            .description("Cache operation time in milliseconds")
            .register(meterRegistry);
    }
    
    // API metrics
    public void recordApiRequest() {
        apiRequestCounter.increment();
    }
    
    public void recordApiResponseTime(long timeMs) {
        apiResponseTimer.record(timeMs, TimeUnit.MILLISECONDS);
    }
    
    // Cache metrics
    public void recordCacheHit() {
        cacheHitCounter.increment();
    }
    
    public void recordCacheMiss() {
        cacheMissCounter.increment();
    }
    
    public void recordCacheOperationTime(long timeMs) {
        cacheOperationTimer.record(timeMs, TimeUnit.MILLISECONDS);
    }
    
    // Database metrics
    public void recordDatabaseQuery() {
        databaseQueryCounter.increment();
    }
    
    public void recordDatabaseQueryTime(long timeMs) {
        databaseQueryTimer.record(timeMs, TimeUnit.MILLISECONDS);
        if (timeMs > 100) {
            slowQueryCounter.increment();
        }
    }
    
    // Performance utilities
    public <T> T measureApiResponseTime(Runnable operation) {
        long startTime = System.currentTimeMillis();
        recordApiRequest();
        
        try {
            operation.run();
        } finally {
            long endTime = System.currentTimeMillis();
            recordApiResponseTime(endTime - startTime);
        }
        
        return null;
    }
    
    public <T> T measureDatabaseQueryTime(Runnable operation) {
        long startTime = System.currentTimeMillis();
        recordDatabaseQuery();
        
        try {
            operation.run();
        } finally {
            long endTime = System.currentTimeMillis();
            recordDatabaseQueryTime(endTime - startTime);
        }
        
        return null;
    }
    
    public <T> T measureCacheOperationTime(Runnable operation) {
        long startTime = System.currentTimeMillis();
        
        try {
            operation.run();
        } finally {
            long endTime = System.currentTimeMillis();
            recordCacheOperationTime(endTime - startTime);
        }
        
        return null;
    }
}
