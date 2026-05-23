package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByCode(String code);

    List<Batch> findByDepartmentId(Long departmentId);

    List<Batch> findByStatus(Batch.BatchStatus status);

    List<Batch> findByYear(Integer year);

    @Query("SELECT b FROM Batch b WHERE b.name LIKE %:keyword% OR b.code LIKE %:keyword%")
    List<Batch> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByCode(String code);
}
