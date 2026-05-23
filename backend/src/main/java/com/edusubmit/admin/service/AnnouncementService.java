package com.edusubmit.admin.service;

import com.edusubmit.admin.entity.Announcement;
import com.edusubmit.admin.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<Announcement> getAllAnnouncements(Pageable pageable) {
        log.info("Fetching all announcements with pagination");
        return announcementRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Announcement> getAnnouncementById(Long id) {
        log.info("Fetching announcement by id: {}", id);
        return announcementRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Announcement> getActiveAnnouncements() {
        log.info("Fetching active announcements");
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Announcement> getAnnouncementsByType(Announcement.AnnouncementType type) {
        log.info("Fetching announcements by type: {}", type);
        return announcementRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    @Transactional(readOnly = true)
    public List<Announcement> getAnnouncementsByPriority(Announcement.AnnouncementPriority priority) {
        log.info("Fetching announcements by priority: {}", priority);
        return announcementRepository.findByPriorityOrderByCreatedAtDesc(priority);
    }

    @Transactional(readOnly = true)
    public List<Announcement> searchAnnouncements(String keyword) {
        log.info("Searching announcements with keyword: {}", keyword);
        return announcementRepository.searchByKeyword(keyword);
    }

    @Transactional
    public Announcement createAnnouncement(Announcement announcement, Long adminId, String adminName) {
        log.info("Creating new announcement: {}", announcement.getTitle());
        
        announcement.setIsActive(true);
        announcement.setCreatedBy(adminId);
        announcement.setCreatedByName(adminName);
        announcement.setValidFrom(LocalDateTime.now());

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        
        activityLogService.logActivity(
            "ANNOUNCEMENT_CREATED",
            "Announcement",
            savedAnnouncement.getId(),
            adminId,
            "Created new announcement: " + savedAnnouncement.getTitle(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return savedAnnouncement;
    }

    @Transactional
    public Announcement updateAnnouncement(Long announcementId, Announcement announcementDetails, Long adminId) {
        log.info("Updating announcement: {}", announcementId);
        
        Announcement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + announcementId));

        announcement.setTitle(announcementDetails.getTitle());
        announcement.setContent(announcementDetails.getContent());
        announcement.setType(announcementDetails.getType());
        announcement.setPriority(announcementDetails.getPriority());
        announcement.setValidFrom(announcementDetails.getValidFrom());
        announcement.setValidUntil(announcementDetails.getValidUntil());
        announcement.setIsActive(announcementDetails.getIsActive());

        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        
        activityLogService.logActivity(
            "ANNOUNCEMENT_UPDATED",
            "Announcement",
            updatedAnnouncement.getId(),
            adminId,
            "Updated announcement: " + updatedAnnouncement.getTitle(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedAnnouncement;
    }

    @Transactional
    public void deleteAnnouncement(Long announcementId, Long adminId) {
        log.info("Deleting announcement: {}", announcementId);
        
        Announcement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + announcementId));

        announcementRepository.delete(announcement);
        
        activityLogService.logActivity(
            "ANNOUNCEMENT_DELETED",
            "Announcement",
            announcementId,
            adminId,
            "Deleted announcement: " + announcement.getTitle(),
            ActivityLogService.ActivitySeverity.WARNING
        );
    }

    @Transactional
    public Announcement toggleAnnouncementStatus(Long announcementId, Long adminId) {
        log.info("Toggling announcement status: {}", announcementId);
        
        Announcement announcement = announcementRepository.findById(announcementId)
            .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + announcementId));

        announcement.setIsActive(!announcement.getIsActive());

        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        
        activityLogService.logActivity(
            "ANNOUNCEMENT_STATUS_CHANGED",
            "Announcement",
            updatedAnnouncement.getId(),
            adminId,
            "Toggled status to " + updatedAnnouncement.getIsActive() + " for announcement: " + updatedAnnouncement.getTitle(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedAnnouncement;
    }
}
