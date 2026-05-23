package com.edusubmit.admin.controller;

import com.edusubmit.admin.entity.Department;
import com.edusubmit.admin.service.DepartmentService;
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
@RequestMapping("/api/admin/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<?> getAllDepartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        log.info("Fetching all departments - page: {}, size: {}", page, size);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Department> departments = departmentService.getAllDepartments(pageable);
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            log.error("Error fetching departments: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch departments"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        log.info("Fetching department by id: {}", id);
        try {
            return departmentService.getDepartmentById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching department: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch department"));
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<?> getDepartmentByCode(@PathVariable String code) {
        log.info("Fetching department by code: {}", code);
        try {
            return departmentService.getDepartmentByCode(code)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching department by code: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch department by code"));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getDepartmentsByStatus(@PathVariable Department.DepartmentStatus status) {
        log.info("Fetching departments by status: {}", status);
        try {
            List<Department> departments = departmentService.getDepartmentsByStatus(status);
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            log.error("Error fetching departments by status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch departments by status"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDepartments(@RequestParam String keyword) {
        log.info("Searching departments with keyword: {}", keyword);
        try {
            List<Department> departments = departmentService.searchDepartments(keyword);
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            log.error("Error searching departments: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search departments"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Creating new department: {}", department.getCode());
        try {
            Department createdDepartment = departmentService.createDepartment(department, adminId);
            return ResponseEntity.ok(createdDepartment);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating department: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating department: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create department"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Updating department: {}", id);
        try {
            Department updatedDepartment = departmentService.updateDepartment(id, departmentDetails, adminId);
            return ResponseEntity.ok(updatedDepartment);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating department: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating department: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update department"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Deleting department: {}", id);
        try {
            departmentService.deleteDepartment(id, adminId);
            return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting department: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting department: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete department"));
        }
    }
}
