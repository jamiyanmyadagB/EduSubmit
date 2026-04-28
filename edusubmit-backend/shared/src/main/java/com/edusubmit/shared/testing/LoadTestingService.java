package com.edusubmit.shared.testing;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class LoadTestingService {

    @Autowired
    private LoadTestConfig loadTestConfig;
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    private final RestTemplate restTemplate;
    private final ExecutorService executorService;
    private final Map<String, LoadTestResult> testResults = new ConcurrentHashMap<>();
    
    public LoadTestingService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder.build();
        this.executorService = Executors.newFixedThreadPool(100);
    }

    /**
     * Execute smoke test
     */
    @Async
    public CompletableFuture<LoadTestResult> executeSmokeTest() {
        LoadTestConfig.TestProfile profile = loadTestConfig.getDefaultProfile();
        profile.setTestType("SMOKE");
        profile.setConcurrentUsers(5);
        profile.setRampUpTime(10);
        profile.setTestDuration(60);
        profile.setRequestsPerSecond(2.0);
        
        return executeLoadTest("smoke-test", profile);
    }

    /**
     * Execute stress test
     */
    @Async
    public CompletableFuture<LoadTestResult> executeStressTest() {
        LoadTestConfig.TestProfile profile = loadTestConfig.getStressProfile();
        profile.setTestType("STRESS");
        profile.setConcurrentUsers(50);
        profile.setRampUpTime(30);
        profile.setTestDuration(300);
        profile.setRequestsPerSecond(20.0);
        profile.setMaxErrorRate(10.0);
        
        return executeLoadTest("stress-test", profile);
    }

    /**
     * Execute endurance test
     */
    @Async
    public CompletableFuture<LoadTestResult> executeEnduranceTest() {
        LoadTestConfig.TestProfile profile = loadTestConfig.getEnduranceProfile();
        profile.setTestType("ENDURANCE");
        profile.setConcurrentUsers(20);
        profile.setRampUpTime(60);
        profile.setTestDuration(3600); // 1 hour
        profile.setRequestsPerSecond(5.0);
        profile.setMaxErrorRate(2.0);
        
        return executeLoadTest("endurance-test", profile);
    }

    /**
     * Execute custom load test
     */
    @Async
    public CompletableFuture<LoadTestResult> executeCustomTest(String testName, LoadTestConfig.TestProfile profile) {
        return executeLoadTest(testName, profile);
    }

    /**
     * Main load test execution method
     */
    private CompletableFuture<LoadTestResult> executeLoadTest(String testName, LoadTestConfig.TestProfile profile) {
        LoadTestResult result = new LoadTestResult(testName, profile);
        testResults.put(testName, result);
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Warmup phase
                if (loadTestConfig.getWarmupDuration() > 0) {
                    executeWarmupPhase(result, profile);
                }
                
                // Main test phase
                executeMainTestPhase(result, profile);
                
                // Cooldown phase
                if (loadTestConfig.getCooldownDuration() > 0) {
                    executeCooldownPhase(result, profile);
                }
                
                result.setStatus("COMPLETED");
                result.setEndTime(Instant.now());
                
                // Generate report
                if (loadTestConfig.isGenerateHtmlReport()) {
                    generateHtmlReport(result);
                }
                
                return result;
                
            } catch (Exception e) {
                result.setStatus("FAILED");
                result.setEndTime(Instant.now());
                result.setErrorMessage(e.getMessage());
                return result;
            }
        }, executorService);
    }

    private void executeWarmupPhase(LoadTestResult result, LoadTestConfig.TestProfile profile) {
        result.setStatus("WARMUP");
        result.setStartTime(Instant.now());
        
        int warmupUsers = Math.min(2, profile.getConcurrentUsers());
        int warmupDuration = loadTestConfig.getWarmupDuration();
        
        executeTestPhase(result, warmupUsers, warmupDuration, profile, "WARMUP");
    }

    private void executeMainTestPhase(LoadTestResult result, LoadTestConfig.TestProfile profile) {
        result.setStatus("RUNNING");
        
        executeTestPhase(result, profile.getConcurrentUsers(), profile.getTestDuration(), profile, "MAIN");
    }

    private void executeCooldownPhase(LoadTestResult result, LoadTestConfig.TestProfile profile) {
        result.setStatus("COOLDOWN");
        
        int cooldownUsers = Math.min(2, profile.getConcurrentUsers());
        int cooldownDuration = loadTestConfig.getCooldownDuration();
        
        executeTestPhase(result, cooldownUsers, cooldownDuration, profile, "COOLDOWN");
    }

    private void executeTestPhase(LoadTestResult result, int users, int duration, 
                                 LoadTestConfig.TestProfile profile, String phase) {
        
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        AtomicInteger activeUsers = new AtomicInteger(0);
        
        // Ramp up users gradually
        int rampUpInterval = duration / users;
        
        for (int i = 0; i < users; i++) {
            final int userId = i;
            
            CompletableFuture<Void> userFuture = CompletableFuture.runAsync(() -> {
                try {
                    // Wait for ramp up
                    Thread.sleep(userId * rampUpInterval * 1000L);
                    
                    activeUsers.incrementAndGet();
                    
                    // Execute requests for duration
                    long endTime = System.currentTimeMillis() + (duration * 1000L);
                    
                    while (System.currentTimeMillis() < endTime) {
                        executeRequest(result, profile, userId, phase);
                        
                        // Think time between requests
                        int thinkTime = profile.getMinThinkTime() + 
                            (int) (Math.random() * (profile.getMaxThinkTime() - profile.getMinThinkTime()));
                        Thread.sleep(thinkTime);
                    }
                    
                    activeUsers.decrementAndGet();
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, executorService);
            
            futures.add(userFuture);
        }
        
        // Wait for all users to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }

    private void executeRequest(LoadTestResult result, LoadTestConfig.TestProfile profile, 
                              int userId, String phase) {
        
        String url = "http://localhost:8080" + profile.getTargetEndpoint();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Add authentication if needed
        if (profile.getTargetEndpoint().startsWith("/api/")) {
            headers.set("Authorization", "Bearer test-token-" + userId);
        }
        
        HttpEntity<String> entity = new HttpEntity<>(generatePayload(profile), headers);
        
        long startTime = System.currentTimeMillis();
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            
            result.recordRequest(responseTime, response.getStatusCode().value(), phase);
            
            // Check failure criteria
            checkFailureCriteria(result, profile, responseTime);
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            
            result.recordRequest(responseTime, 500, phase); // Internal server error
            result.incrementErrors();
        }
    }

    private String generatePayload(LoadTestConfig.TestProfile profile) {
        if (profile.isRandomPayload()) {
            return "{\"testData\":\"" + UUID.randomUUID().toString() + "\",\"timestamp\":" + 
                   System.currentTimeMillis() + "}";
        }
        return "{}";
    }

    private void checkFailureCriteria(LoadTestResult result, LoadTestConfig.TestProfile profile, long responseTime) {
        // Check response time
        if (responseTime > profile.getMaxResponseTime()) {
            result.incrementSlowResponses();
        }
        
        // Check error rate
        double currentErrorRate = result.getErrorRate();
        if (currentErrorRate > profile.getMaxErrorRate()) {
            result.setFailed(true);
            result.setErrorMessage("Error rate exceeded threshold: " + currentErrorRate + "%");
        }
        
        // Check system metrics
        if (loadTestConfig.isEnableMonitoring()) {
            double cpuUsage = getCpuUsage();
            double memoryUsage = getMemoryUsage();
            
            if (cpuUsage > profile.getMaxCpuUsage()) {
                result.setFailed(true);
                result.setErrorMessage("CPU usage exceeded threshold: " + cpuUsage + "%");
            }
            
            if (memoryUsage > profile.getMaxMemoryUsage()) {
                result.setFailed(true);
                result.setErrorMessage("Memory usage exceeded threshold: " + memoryUsage + "%");
            }
        }
    }

    private double getCpuUsage() {
        // Get CPU usage from system metrics
        return meterRegistry.get("system.cpu.usage").gauge().value() * 100;
    }

    private double getMemoryUsage() {
        // Get memory usage from system metrics
        return meterRegistry.get("jvm.memory.used").gauge().value() / 
               meterRegistry.get("jvm.memory.max").gauge().value() * 100;
    }

    private void generateHtmlReport(LoadTestResult result) {
        // Generate HTML report (implementation would create a detailed report)
        String reportPath = loadTestConfig.getResultsDirectory() + "/" + result.getTestName() + "-report.html";
        // Implementation would write HTML report to file
    }

    /**
     * Get test result
     */
    public LoadTestResult getTestResult(String testName) {
        return testResults.get(testName);
    }

    /**
     * Get all test results
     */
    public Map<String, LoadTestResult> getAllTestResults() {
        return new HashMap<>(testResults);
    }

    /**
     * Cancel running test
     */
    public boolean cancelTest(String testName) {
        LoadTestResult result = testResults.get(testName);
        if (result != null && "RUNNING".equals(result.getStatus())) {
            result.setStatus("CANCELLED");
            result.setEndTime(Instant.now());
            return true;
        }
        return false;
    }

    /**
     * Load test result class
     */
    public static class LoadTestResult {
        private final String testName;
        private final LoadTestConfig.TestProfile profile;
        private final Instant startTime;
        private Instant endTime;
        private String status;
        private String errorMessage;
        private boolean failed;
        
        // Metrics
        private final AtomicLong totalRequests = new AtomicLong(0);
        private final AtomicLong successfulRequests = new AtomicLong(0);
        private final AtomicLong failedRequests = new AtomicLong(0);
        private final AtomicLong slowResponses = new AtomicLong(0);
        private final List<Long> responseTimes = new CopyOnWriteArrayList<>();
        
        // Phase-specific metrics
        private final Map<String, PhaseMetrics> phaseMetrics = new ConcurrentHashMap<>();

        public LoadTestResult(String testName, LoadTestConfig.TestProfile profile) {
            this.testName = testName;
            this.profile = profile;
            this.startTime = Instant.now();
            this.status = "PENDING";
            this.failed = false;
        }

        public void recordRequest(long responseTime, int statusCode, String phase) {
            totalRequests.incrementAndGet();
            responseTimes.add(responseTime);
            
            if (statusCode >= 200 && statusCode < 400) {
                successfulRequests.incrementAndGet();
            } else {
                failedRequests.incrementAndGet();
            }
            
            // Record phase-specific metrics
            phaseMetrics.computeIfAbsent(phase, k -> new PhaseMetrics())
                      .recordRequest(responseTime, statusCode);
        }

        public void incrementErrors() {
            failedRequests.incrementAndGet();
        }

        public void incrementSlowResponses() {
            slowResponses.incrementAndGet();
        }

        // Getters
        public String getTestName() { return testName; }
        public LoadTestConfig.TestProfile getProfile() { return profile; }
        public Instant getStartTime() { return startTime; }
        public Instant getEndTime() { return endTime; }
        public void setEndTime(Instant endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public boolean isFailed() { return failed; }
        public void setFailed(boolean failed) { this.failed = failed; }

        // Metrics getters
        public long getTotalRequests() { return totalRequests.get(); }
        public long getSuccessfulRequests() { return successfulRequests.get(); }
        public long getFailedRequests() { return failedRequests.get(); }
        public long getSlowResponses() { return slowResponses.get(); }
        public double getErrorRate() {
            long total = totalRequests.get();
            return total > 0 ? (failedRequests.get() * 100.0 / total) : 0;
        }
        public double getAverageResponseTime() {
            return responseTimes.isEmpty() ? 0 : 
                   responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
        }
        public long getMinResponseTime() {
            return responseTimes.isEmpty() ? 0 : 
                   responseTimes.stream().mapToLong(Long::longValue).min().orElse(0);
        }
        public long getMaxResponseTime() {
            return responseTimes.isEmpty() ? 0 : 
                   responseTimes.stream().mapToLong(Long::longValue).max().orElse(0);
        }
        public double getRequestsPerSecond() {
            if (endTime == null) return 0;
            long duration = ChronoUnit.SECONDS.between(startTime, endTime);
            return duration > 0 ? (totalRequests.get() * 1.0 / duration) : 0;
        }

        public Map<String, PhaseMetrics> getPhaseMetrics() { return phaseMetrics; }

        public static class PhaseMetrics {
            private final AtomicLong requests = new AtomicLong(0);
            private final AtomicLong successful = new AtomicLong(0);
            private final AtomicLong failed = new AtomicLong(0);
            private final List<Long> responseTimes = new CopyOnWriteArrayList<>();

            public void recordRequest(long responseTime, int statusCode) {
                requests.incrementAndGet();
                responseTimes.add(responseTime);
                
                if (statusCode >= 200 && statusCode < 400) {
                    successful.incrementAndGet();
                } else {
                    failed.incrementAndGet();
                }
            }

            public long getRequests() { return requests.get(); }
            public long getSuccessful() { return successful.get(); }
            public long getFailed() { return failed.get(); }
            public double getAverageResponseTime() {
                return responseTimes.isEmpty() ? 0 : 
                       responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
            }
        }
    }
}
