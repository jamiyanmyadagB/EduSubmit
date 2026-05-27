package com.edusubmit.admin.service;

import com.edusubmit.admin.repository.AdminUserRepository;
import com.edusubmit.auth.entity.User;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final AdminUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        return userRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        log.info("Fetching user by id: {}", id);
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRole(UserRole role) {
        log.info("Fetching users by role: {}", role);
        return userRepository.findByRole(role);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(UserStatus status) {
        log.info("Fetching users by status: {}", status);
        return userRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public List<User> searchUsers(String keyword) {
        log.info("Searching users with keyword: {}", keyword);
        return userRepository.searchByKeyword(keyword);
    }

    @Transactional
    public User createUser(User user, Long adminId) {
        log.info("Creating new user: {}", user.getEmail());
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
        }

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setCreatedBy(adminId);

        User savedUser = userRepository.save(user);
        
        activityLogService.logActivity(
            "USER_CREATED",
            "User",
            savedUser.getId(),
            adminId,
            "Created new user: " + savedUser.getEmail(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return savedUser;
    }

    @Transactional
    public User updateUser(Long userId, User userDetails, Long adminId) {
        log.info("Updating user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        user.setRole(userDetails.getRole());
        user.setStatus(userDetails.getStatus());
        user.setStudentId(userDetails.getStudentId());
        user.setTeacherId(userDetails.getTeacherId());
        user.setEmployeeId(userDetails.getEmployeeId());
        user.setSectionId(userDetails.getSectionId());
        user.setDepartmentId(userDetails.getDepartmentId());
        user.setUpdatedBy(adminId);

        User updatedUser = userRepository.save(user);
        
        activityLogService.logActivity(
            "USER_UPDATED",
            "User",
            updatedUser.getId(),
            adminId,
            "Updated user: " + updatedUser.getEmail(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedUser;
    }

    @Transactional
    public void deleteUser(Long userId, Long adminId) {
        log.info("Deleting user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        userRepository.delete(user);
        
        activityLogService.logActivity(
            "USER_DELETED",
            "User",
            userId,
            adminId,
            "Deleted user: " + user.getEmail(),
            ActivityLogService.ActivitySeverity.WARNING
        );
    }

    @Transactional
    public User updateUserStatus(Long userId, UserStatus status, Long adminId) {
        log.info("Updating user status: {} to {}", userId, status);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setStatus(status);
        user.setUpdatedBy(adminId);

        User updatedUser = userRepository.save(user);
        
        activityLogService.logActivity(
            "USER_STATUS_CHANGED",
            "User",
            updatedUser.getId(),
            adminId,
            "Changed status to " + status + " for user: " + updatedUser.getEmail(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedUser;
    }

    @Transactional
    public User updateUserRole(Long userId, UserRole role, Long adminId) {
        log.info("Updating user role: {} to {}", userId, role);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setRole(role);
        user.setUpdatedBy(adminId);

        User updatedUser = userRepository.save(user);
        
        activityLogService.logActivity(
            "USER_ROLE_CHANGED",
            "User",
            updatedUser.getId(),
            adminId,
            "Changed role to " + role + " for user: " + updatedUser.getEmail(),
            ActivityLogService.ActivitySeverity.INFO
        );

        return updatedUser;
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword, Long adminId) {
        log.info("Resetting password for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedBy(adminId);

        userRepository.save(user);
        
        activityLogService.logActivity(
            "PASSWORD_RESET",
            "User",
            user.getId(),
            adminId,
            "Reset password for user: " + user.getEmail(),
            ActivityLogService.ActivitySeverity.WARNING
        );
    }

    @Transactional(readOnly = true)
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public long getUsersByRoleCount(UserRole role) {
        return userRepository.countByRole(role);
    }

    @Transactional(readOnly = true)
    public long getUsersByStatusCount(UserStatus status) {
        return userRepository.countByStatus(status);
    }
}
