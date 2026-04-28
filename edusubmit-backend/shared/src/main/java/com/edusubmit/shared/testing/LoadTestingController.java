package com.edusubmit.shared.testing;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/loadtest")
@Tag(name = "Load Testing", description = "Load testing and performance monitoring endpoints")
@SecurityRequirement(name = "bearer-authentication")
public class LoadTestingController {

    @Autowired
    private LoadTestingService loadTestingService;

    @Operation(
        summary = "Execute smoke test",
        description = "Run a quick smoke test with minimal load to verify system health",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Smoke test started successfully",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = LoadTestResponse.class)
                )
            ),
            @ApiResponse(responseCode = "403", description = "Access denied")
        }
    )
    @PostMapping("/smoke")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_TEST')")
    public CompletableFuture<ResponseEntity<LoadTestResponse>> executeSmokeTest() {
        return loadTestingService.executeSmokeTest()
            .thenApply(result -> ResponseEntity.ok(new LoadTestResponse(
                result.getTestName(),
                result.getStatus(),
                "Smoke test started with " + result.getProfile().getConcurrentUsers() + " users"
            )));
    }

    @Operation(
        summary = "Execute stress test",
        description = "Run a stress test with high load to identify system limits",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Stress test started successfully"
            )
        }
    )
    @PostMapping("/stress")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_TEST')")
    public CompletableFuture<ResponseEntity<LoadTestResponse>> executeStressTest() {
        return loadTestingService.executeStressTest()
            .thenApply(result -> ResponseEntity.ok(new LoadTestResponse(
                result.getTestName(),
                result.getStatus(),
                "Stress test started with " + result.getProfile().getConcurrentUsers() + " users"
            )));
    }

    @Operation(
        summary = "Execute endurance test",
        description = "Run an endurance test with sustained load over extended period",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Endurance test started successfully"
            )
        }
    )
    @PostMapping("/endurance")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_TEST')")
    public CompletableFuture<ResponseEntity<LoadTestResponse>> executeEnduranceTest() {
        return loadTestingService.executeEnduranceTest()
            .thenApply(result -> ResponseEntity.ok(new LoadTestResponse(
                result.getTestName(),
                result.getStatus(),
                "Endurance test started with " + result.getProfile().getConcurrentUsers() + " users"
            )));
    }

    @Operation(
        summary = "Execute custom load test",
        description = "Run a custom load test with specified parameters",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Custom load test configuration",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CustomTestRequest.class)
            )
        )
    )
    @PostMapping("/custom")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_TEST')")
    public CompletableFuture<ResponseEntity<LoadTestResponse>> executeCustomTest(
            @RequestBody CustomTestRequest request) {
        
        LoadTestConfig.TestProfile profile = new LoadTestConfig.TestProfile();
        profile.setConcurrentUsers(request.getConcurrentUsers());
        profile.setRampUpTime(request.getRampUpTime());
        profile.setTestDuration(request.getTestDuration());
        profile.setRequestsPerSecond(request.getRequestsPerSecond());
        profile.setTargetEndpoint(request.getTargetEndpoint());
        profile.setMaxErrorRate(request.getMaxErrorRate());
        profile.setMaxResponseTime(request.getMaxResponseTime());
        
        return loadTestingService.executeCustomTest(request.getTestName(), profile)
            .thenApply(result -> ResponseEntity.ok(new LoadTestResponse(
                result.getTestName(),
                result.getStatus(),
                "Custom test started with " + result.getProfile().getConcurrentUsers() + " users"
            )));
    }

    @Operation(
        summary = "Get test result",
        description = "Get detailed results of a specific load test",
        parameters = {
            @Parameter(name = "testName", description = "Name of the test", required = true)
        }
    )
    @GetMapping("/results/{testName}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<LoadTestingService.LoadTestResult> getTestResult(
            @PathVariable String testName) {
        
        LoadTestingService.LoadTestResult result = loadTestingService.getTestResult(testName);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(result);
    }

    @Operation(
        summary = "Get all test results",
        description = "Get results of all executed load tests"
    )
    @GetMapping("/results")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<Map<String, LoadTestingService.LoadTestResult>> getAllTestResults() {
        Map<String, LoadTestingService.LoadTestResult> results = loadTestingService.getAllTestResults();
        return ResponseEntity.ok(results);
    }

    @Operation(
        summary = "Cancel running test",
        description = "Cancel a currently running load test",
        parameters = {
            @Parameter(name = "testName", description = "Name of the test to cancel", required = true)
        }
    )
    @DeleteMapping("/cancel/{testName}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_TEST')")
    public ResponseEntity<String> cancelTest(@PathVariable String testName) {
        boolean cancelled = loadTestingService.cancelTest(testName);
        if (cancelled) {
            return ResponseEntity.ok("Test '" + testName + "' cancelled successfully");
        } else {
            return ResponseEntity.badRequest().body("Test '" + testName + "' not found or not running");
        }
    }

    @Operation(
        summary = "Get performance baseline",
        description = "Get current performance baseline metrics"
    )
    @GetMapping("/baseline")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERFORMANCE_READ')")
    public ResponseEntity<PerformanceBaseline> getPerformanceBaseline() {
        PerformanceBaseline baseline = new PerformanceBaseline(
            "Current baseline",
            100, // requests per minute
            250, // average response time in ms
            99.9, // success rate percentage
            45.0, // CPU usage percentage
            60.0  // memory usage percentage
        );
        
        return ResponseEntity.ok(baseline);
    }

    // Response classes
    public static class LoadTestResponse {
        private String testName;
        private String status;
        private String message;

        public LoadTestResponse(String testName, String status, String message) {
            this.testName = testName;
            this.status = status;
            this.message = message;
        }

        // Getters and setters
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class CustomTestRequest {
        private String testName;
        private int concurrentUsers;
        private int rampUpTime;
        private int testDuration;
        private double requestsPerSecond;
        private String targetEndpoint;
        private double maxErrorRate;
        private int maxResponseTime;

        // Getters and setters
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public int getConcurrentUsers() { return concurrentUsers; }
        public void setConcurrentUsers(int concurrentUsers) { this.concurrentUsers = concurrentUsers; }
        public int getRampUpTime() { return rampUpTime; }
        public void setRampUpTime(int rampUpTime) { this.rampUpTime = rampUpTime; }
        public int getTestDuration() { return testDuration; }
        public void setTestDuration(int testDuration) { this.testDuration = testDuration; }
        public double getRequestsPerSecond() { return requestsPerSecond; }
        public void setRequestsPerSecond(double requestsPerSecond) { this.requestsPerSecond = requestsPerSecond; }
        public String getTargetEndpoint() { return targetEndpoint; }
        public void setTargetEndpoint(String targetEndpoint) { this.targetEndpoint = targetEndpoint; }
        public double getMaxErrorRate() { return maxErrorRate; }
        public void setMaxErrorRate(double maxErrorRate) { this.maxErrorRate = maxErrorRate; }
        public int getMaxResponseTime() { return maxResponseTime; }
        public void setMaxResponseTime(int maxResponseTime) { this.maxResponseTime = maxResponseTime; }
    }

    public static class PerformanceBaseline {
        private String name;
        private double requestsPerMinute;
        private long averageResponseTime;
        private double successRate;
        private double cpuUsage;
        private double memoryUsage;

        public PerformanceBaseline(String name, double requestsPerMinute, long averageResponseTime,
                                 double successRate, double cpuUsage, double memoryUsage) {
            this.name = name;
            this.requestsPerMinute = requestsPerMinute;
            this.averageResponseTime = averageResponseTime;
            this.successRate = successRate;
            this.cpuUsage = cpuUsage;
            this.memoryUsage = memoryUsage;
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getRequestsPerMinute() { return requestsPerMinute; }
        public void setRequestsPerMinute(double requestsPerMinute) { this.requestsPerMinute = requestsPerMinute; }
        public long getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(long averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
        public double getCpuUsage() { return cpuUsage; }
        public void setCpuUsage(double cpuUsage) { this.cpuUsage = cpuUsage; }
        public double getMemoryUsage() { return memoryUsage; }
        public void setMemoryUsage(double memoryUsage) { this.memoryUsage = memoryUsage; }
    }
}
