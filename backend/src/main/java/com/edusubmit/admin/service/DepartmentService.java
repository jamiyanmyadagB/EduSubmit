package com.edusubmit.admin.service;

import com.edusubmit.admin.entity.Department;
import com.edusubmit.admin.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<Department> getAllDepartments(Pageable pageable) {
        log.info("Fetching all departments with pagination");
        return departmentRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Department> getDepartmentById(Long id) {
        log.info("Fetching department by id: {}", id);
        return departmentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Department> getDepartmentByCode(String code) {
        log.info("Fetching department by code: {}", code);
        return departmentRepository.findByCode(code);
    }

    @Transactional(readOnly = true)
    public List<Department> getDepartmentsByStatus(Department.DepartmentStatus status) {
        log.info("Fetching departments by status: {}", status);
        return departmentRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<Department> searchDepartments(String keyword) {
        log.info("Searching departments with keyword: {}", keyword);
        return departmentRepository.searchByKeyword(keyword);
    }

    @Transactional
    public Department createDepartment(Department department, Long adminId) {
        log.info("Creating new department: {}", department.getCode());
        
        if (departmentRepository.existsByCode(department.getCode())) {
            throw new IllegalArgumentException("Department with code " + department.getCode() + " already exists");
        }

        department.setStatus(Department.DepartmentStatus.ACTIVE);
        department.setCreatedBy(adminId);

        Department savedDepartment = departmentRepository.save(department);
        
        activityLogService.logActivity(
            "DEPARTMENT_CREATED",
            "Department",
            savedDepartment.getId(),
            adminId,
            "Created new department: " + savedDepartment.getName(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return savedDepartment;
    }

    @Transactional
    public Department updateDepartment(Long departmentId, Department departmentDetails, Long adminId) {
        log.info("Updating department: {}", departmentId);
        
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + departmentId));

        department.setCode(departmentDetails.getCode());
        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());
        department.setHeadOfDepartment(departmentDetails.getHeadOfDepartment());
        department.setStatus(departmentDetails.getStatus());
        department.setUpdatedBy(adminId);

        Department updatedDepartment = departmentRepository.save(department);
        
        activityLogService.logActivity(
            "DEPARTMENT_UPDATED",
            "Department",
            updatedDepartment.getId(),
            adminId,
            "Updated department: " + updatedDepartment.getName(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedDepartment;
    }

    @Transactional
    public void deleteDepartment(Long departmentId, Long adminId) {
        log.info("Deleting department: {}", departmentId);
        
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new IllegalArgumentException("Department not found with id: " + departmentId));

        departmentRepository.delete(department);
        
        activityLogService.logActivity(
            "DEPARTMENT_DELETED",
            "Department",
            departmentId,
            adminId,
            "Deleted department: " + department.getName(),
            ActivityLogService.ActivitySeverity.WARNING
        );
    }
}
