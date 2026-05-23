package com.edusubmit.shared.backup;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "backup")
public class BackupConfig {
    
    private String backupDirectory = "./backups";
    private int maxBackupFiles = 10;
    private boolean enabled = true;
    private String schedule = "0 0 2 * * ?";
    private boolean enableScheduledBackups = true;
    private boolean backupLogs = true;
    private int maxBackupCount = 10;
    
    // Database configuration
    private String mysqlHost = "localhost";
    private int mysqlPort = 3306;
    private String mysqlUsername = "root";
    private String mysqlPassword = "password";
    
    // Redis configuration
    private String redisHost = "localhost";
    private int redisPort = 6379;
    private String redisPassword = "";
    
    public String getBackupDirectory() {
        return backupDirectory;
    }
    
    public void setBackupDirectory(String backupDirectory) {
        this.backupDirectory = backupDirectory;
    }
    
    public int getMaxBackupFiles() {
        return maxBackupFiles;
    }
    
    public void setMaxBackupFiles(int maxBackupFiles) {
        this.maxBackupFiles = maxBackupFiles;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public String getSchedule() {
        return schedule;
    }
    
    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }
    
    public boolean isEnableScheduledBackups() {
        return enableScheduledBackups;
    }
    
    public void setEnableScheduledBackups(boolean enableScheduledBackups) {
        this.enableScheduledBackups = enableScheduledBackups;
    }
    
    public boolean isBackupLogs() {
        return backupLogs;
    }
    
    public void setBackupLogs(boolean backupLogs) {
        this.backupLogs = backupLogs;
    }
    
    public int getMaxBackupCount() {
        return maxBackupCount;
    }
    
    public void setMaxBackupCount(int maxBackupCount) {
        this.maxBackupCount = maxBackupCount;
    }
    
    public String getMysqlHost() {
        return mysqlHost;
    }
    
    public void setMysqlHost(String mysqlHost) {
        this.mysqlHost = mysqlHost;
    }
    
    public int getMysqlPort() {
        return mysqlPort;
    }
    
    public void setMysqlPort(int mysqlPort) {
        this.mysqlPort = mysqlPort;
    }
    
    public String getMysqlUsername() {
        return mysqlUsername;
    }
    
    public void setMysqlUsername(String mysqlUsername) {
        this.mysqlUsername = mysqlUsername;
    }
    
    public String getMysqlPassword() {
        return mysqlPassword;
    }
    
    public void setMysqlPassword(String mysqlPassword) {
        this.mysqlPassword = mysqlPassword;
    }
    
    public String getRedisHost() {
        return redisHost;
    }
    
    public void setRedisHost(String redisHost) {
        this.redisHost = redisHost;
    }
    
    public int getRedisPort() {
        return redisPort;
    }
    
    public void setRedisPort(int redisPort) {
        this.redisPort = redisPort;
    }
    
    public String getRedisPassword() {
        return redisPassword;
    }
    
    public void setRedisPassword(String redisPassword) {
        this.redisPassword = redisPassword;
    }
}
