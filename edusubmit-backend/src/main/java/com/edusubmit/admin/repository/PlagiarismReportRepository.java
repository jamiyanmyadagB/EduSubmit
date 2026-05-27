package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.PlagiarismReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlagiarismReportRepository extends JpaRepository<PlagiarismReport, Long> {

    List<PlagiarismReport> findByStatusOrderByCreatedAtDesc(PlagiarismReport.ReportStatus status);

    List<PlagiarismReport> findBySeverityOrderByCreatedAtDesc(PlagiarismReport.PlagiarismSeverity severity);

    List<PlagiarismReport> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<PlagiarismReport> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);

    @Query("SELECT p FROM PlagiarismReport p WHERE p.similarityScore >= :threshold ORDER BY p.similarityScore DESC")
    List<PlagiarismReport> findBySimilarityScoreGreaterThanEqual(@Param("threshold") Double threshold);

    @Query("SELECT p FROM PlagiarismReport p WHERE p.studentName LIKE %:keyword% OR p.studentEmail LIKE %:keyword%")
    List<PlagiarismReport> searchByStudent(@Param("keyword") String keyword);

    @Query("SELECT p FROM PlagiarismReport p WHERE p.status IN :statuses ORDER BY p.createdAt DESC")
    List<PlagiarismReport> findByStatusIn(@Param("statuses") List<PlagiarismReport.ReportStatus> statuses);
}
