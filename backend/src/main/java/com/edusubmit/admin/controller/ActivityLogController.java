package com.edusubmit.admin.controller;

import com.edusubmit.admin.entity.ActivityLog;
import com.edusubmit.admin.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<?> getAllActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Fetching all activity logs - page: {}, size: {}", page, size);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<ActivityLog> logs = activityLogService.getAllActivityLogs(pageable);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching activity logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch activity logs"));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentActivityLogs(@RequestParam(defaultValue = "10") int limit) {
        log.info("Fetching recent activity logs - limit: {}", limit);
        try {
            List<ActivityLog> logs = activityLogService.getRecentActivityLogs(limit);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching recent activity logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch recent activity logs"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getActivityLogsByUserId(@PathVariable Long userId) {
        log.info("Fetching activity logs for user: {}", userId);
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsByUserId(userId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching activity logs by user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch activity logs by user"));
        }
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<?> getActivityLogsByEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        log.info("Fetching activity logs for entity: {} with id: {}", entityType, entityId);
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsByEntity(entityType, entityId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching activity logs by entity: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch activity logs by entity"));
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<?> getActivityLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("Fetching activity logs between {} and {}", startDate, endDate);
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsByDateRange(startDate, endDate);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching activity logs by date range: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch activity logs by date range"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchActivityLogs(@RequestParam String keyword) {
        log.info("Searching activity logs with keyword: {}", keyword);
        try {
            List<ActivityLog> logs = activityLogService.searchActivityLogs(keyword);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error searching activity logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search activity logs"));
        }
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getActivityLogsBySeverity(@PathVariable ActivityLog.ActivitySeverity severity) {
        log.info("Fetching activity logs by severity: {}", severity);
        try {
            List<ActivityLog> logs = activityLogService.getActivityLogsBySeverity(severity);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching activity logs by severity: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch activity logs by severity"));
        }
    }
}
