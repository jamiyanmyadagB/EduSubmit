package com.edusubmit.admin.service;

import com.edusubmit.admin.repository.AdminUserRepository;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AdminUserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final SystemHealthService systemHealthService;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalStudents", userRepository.countByRole(UserRole.STUDENT));
        stats.put("totalTeachers", userRepository.countByRole(UserRole.TEACHER));
        stats.put("totalAdmins", userRepository.countByRole(UserRole.ADMIN));
        stats.put("activeUsers", userRepository.countByStatus(UserStatus.ACTIVE));
        stats.put("inactiveUsers", userRepository.countByStatus(UserStatus.INACTIVE));
        stats.put("suspendedUsers", userRepository.countByStatus(UserStatus.SUSPENDED));
        
        // System health
        SystemHealthService.SystemHealthMetrics health = systemHealthService.getSystemHealth();
        stats.put("systemHealth", health.getApiStatus());
        stats.put("uptime", health.getUptime());
        stats.put("storageUsage", health.getStorageUsage());
        
        // Recent activity
        stats.put("recentActivities", activityLogService.getRecentActivityLogs(10));
        
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        log.info("Fetching user statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.count());
        stats.put("totalStudents", userRepository.countByRole(UserRole.STUDENT));
        stats.put("totalTeachers", userRepository.countByRole(UserRole.TEACHER));
        stats.put("totalAdmins", userRepository.countByRole(UserRole.ADMIN));
        stats.put("activeUsers", userRepository.countByStatus(UserStatus.ACTIVE));
        stats.put("inactiveUsers", userRepository.countByStatus(UserStatus.INACTIVE));
        stats.put("suspendedUsers", userRepository.countByStatus(UserStatus.SUSPENDED));
        
        return stats;
    }
}
