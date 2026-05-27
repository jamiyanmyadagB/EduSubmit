package com.edusubmit.admin.repository;

import com.edusubmit.admin.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByCode(String code);

    List<Department> findByStatus(Department.DepartmentStatus status);

    @Query("SELECT d FROM Department d WHERE d.name LIKE %:keyword% OR d.code LIKE %:keyword%")
    List<Department> searchByKeyword(@Param("keyword") String keyword);

    boolean existsByCode(String code);
}
