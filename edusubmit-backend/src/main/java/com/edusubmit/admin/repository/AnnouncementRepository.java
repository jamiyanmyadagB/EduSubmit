package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Announcement> findByTypeOrderByCreatedAtDesc(Announcement.AnnouncementType type);

    List<Announcement> findByPriorityOrderByCreatedAtDesc(Announcement.AnnouncementPriority priority);

    @Query("SELECT a FROM Announcement a WHERE a.validFrom <= :now AND (a.validUntil IS NULL OR a.validUntil >= :now) AND a.isActive = true ORDER BY a.priority DESC, a.createdAt DESC")
    List<Announcement> findActiveAnnouncements(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM Announcement a WHERE a.title LIKE %:keyword% OR a.content LIKE %:keyword%")
    List<Announcement> searchByKeyword(@Param("keyword") String keyword);
}
