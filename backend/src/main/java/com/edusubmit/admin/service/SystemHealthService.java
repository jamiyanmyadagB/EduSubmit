package com.edusubmit.admin.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.time.Duration;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemHealthService {

    private Instant startTime = Instant.now();

    public SystemHealthMetrics getSystemHealth() {
        log.info("Fetching system health metrics");
        
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

        SystemHealthMetrics metrics = SystemHealthMetrics.builder()
            .uptime(calculateUptime())
            .totalMemory(memoryBean.getHeapMemoryUsage().getMax() / (1024 * 1024))
            .usedMemory(memoryBean.getHeapMemoryUsage().getUsed() / (1024 * 1024))
            .freeMemory(memoryBean.getHeapMemoryUsage().getFree() / (1024 * 1024))
            .availableProcessors(osBean.getAvailableProcessors())
            .systemLoadAverage(osBean.getSystemLoadAverage())
            .apiStatus(checkApiStatus())
            .databaseStatus(checkDatabaseStatus())
            .redisStatus(checkRedisStatus())
            .storageUsage(calculateStorageUsage())
            .build();

        return metrics;
    }

    private double calculateUptime() {
        Duration uptime = Duration.between(startTime, Instant.now());
        return uptime.toMinutes();
    }

    private String checkApiStatus() {
        // In a real implementation, this would check actual API health
        return "healthy";
    }

    private String checkDatabaseStatus() {
        // In a real implementation, this would check actual database health
        return "healthy";
    }

    private String checkRedisStatus() {
        // In a real implementation, this would check actual Redis health
        return "healthy";
    }

    private StorageUsage calculateStorageUsage() {
        // In a real implementation, this would check actual storage usage
        return StorageUsage.builder()
            .used(450L)
            .total(1000L)
            .percentage(45.0)
            .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class SystemHealthMetrics {
        private double uptime;
        private long totalMemory;
        private long usedMemory;
        private long freeMemory;
        private int availableProcessors;
        private double systemLoadAverage;
        private String apiStatus;
        private String databaseStatus;
        private String redisStatus;
        private StorageUsage storageUsage;
    }

    @lombok.Data
    @lombok.Builder
    public static class StorageUsage {
        private long used;
        private long total;
        private double percentage;
    }
}
