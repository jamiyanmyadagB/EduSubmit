package com.edusubmit.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AnnouncementType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AnnouncementPriority priority;

    @Column(nullable = false)
    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false)
    private String createdByName;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AnnouncementType {
        GENERAL, URGENT, MAINTENANCE, FEATURE, SECURITY
    }

    public enum AnnouncementPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
