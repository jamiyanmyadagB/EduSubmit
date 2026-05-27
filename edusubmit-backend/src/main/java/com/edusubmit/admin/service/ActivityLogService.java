package com.edusubmit.admin.service;

import com.edusubmit.admin.entity.ActivityLog;
import com.edusubmit.admin.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public enum ActivitySeverity {
        INFO, WARNING, ERROR, CRITICAL
    }

    @Transactional
    public ActivityLog logActivity(String action, String entityType, Long entityId, Long userId, String details, ActivitySeverity severity) {
        log.info("Logging activity: {} for entity: {} by user: {}", action, entityType, userId);
        
        ActivityLog log = ActivityLog.builder()
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .userId(userId)
            .userName("Admin") // This should be fetched from user service
            .userEmail("admin@lpu.in") // This should be fetched from user service
            .details(details)
            .severity(ActivityLog.ActivitySeverity.valueOf(severity.name()))
            .build();

        return activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getAllActivityLogs(Pageable pageable) {
        log.info("Fetching all activity logs with pagination");
        return activityLogRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogsByUserId(Long userId) {
        log.info("Fetching activity logs for user: {}", userId);
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogsByEntity(String entityType, Long entityId) {
        log.info("Fetching activity logs for entity: {} with id: {}", entityType, entityId);
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching activity logs between {} and {}", startDate, endDate);
        return activityLogRepository.findByDateRange(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> searchActivityLogs(String keyword) {
        log.info("Searching activity logs with keyword: {}", keyword);
        return activityLogRepository.searchByKeyword(keyword);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogsBySeverity(ActivityLog.ActivitySeverity severity) {
        log.info("Fetching activity logs by severity: {}", severity);
        return activityLogRepository.findBySeverity(severity);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getRecentActivityLogs(int limit) {
        log.info("Fetching recent {} activity logs", limit);
        return activityLogRepository.findAll(Pageable.ofSize(limit)).getContent();
    }
}
