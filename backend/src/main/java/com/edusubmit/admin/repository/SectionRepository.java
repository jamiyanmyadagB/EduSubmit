package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    Optional<Section> findByCode(String code);

    List<Section> findByBatchId(Long batchId);

    List<Section> findByStatus(Section.SectionStatus status);

    @Query("SELECT s FROM Section s WHERE s.name LIKE %:keyword% OR s.code LIKE %:keyword%")
    List<Section> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByCode(String code);
}
