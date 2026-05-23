package com.edusubmit.shared.testing;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("loadtest")
@ConfigurationProperties(prefix = "loadtest")
public class LoadTestConfig {

    private TestProfile defaultProfile = new TestProfile();
    private TestProfile stressProfile = new TestProfile();
    private TestProfile enduranceProfile = new TestProfile();
    
    // Load test execution settings
    private boolean enabled = true;
    private int warmupDuration = 30; // seconds
    private int cooldownDuration = 10; // seconds
    private String resultsDirectory = "./loadtest-results";
    
    // Monitoring settings
    private boolean enableMonitoring = true;
    private int metricsCollectionInterval = 5; // seconds
    private boolean generateHtmlReport = true;
    
    public static class TestProfile {
        private int concurrentUsers = 10;
        private int rampUpTime = 60; // seconds
        private int testDuration = 300; // seconds
        private double requestsPerSecond = 10.0;
        private String targetEndpoint = "/api/health";
        private String testType = "SMOKE"; // SMOKE, STRESS, ENDURANCE
        
        // Payload settings
        private String payloadFile = null;
        private String contentType = "application/json";
        private boolean randomPayload = false;
        
        // Think time settings
        private int minThinkTime = 1000; // milliseconds
        private int maxThinkTime = 3000; // milliseconds
        
        // Failure criteria
        private double maxErrorRate = 5.0; // percentage
        private int maxResponseTime = 5000; // milliseconds
        private double maxCpuUsage = 80.0; // percentage
        private double maxMemoryUsage = 85.0; // percentage
        
        // Getters and setters
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
        
        public String getTestType() { return testType; }
        public void setTestType(String testType) { this.testType = testType; }
        
        public String getPayloadFile() { return payloadFile; }
        public void setPayloadFile(String payloadFile) { this.payloadFile = payloadFile; }
        
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        
        public boolean isRandomPayload() { return randomPayload; }
        public void setRandomPayload(boolean randomPayload) { this.randomPayload = randomPayload; }
        
        public int getMinThinkTime() { return minThinkTime; }
        public void setMinThinkTime(int minThinkTime) { this.minThinkTime = minThinkTime; }
        
        public int getMaxThinkTime() { return maxThinkTime; }
        public void setMaxThinkTime(int maxThinkTime) { this.maxThinkTime = maxThinkTime; }
        
        public double getMaxErrorRate() { return maxErrorRate; }
        public void setMaxErrorRate(double maxErrorRate) { this.maxErrorRate = maxErrorRate; }
        
        public int getMaxResponseTime() { return maxResponseTime; }
        public void setMaxResponseTime(int maxResponseTime) { this.maxResponseTime = maxResponseTime; }
        
        public double getMaxCpuUsage() { return maxCpuUsage; }
        public void setMaxCpuUsage(double maxCpuUsage) { this.maxCpuUsage = maxCpuUsage; }
        
        public double getMaxMemoryUsage() { return maxMemoryUsage; }
        public void setMaxMemoryUsage(double maxMemoryUsage) { this.maxMemoryUsage = maxMemoryUsage; }
    }
    
    // Getters and setters
    public TestProfile getDefaultProfile() { return defaultProfile; }
    public void setDefaultProfile(TestProfile defaultProfile) { this.defaultProfile = defaultProfile; }
    
    public TestProfile getStressProfile() { return stressProfile; }
    public void setStressProfile(TestProfile stressProfile) { this.stressProfile = stressProfile; }
    
    public TestProfile getEnduranceProfile() { return enduranceProfile; }
    public void setEnduranceProfile(TestProfile enduranceProfile) { this.enduranceProfile = enduranceProfile; }
    
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    
    public int getWarmupDuration() { return warmupDuration; }
    public void setWarmupDuration(int warmupDuration) { this.warmupDuration = warmupDuration; }
    
    public int getCooldownDuration() { return cooldownDuration; }
    public void setCooldownDuration(int cooldownDuration) { this.cooldownDuration = cooldownDuration; }
    
    public String getResultsDirectory() { return resultsDirectory; }
    public void setResultsDirectory(String resultsDirectory) { this.resultsDirectory = resultsDirectory; }
    
    public boolean isEnableMonitoring() { return enableMonitoring; }
    public void setEnableMonitoring(boolean enableMonitoring) { this.enableMonitoring = enableMonitoring; }
    
    public int getMetricsCollectionInterval() { return metricsCollectionInterval; }
    public void setMetricsCollectionInterval(int metricsCollectionInterval) { this.metricsCollectionInterval = metricsCollectionInterval; }
    
    public boolean isGenerateHtmlReport() { return generateHtmlReport; }
    public void setGenerateHtmlReport(boolean generateHtmlReport) { this.generateHtmlReport = generateHtmlReport; }
}
