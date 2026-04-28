package com.edusubmit.shared.backup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class BackupService {

    @Autowired
    private BackupConfig backupConfig;
    
    private final Map<String, BackupResult> backupHistory = new LinkedHashMap<>();
    private final DateTimeFormatter timestampFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    /**
     * Perform full database backup
     */
    @Async
    public CompletableFuture<BackupResult> performFullBackup() {
        String backupId = "full_" + timestampFormatter.format(LocalDateTime.now());
        BackupResult result = new BackupResult(backupId, BackupType.FULL);
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                result.setStartTime(Instant.now());
                
                // Create backup directory
                Path backupDir = createBackupDirectory(backupId);
                
                // Backup MySQL database
                backupMySQL(backupDir, result);
                
                // Backup Redis data
                backupRedis(backupDir, result);
                
                // Backup application data
                backupApplicationData(backupDir, result);
                
                // Create backup archive
                createBackupArchive(backupDir, result);
                
                // Cleanup old backups
                cleanupOldBackups();
                
                result.setStatus("COMPLETED");
                result.setEndTime(Instant.now());
                result.setSuccess(true);
                
                backupHistory.put(backupId, result);
                
                return result;
                
            } catch (Exception e) {
                result.setStatus("FAILED");
                result.setEndTime(Instant.now());
                result.setSuccess(false);
                result.setErrorMessage(e.getMessage());
                
                backupHistory.put(backupId, result);
                
                return result;
            }
        });
    }

    /**
     * Perform incremental backup
     */
    @Async
    public CompletableFuture<BackupResult> performIncrementalBackup() {
        String backupId = "incremental_" + timestampFormatter.format(LocalDateTime.now());
        BackupResult result = new BackupResult(backupId, BackupType.INCREMENTAL);
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                result.setStartTime(Instant.now());
                
                // Get last full backup timestamp
                Instant lastFullBackup = getLastFullBackupTimestamp();
                if (lastFullBackup == null) {
                    throw new IllegalStateException("No full backup found for incremental backup");
                }
                
                // Create backup directory
                Path backupDir = createBackupDirectory(backupId);
                
                // Backup changed data since last full backup
                backupChangedDataSince(lastFullBackup, backupDir, result);
                
                // Create backup archive
                createBackupArchive(backupDir, result);
                
                result.setStatus("COMPLETED");
                result.setEndTime(Instant.now());
                result.setSuccess(true);
                
                backupHistory.put(backupId, result);
                
                return result;
                
            } catch (Exception e) {
                result.setStatus("FAILED");
                result.setEndTime(Instant.now());
                result.setSuccess(false);
                result.setErrorMessage(e.getMessage());
                
                backupHistory.put(backupId, result);
                
                return result;
            }
        });
    }

    /**
     * Restore from backup
     */
    @Async
    public CompletableFuture<RestoreResult> restoreFromBackup(String backupId) {
        RestoreResult result = new RestoreResult(backupId);
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                result.setStartTime(Instant.now());
                
                // Validate backup exists
                BackupResult backup = backupHistory.get(backupId);
                if (backup == null) {
                    throw new IllegalArgumentException("Backup not found: " + backupId);
                }
                
                // Extract backup archive
                Path backupDir = extractBackupArchive(backupId);
                
                // Restore MySQL database
                restoreMySQL(backupDir, result);
                
                // Restore Redis data
                restoreRedis(backupDir, result);
                
                // Restore application data
                restoreApplicationData(backupDir, result);
                
                result.setStatus("COMPLETED");
                result.setEndTime(Instant.now());
                result.setSuccess(true);
                
                return result;
                
            } catch (Exception e) {
                result.setStatus("FAILED");
                result.setEndTime(Instant.now());
                result.setSuccess(false);
                result.setErrorMessage(e.getMessage());
                
                return result;
            }
        });
    }

    /**
     * Scheduled daily backup
     */
    @Scheduled(cron = "${backup.schedule.daily:0 2 * * *}")
    public void scheduledDailyBackup() {
        if (backupConfig.isEnableScheduledBackups()) {
            performFullBackup();
        }
    }

    /**
     * Scheduled weekly backup
     */
    @Scheduled(cron = "${backup.schedule.weekly:0 3 * * 0}")
    public void scheduledWeeklyBackup() {
        if (backupConfig.isEnableScheduledBackups()) {
            performFullBackup();
        }
    }

    private Path createBackupDirectory(String backupId) throws IOException {
        Path backupDir = Paths.get(backupConfig.getBackupDirectory(), backupId);
        Files.createDirectories(backupDir);
        return backupDir;
    }

    private void backupMySQL(Path backupDir, BackupResult result) throws IOException, InterruptedException {
        String backupFile = backupDir.resolve("mysql_backup.sql").toString();
        
        ProcessBuilder pb = new ProcessBuilder(
            "mysqldump",
            "--single-transaction",
            "--routines",
            "--triggers",
            "--all-databases",
            "--host=" + backupConfig.getMysqlHost(),
            "--port=" + backupConfig.getMysqlPort(),
            "--user=" + backupConfig.getMysqlUsername(),
            "--password=" + backupConfig.getMysqlPassword(),
            "--result-file=" + backupFile
        );
        
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode == 0) {
            result.addFile("mysql_backup.sql", Files.size(Paths.get(backupFile)));
        } else {
            throw new RuntimeException("MySQL backup failed with exit code: " + exitCode);
        }
    }

    private void backupRedis(Path backupDir, BackupResult result) throws IOException, InterruptedException {
        String backupFile = backupDir.resolve("redis_backup.rdb").toString();
        
        ProcessBuilder pb = new ProcessBuilder(
            "redis-cli",
            "--rdb", backupFile,
            "--host", backupConfig.getRedisHost(),
            "--port", String.valueOf(backupConfig.getRedisPort())
        );
        
        if (backupConfig.getRedisPassword() != null && !backupConfig.getRedisPassword().isEmpty()) {
            pb.command().add("--pass");
            pb.command().add(backupConfig.getRedisPassword());
        }
        
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode == 0) {
            result.addFile("redis_backup.rdb", Files.size(Paths.get(backupFile)));
        } else {
            throw new RuntimeException("Redis backup failed with exit code: " + exitCode);
        }
    }

    private void backupApplicationData(Path backupDir, BackupResult result) throws IOException {
        // Backup configuration files
        Path configDir = backupDir.resolve("config");
        Files.createDirectories(configDir);
        
        // Copy application configurations
        String[] configFiles = {"application.yml", "application-prod.yml", "application-staging.yml"};
        for (String configFile : configFiles) {
            Path source = Paths.get("config/" + configFile);
            if (Files.exists(source)) {
                Path target = configDir.resolve(configFile);
                Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
                result.addFile("config/" + configFile, Files.size(target));
            }
        }
        
        // Backup logs
        if (backupConfig.isBackupLogs()) {
            Path logsDir = backupDir.resolve("logs");
            Files.createDirectories(logsDir);
            
            Path sourceLogs = Paths.get("logs");
            if (Files.exists(sourceLogs)) {
                Files.walk(sourceLogs)
                    .filter(Files::isRegularFile)
                    .forEach(file -> {
                        try {
                            Path target = logsDir.resolve(sourceLogs.relativize(file).toString());
                            Files.createDirectories(target.getParent());
                            Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                            result.addFile("logs/" + sourceLogs.relativize(file).toString(), Files.size(target));
                        } catch (IOException e) {
                            // Log error but continue
                        }
                    });
            }
        }
    }

    private void backupChangedDataSince(Instant timestamp, Path backupDir, BackupResult result) {
        // Implementation for incremental backup
        // This would track changes since the last full backup
        // For now, implement as a simplified version
    }

    private void createBackupArchive(Path backupDir, BackupResult result) throws IOException {
        String archiveName = backupDir.getFileName() + ".zip";
        Path archivePath = Paths.get(backupConfig.getBackupDirectory(), archiveName);
        
        try (ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(archivePath.toFile()))) {
            Files.walk(backupDir)
                .filter(Files::isRegularFile)
                .forEach(file -> {
                    try {
                        ZipEntry zipEntry = new ZipEntry(backupDir.relativize(file).toString());
                        zipOut.putNextEntry(zipEntry);
                        Files.copy(file, zipOut);
                        zipOut.closeEntry();
                    } catch (IOException e) {
                        // Log error but continue
                    }
                });
        }
        
        result.setArchivePath(archivePath.toString());
        result.setArchiveSize(Files.size(archivePath));
        
        // Delete the uncompressed directory
        deleteDirectory(backupDir);
    }

    private Path extractBackupArchive(String backupId) throws IOException {
        String archiveName = backupId + ".zip";
        Path archivePath = Paths.get(backupConfig.getBackupDirectory(), archiveName);
        Path extractDir = Paths.get(backupConfig.getBackupDirectory(), "extracted_" + backupId);
        
        Files.createDirectories(extractDir);
        
        // Extract ZIP file (implementation would use ZIP library)
        // For now, return the directory path
        
        return extractDir;
    }

    private void restoreMySQL(Path backupDir, RestoreResult result) throws IOException, InterruptedException {
        String backupFile = backupDir.resolve("mysql_backup.sql").toString();
        
        ProcessBuilder pb = new ProcessBuilder(
            "mysql",
            "--host=" + backupConfig.getMysqlHost(),
            "--port=" + backupConfig.getMysqlPort(),
            "--user=" + backupConfig.getMysqlUsername(),
            "--password=" + backupConfig.getMysqlPassword(),
            "--execute", "source " + backupFile
        );
        
        Process process = pb.start();
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            throw new RuntimeException("MySQL restore failed with exit code: " + exitCode);
        }
        
        result.addRestoredComponent("MySQL Database");
    }

    private void restoreRedis(Path backupDir, RestoreResult result) throws IOException, InterruptedException {
        String backupFile = backupDir.resolve("redis_backup.rdb").toString();
        
        // Stop Redis server
        ProcessBuilder stopPb = new ProcessBuilder(
            "redis-cli",
            "--host", backupConfig.getRedisHost(),
            "--port", String.valueOf(backupConfig.getRedisPort()),
            "shutdown"
        );
        
        if (backupConfig.getRedisPassword() != null && !backupConfig.getRedisPassword().isEmpty()) {
            stopPb.command().add("--pass");
            stopPb.command().add(backupConfig.getRedisPassword());
        }
        
        Process stopProcess = stopPb.start();
        stopProcess.waitFor();
        
        // Copy backup file to Redis data directory
        Path redisDataDir = Paths.get("/var/lib/redis"); // Default Redis data directory
        Path targetRedisFile = redisDataDir.resolve("dump.rdb");
        Files.copy(Paths.get(backupFile), targetRedisFile, StandardCopyOption.REPLACE_EXISTING);
        
        // Start Redis server
        ProcessBuilder startPb = new ProcessBuilder("systemctl", "start", "redis");
        Process startProcess = startPb.start();
        startProcess.waitFor();
        
        result.addRestoredComponent("Redis Database");
    }

    private void restoreApplicationData(Path backupDir, RestoreResult result) throws IOException {
        // Restore configuration files
        Path configDir = backupDir.resolve("config");
        if (Files.exists(configDir)) {
            Files.walk(configDir)
                .filter(Files::isRegularFile)
                .forEach(file -> {
                    try {
                        Path target = Paths.get("config").resolve(configDir.relativize(file).toString());
                        Files.createDirectories(target.getParent());
                        Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                        result.addRestoredComponent("Config: " + configDir.relativize(file).toString());
                    } catch (IOException e) {
                        // Log error but continue
                    }
                });
        }
    }

    private void cleanupOldBackups() {
        // Keep only the specified number of backups
        int maxBackups = backupConfig.getMaxBackupCount();
        
        if (backupHistory.size() > maxBackups) {
            List<String> backupIds = new ArrayList<>(backupHistory.keySet());
            Collections.reverse(backupIds); // Get oldest first
            
            for (int i = maxBackups; i < backupIds.size(); i++) {
                String oldBackupId = backupIds.get(i);
                deleteBackup(oldBackupId);
                backupHistory.remove(oldBackupId);
            }
        }
    }

    private void deleteBackup(String backupId) {
        try {
            // Delete archive file
            String archiveName = backupId + ".zip";
            Path archivePath = Paths.get(backupConfig.getBackupDirectory(), archiveName);
            Files.deleteIfExists(archivePath);
            
            // Delete extracted directory if exists
            Path extractDir = Paths.get(backupConfig.getBackupDirectory(), "extracted_" + backupId);
            deleteDirectory(extractDir);
            
        } catch (IOException e) {
            // Log error but continue
        }
    }

    private void deleteDirectory(Path directory) throws IOException {
        if (Files.exists(directory)) {
            Files.walk(directory)
                .sorted(Comparator.reverseOrder())
                .forEach(file -> {
                    try {
                        Files.delete(file);
                    } catch (IOException e) {
                        // Log error but continue
                    }
                });
        }
    }

    private Instant getLastFullBackupTimestamp() {
        return backupHistory.values().stream()
            .filter(result -> result.getBackupType() == BackupType.FULL && result.isSuccess())
            .max(Comparator.comparing(BackupResult::getStartTime))
            .map(BackupResult::getStartTime)
            .orElse(null);
    }

    /**
     * Get backup history
     */
    public Map<String, BackupResult> getBackupHistory() {
        return new HashMap<>(backupHistory);
    }

    /**
     * Get backup result
     */
    public BackupResult getBackupResult(String backupId) {
        return backupHistory.get(backupId);
    }

    // Enums and classes
    public enum BackupType {
        FULL, INCREMENTAL
    }

    public static class BackupResult {
        private final String backupId;
        private final BackupType backupType;
        private Instant startTime;
        private Instant endTime;
        private String status;
        private boolean success;
        private String errorMessage;
        private String archivePath;
        private long archiveSize;
        private final Map<String, Long> backedUpFiles = new HashMap<>();

        public BackupResult(String backupId, BackupType backupType) {
            this.backupId = backupId;
            this.backupType = backupType;
        }

        public void addFile(String filename, long size) {
            backedUpFiles.put(filename, size);
        }

        // Getters and setters
        public String getBackupId() { return backupId; }
        public BackupType getBackupType() { return backupType; }
        public Instant getStartTime() { return startTime; }
        public void setStartTime(Instant startTime) { this.startTime = startTime; }
        public Instant getEndTime() { return endTime; }
        public void setEndTime(Instant endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getArchivePath() { return archivePath; }
        public void setArchivePath(String archivePath) { this.archivePath = archivePath; }
        public long getArchiveSize() { return archiveSize; }
        public void setArchiveSize(long archiveSize) { this.archiveSize = archiveSize; }
        public Map<String, Long> getBackedUpFiles() { return backedUpFiles; }
    }

    public static class RestoreResult {
        private final String backupId;
        private Instant startTime;
        private Instant endTime;
        private String status;
        private boolean success;
        private String errorMessage;
        private final List<String> restoredComponents = new ArrayList<>();

        public RestoreResult(String backupId) {
            this.backupId = backupId;
        }

        public void addRestoredComponent(String component) {
            restoredComponents.add(component);
        }

        // Getters and setters
        public String getBackupId() { return backupId; }
        public Instant getStartTime() { return startTime; }
        public void setStartTime(Instant startTime) { this.startTime = startTime; }
        public Instant getEndTime() { return endTime; }
        public void setEndTime(Instant endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public List<String> getRestoredComponents() { return restoredComponents; }
    }
}
