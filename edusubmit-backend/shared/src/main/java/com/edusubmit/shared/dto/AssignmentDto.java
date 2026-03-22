package com.edusubmit.shared.dto;

import com.edusubmit.shared.enums.AssignmentStatus;
import com.edusubmit.shared.enums.DifficultyLevel;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;
    
    @NotBlank(message = "Instructions are required")
    private String instructions;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotNull(message = "Maximum score is required")
    @Positive(message = "Maximum score must be positive")
    private Integer maxScore;
    
    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDateTime dueDate;
    
    private LocalDateTime dueTime;
    
    private DifficultyLevel difficulty;
    
    private AssignmentStatus status;
    
    private List<String> allowedFileTypes;
    
    private Integer maxFileSize;
    
    private Long teacherId;
    
    private String teacherName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime publishedAt;
    
    // Statistics
    private Integer totalSubmissions;
    
    private Integer gradedSubmissions;
    
    private Double averageScore;
}
