package com.edusubmit.admin.controller;

import com.edusubmit.admin.service.UserManagementService;
import com.edusubmit.auth.entity.User;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
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
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Fetching all users - page: {}, size: {}", page, size);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<User> users = userManagementService.getAllUsers(pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch users"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        log.info("Fetching user by id: {}", id);
        try {
            return userManagementService.getUserById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch user"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        log.info("Searching users with keyword: {}", keyword);
        try {
            List<User> users = userManagementService.searchUsers(keyword);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to search users"));
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable UserRole role) {
        log.info("Fetching users by role: {}", role);
        try {
            List<User> users = userManagementService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users by role: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch users by role"));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getUsersByStatus(@PathVariable UserStatus status) {
        log.info("Fetching users by status: {}", status);
        try {
            List<User> users = userManagementService.getUsersByStatus(status);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users by status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch users by status"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Creating new user: {}", user.getEmail());
        try {
            User createdUser = userManagementService.createUser(user, adminId);
            return ResponseEntity.ok(createdUser);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create user"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Updating user: {}", id);
        try {
            User updatedUser = userManagementService.updateUser(id, userDetails, adminId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update user"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Deleting user: {}", id);
        try {
            userManagementService.deleteUser(id, adminId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Validation error deleting user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete user"));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam UserStatus status, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Updating user status: {} to {}", id, status);
        try {
            User updatedUser = userManagementService.updateUserStatus(id, status, adminId);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Error updating user status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update user status"));
        }
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam UserRole role, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Updating user role: {} to {}", id, role);
        try {
            User updatedUser = userManagementService.updateUserRole(id, role, adminId);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Error updating user role: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update user role"));
        }
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request, @RequestHeader("X-Admin-Id") Long adminId) {
        log.info("Resetting password for user: {}", id);
        try {
            String newPassword = request.get("newPassword");
            userManagementService.resetPassword(id, newPassword, adminId);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            log.error("Error resetting password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to reset password"));
        }
    }
}
