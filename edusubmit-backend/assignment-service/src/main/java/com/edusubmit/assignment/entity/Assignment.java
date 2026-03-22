package com.edusubmit.assignment.entity;

import com.edusubmit.shared.enums.AssignmentStatus;
import com.edusubmit.shared.enums.DifficultyLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    @Lob
    private String instructions;
    
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficulty;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AssignmentStatus status;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false)
    private Integer maxScore;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "due_time")
    private LocalDateTime dueTime;
    
    @ElementCollection
    @CollectionTable(
        name = "assignment_file_types",
        joinColumns = @JoinColumn(name = "assignment_id")
    )
    @Column(name = "file_type")
    private List<String> allowedFileTypes;
    
    @Column(name = "max_file_size")
    private Integer maxFileSize;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;
    
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Submission> submissions;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Version
    private Long version;
    
    // Audit fields
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
