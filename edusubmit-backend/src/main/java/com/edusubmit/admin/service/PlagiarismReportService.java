package com.edusubmit.admin.service;

import com.edusubmit.admin.entity.PlagiarismReport;
import com.edusubmit.admin.repository.PlagiarismReportRepository;
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
public class PlagiarismReportService {

    private final PlagiarismReportRepository plagiarismReportRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<PlagiarismReport> getAllPlagiarismReports(Pageable pageable) {
        log.info("Fetching all plagiarism reports with pagination");
        return plagiarismReportRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<PlagiarismReport> getPlagiarismReportById(Long id) {
        log.info("Fetching plagiarism report by id: {}", id);
        return plagiarismReportRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> getReportsByStatus(PlagiarismReport.ReportStatus status) {
        log.info("Fetching plagiarism reports by status: {}", status);
        return plagiarismReportRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> getReportsBySeverity(PlagiarismReport.PlagiarismSeverity severity) {
        log.info("Fetching plagiarism reports by severity: {}", severity);
        return plagiarismReportRepository.findBySeverityOrderByCreatedAtDesc(severity);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> getReportsByStudent(Long studentId) {
        log.info("Fetching plagiarism reports for student: {}", studentId);
        return plagiarismReportRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> getReportsByAssignment(Long assignmentId) {
        log.info("Fetching plagiarism reports for assignment: {}", assignmentId);
        return plagiarismReportRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> getHighSimilarityReports(Double threshold) {
        log.info("Fetching high similarity reports with threshold: {}", threshold);
        return plagiarismReportRepository.findBySimilarityScoreGreaterThanEqual(threshold);
    }

    @Transactional(readOnly = true)
    public List<PlagiarismReport> searchReportsByStudent(String keyword) {
        log.info("Searching plagiarism reports by student: {}", keyword);
        return plagiarismReportRepository.searchByStudent(keyword);
    }

    @Transactional
    public PlagiarismReport createPlagiarismReport(PlagiarismReport report) {
        log.info("Creating new plagiarism report for submission: {}", report.getSubmissionId());
        
        report.setStatus(PlagiarismReport.ReportStatus.PENDING);

        PlagiarismReport savedReport = plagiarismReportRepository.save(report);
        
        activityLogService.logActivity(
            "PLAGIARISM_REPORT_CREATED",
            "PlagiarismReport",
            savedReport.getId(),
            0L, // System generated
            "New plagiarism report created for submission: " + savedReport.getSubmissionId(),
            ActivityLogService.ActivitySeverity.WARNING
        );

        return savedReport;
    }

    @Transactional
    public PlagiarismReport reviewReport(Long reportId, PlagiarismReport.ReportStatus status, String reviewNotes, Long reviewerId) {
        log.info("Reviewing plagiarism report: {}", reportId);
        
        PlagiarismReport report = plagiarismReportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Plagiarism report not found with id: " + reportId));

        report.setStatus(status);
        report.setReviewedBy(reviewerId);
        report.setReviewedAt(LocalDateTime.now());
        report.setReviewNotes(reviewNotes);

        PlagiarismReport updatedReport = plagiarismReportRepository.save(report);
        
        activityLogService.logActivity(
            "PLAGIARISM_REPORT_REVIEWED",
            "PlagiarismReport",
            updatedReport.getId(),
            reviewerId,
            "Reviewed plagiarism report with status: " + status,
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedReport;
    }

    @Transactional
    public void deleteReport(Long reportId, Long adminId) {
        log.info("Deleting plagiarism report: {}", reportId);
        
        PlagiarismReport report = plagiarismReportRepository.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Plagiarism report not found with id: " + reportId));

        plagiarismReportRepository.delete(report);
        
        activityLogService.logActivity(
            "PLAGIARISM_REPORT_DELETED",
            "PlagiarismReport",
            reportId,
            adminId,
            "Deleted plagiarism report for submission: " + report.getSubmissionId(),
            ActivityLogService.ActivitySeverity.WARNING
        );
    }
}
