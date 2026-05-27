package com.edusubmit.admin.controller;

import com.edusubmit.admin.service.DashboardService;
import com.edusubmit.admin.service.SystemHealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;
    private final SystemHealthService systemHealthService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        try {
            Map<String, Object> stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch dashboard stats"));
        }
    }

    @GetMapping("/dashboard/user-stats")
    public ResponseEntity<?> getUserStatistics() {
        log.info("Fetching user statistics");
        try {
            Map<String, Object> stats = dashboardService.getUserStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching user stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch user stats"));
        }
    }

    @GetMapping("/system/health")
    public ResponseEntity<?> getSystemHealth() {
        log.info("Fetching system health");
        try {
            SystemHealthService.SystemHealthMetrics health = systemHealthService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Error fetching system health: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch system health"));
        }
    }
}
