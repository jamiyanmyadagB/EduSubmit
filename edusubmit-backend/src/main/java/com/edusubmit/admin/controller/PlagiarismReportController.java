package com.edusubmit.admin.controller;

import com.edusubmit.admin.entity.PlagiarismReport;
import com.edusubmit.admin.service.PlagiarismReportService;
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
@RequestMapping("/api/admin/plagiarism-reports")
@RequiredArgsConstructor
public class PlagiarismReportController {

    private final PlagiarismReportService plagiarismReportService;

    @GetMapping
    public ResponseEntity<?> getAllPlagiarismReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Fetching all plagiarism reports - page: {}, size: {}", page, size);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<PlagiarismReport> reports = plagiarismReportService.getAllPlagiarismReports(pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching plagiarism reports: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch plagiarism reports"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlagiarismReportById(@PathVariable Long id) {
        log.info("Fetching plagiarism report by id: {}", id);
        try {
            return plagiarismReportService.getPlagiarismReportById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching plagiarism report: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch plagiarism report"));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable PlagiarismReport.ReportStatus status) {
        log.info("Fetching plagiarism reports by status: {}", status);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.getReportsByStatus(status);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching reports by status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch reports by status"));
        }
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getReportsBySeverity(@PathVariable PlagiarismReport.PlagiarismSeverity severity) {
        log.info("Fetching plagiarism reports by severity: {}", severity);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.getReportsBySeverity(severity);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching reports by severity: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch reports by severity"));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getReportsByStudent(@PathVariable Long studentId) {
        log.info("Fetching plagiarism reports for student: {}", studentId);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.getReportsByStudent(studentId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching reports by student: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch reports by student"));
        }
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<?> getReportsByAssignment(@PathVariable Long assignmentId) {
        log.info("Fetching plagiarism reports for assignment: {}", assignmentId);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.getReportsByAssignment(assignmentId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching reports by assignment: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch reports by assignment"));
        }
    }

    @GetMapping("/high-similarity")
    public ResponseEntity<?> getHighSimilarityReports(@RequestParam(defaultValue = "70.0") Double threshold) {
        log.info("Fetching high similarity reports with threshold: {}", threshold);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.getHighSimilarityReports(threshold);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error fetching high similarity reports: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch high similarity reports"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchReportsByStudent(@RequestParam String keyword) {
        log.info("Searching plagiarism reports by student: {}", keyword);
        try {
            List<PlagiarismReport> reports = plagiarismReportService.searchReportsByStudent(keyword);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error searching reports by student: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search reports by student"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPlagiarismReport(@RequestBody PlagiarismReport report) {
        log.info("Creating new plagiarism report for submission: {}", report.getSubmissionId());
        try {
            PlagiarismReport createdReport = plagiarismReportService.createPlagiarismReport(report);
            return ResponseEntity.ok(createdReport);
        } catch (Exception e) {
            log.error("Error creating plagiarism report: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create plagiarism report"));
        }
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<?> reviewReport(
            @PathVariable Long id,
            @RequestBody Map<String, Object> reviewData,
            @RequestHeader("X-Admin-Id") Long reviewerId
    ) {
        log.info("Reviewing plagiarism report: {}", id);
        try {
            PlagiarismReport.ReportStatus status = PlagiarismReport.ReportStatus.valueOf((String) reviewData.get("status"));
            String reviewNotes = (String) reviewData.get("reviewNotes");
            PlagiarismReport updatedReport = plagiarismReportService.reviewReport(id, status, reviewNotes, reviewerId);
            return ResponseEntity.ok(updatedReport);
        } catch (Exception e) {
            log.error("Error reviewing report: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to review report"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Deleting plagiarism report: {}", id);
        try {
            plagiarismReportService.deleteReport(id, adminId);
            return ResponseEntity.ok(Map.of("message", "Plagiarism report deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting report: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting report: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete report"));
        }
    }
}
