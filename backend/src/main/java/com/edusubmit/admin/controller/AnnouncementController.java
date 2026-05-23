package com.edusubmit.admin.controller;

import com.edusubmit.admin.entity.Announcement;
import com.edusubmit.admin.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<?> getAllAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Fetching all announcements - page: {}, size: {}", page, size);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Announcement> announcements = announcementService.getAllAnnouncements(pageable);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            log.error("Error fetching announcements: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch announcements"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAnnouncements() {
        log.info("Fetching active announcements");
        try {
            List<Announcement> announcements = announcementService.getActiveAnnouncements();
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            log.error("Error fetching active announcements: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch active announcements"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnnouncementById(@PathVariable Long id) {
        log.info("Fetching announcement by id: {}", id);
        try {
            return announcementService.getAnnouncementById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching announcement: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch announcement"));
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getAnnouncementsByType(@PathVariable Announcement.AnnouncementType type) {
        log.info("Fetching announcements by type: {}", type);
        try {
            List<Announcement> announcements = announcementService.getAnnouncementsByType(type);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            log.error("Error fetching announcements by type: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch announcements by type"));
        }
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<?> getAnnouncementsByPriority(@PathVariable Announcement.AnnouncementPriority priority) {
        log.info("Fetching announcements by priority: {}", priority);
        try {
            List<Announcement> announcements = announcementService.getAnnouncementsByPriority(priority);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            log.error("Error fetching announcements by priority: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch announcements by priority"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAnnouncements(@RequestParam String keyword) {
        log.info("Searching announcements with keyword: {}", keyword);
        try {
            List<Announcement> announcements = announcementService.searchAnnouncements(keyword);
            return ResponseEntity.ok(announcements);
        } catch (Exception e) {
            log.error("Error searching announcements: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search announcements"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAnnouncement(@RequestBody Announcement announcement, @RequestHeader("X-Admin-Id") Long adminId, @RequestHeader("X-Admin-Name") String adminName) {
        log.info("Creating new announcement: {}", announcement.getTitle());
        try {
            Announcement createdAnnouncement = announcementService.createAnnouncement(announcement, adminId, adminName);
            return ResponseEntity.ok(createdAnnouncement);
        } catch (Exception e) {
            log.error("Error creating announcement: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create announcement"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcementDetails, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Updating announcement: {}", id);
        try {
            Announcement updatedAnnouncement = announcementService.updateAnnouncement(id, announcementDetails, adminId);
            return ResponseEntity.ok(updatedAnnouncement);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating announcement: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating announcement: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update announcement"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Deleting announcement: {}", id);
        try {
            announcementService.deleteAnnouncement(id, adminId);
            return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting announcement: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting announcement: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete announcement"));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleAnnouncementStatus(@PathVariable Long id, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Toggling announcement status: {}", id);
        try {
            Announcement updatedAnnouncement = announcementService.toggleAnnouncementStatus(id, adminId);
            return ResponseEntity.ok(updatedAnnouncement);
        } catch (Exception e) {
            log.error("Error toggling announcement status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to toggle announcement status"));
        }
    }
}
