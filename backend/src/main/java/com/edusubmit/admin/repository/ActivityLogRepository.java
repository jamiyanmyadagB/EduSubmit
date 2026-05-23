package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);

    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM ActivityLog a WHERE a.action LIKE %:keyword% OR a.userName LIKE %:keyword% OR a.details LIKE %:keyword% ORDER BY a.createdAt DESC")
    List<ActivityLog> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT a FROM ActivityLog a WHERE a.severity = :severity ORDER BY a.createdAt DESC")
    List<ActivityLog> findBySeverity(@Param("severity") ActivityLog.ActivitySeverity severity);
}
