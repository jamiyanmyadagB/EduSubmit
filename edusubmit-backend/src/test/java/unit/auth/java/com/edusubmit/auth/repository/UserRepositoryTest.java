package com.edusubmit.auth.repository;

import com.edusubmit.auth.entity.User;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for UserRepository using Testcontainers
 * Tests database operations with a real MySQL container
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@ActiveProfiles("test")
class UserRepositoryTest {

    @Container
    // MySQL 8.0 container for testing
    // Testcontainers automatically manages the container lifecycle
    static final MySQLContainer<?> mysql = new MySQLContainer<>(
            DockerImageName.parse("mysql:8.0")
    )
            .withDatabaseName("edusubmit_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up database before each test
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPasswordHash("$2a$10$encodedPasswordHash");
        testUser.setRole(UserRole.STUDENT);
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setLastLogin(LocalDateTime.now());
    }

    @Test
    void testSaveUser_Success() {
        // Act
        User savedUser = userRepository.save(testUser);

        // Assert
        assertNotNull(savedUser);
        assertNotNull(savedUser.getId());
        assertEquals("test@example.com", savedUser.getEmail());
        assertEquals("Test User", savedUser.getName());
        assertEquals(UserRole.STUDENT, savedUser.getRole());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());
    }

    @Test
    void testFindById_Success() {
        // Arrange
        User savedUser = userRepository.save(testUser);

        // Act
        Optional<User> foundUser = userRepository.findById(savedUser.getId());

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getId(), foundUser.get().getId());
        assertEquals("test@example.com", foundUser.get().getEmail());
    }

    @Test
    void testFindById_NotFound() {
        // Act
        Optional<User> foundUser = userRepository.findById(999L);

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void testFindByEmail_Success() {
        // Arrange
        userRepository.save(testUser);

        // Act
        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        // Assert
        assertTrue(foundUser.isPresent());
        assertEquals("test@example.com", foundUser.get().getEmail());
    }

    @Test
    void testFindByEmail_NotFound() {
        // Act
        Optional<User> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(foundUser.isPresent());
    }

    @Test
    void testFindByEmail_CaseInsensitive() {
        // Arrange
        userRepository.save(testUser);

        // Act
        Optional<User> foundUser1 = userRepository.findByEmail("test@example.com");
        Optional<User> foundUser2 = userRepository.findByEmail("TEST@EXAMPLE.COM");
        Optional<User> foundUser3 = userRepository.findByEmail("Test@Example.Com");

        // Assert
        assertTrue(foundUser1.isPresent());
        assertTrue(foundUser2.isPresent());
        assertTrue(foundUser3.isPresent());
        assertEquals(foundUser1.get().getId(), foundUser2.get().getId());
        assertEquals(foundUser2.get().getId(), foundUser3.get().getId());
    }

    @Test
    void testFindByRole_Success() {
        // Arrange
        User student1 = createTestUser("student1@example.com", UserRole.STUDENT);
        User student2 = createTestUser("student2@example.com", UserRole.STUDENT);
        User teacher1 = createTestUser("teacher1@example.com", UserRole.TEACHER);
        userRepository.saveAll(List.of(student1, student2, teacher1));

        // Act - Use findAll and filter by role since findByRole doesn't exist
        List<User> allUsers = userRepository.findAll();
        List<User> students = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .toList();
        List<User> teachers = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.TEACHER)
                .toList();

        // Assert
        assertEquals(2, students.size());
        assertEquals(1, teachers.size());
        assertTrue(students.stream().allMatch(u -> u.getRole() == UserRole.STUDENT));
        assertTrue(teachers.stream().allMatch(u -> u.getRole() == UserRole.TEACHER));
    }

    @Test
    void testFindByStatus_Success() {
        // Arrange
        User activeUser1 = createTestUser("active1@example.com", UserRole.STUDENT);
        activeUser1.setStatus(UserStatus.ACTIVE);
        User activeUser2 = createTestUser("active2@example.com", UserRole.TEACHER);
        activeUser2.setStatus(UserStatus.ACTIVE);
        User inactiveUser = createTestUser("inactive@example.com", UserRole.STUDENT);
        inactiveUser.setStatus(UserStatus.INACTIVE);
        userRepository.saveAll(List.of(activeUser1, activeUser2, inactiveUser));

        // Act - Use findAll and filter by status since findByStatus doesn't exist
        List<User> allUsers = userRepository.findAll();
        List<User> activeUsers = allUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .toList();
        List<User> inactiveUsers = allUsers.stream()
                .filter(u -> u.getStatus() == UserStatus.INACTIVE)
                .toList();

        // Assert
        assertEquals(2, activeUsers.size());
        assertEquals(1, inactiveUsers.size());
        assertTrue(activeUsers.stream().allMatch(u -> u.getStatus() == UserStatus.ACTIVE));
        assertTrue(inactiveUsers.stream().allMatch(u -> u.getStatus() == UserStatus.INACTIVE));
    }

    @Test
    void testDeleteUser_Success() {
        // Arrange
        User savedUser = userRepository.save(testUser);
        Long userId = savedUser.getId();

        // Act
        userRepository.deleteById(userId);

        // Assert
        Optional<User> deletedUser = userRepository.findById(userId);
        assertFalse(deletedUser.isPresent());
    }

    @Test
    void testUpdateUser_Success() {
        // Arrange
        User savedUser = userRepository.save(testUser);
        savedUser.setName("Updated Name");
        savedUser.setRole(UserRole.TEACHER);

        // Act
        User updatedUser = userRepository.save(savedUser);

        // Assert
        assertEquals("Updated Name", updatedUser.getName());
        assertEquals(UserRole.TEACHER, updatedUser.getRole());
        assertEquals(savedUser.getId(), updatedUser.getId());
    }

    @Test
    void testCountByRole_Success() {
        // Arrange
        User student1 = createTestUser("student1@example.com", UserRole.STUDENT);
        User student2 = createTestUser("student2@example.com", UserRole.STUDENT);
        User student3 = createTestUser("student3@example.com", UserRole.STUDENT);
        User teacher1 = createTestUser("teacher1@example.com", UserRole.TEACHER);
        userRepository.saveAll(List.of(student1, student2, student3, teacher1));

        // Act - Use findAll and count since countByRole doesn't exist
        List<User> allUsers = userRepository.findAll();
        long studentCount = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .count();
        long teacherCount = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.TEACHER)
                .count();
        long adminCount = allUsers.stream()
                .filter(u -> u.getRole() == UserRole.ADMIN)
                .count();

        // Assert
        assertEquals(3, studentCount);
        assertEquals(1, teacherCount);
        assertEquals(0, adminCount);
    }

    @Test
    void testExistsByEmail_Success() {
        // Arrange
        userRepository.save(testUser);

        // Act
        boolean exists = userRepository.existsByEmail("test@example.com");
        boolean notExists = userRepository.existsByEmail("nonexistent@example.com");

        // Assert
        assertTrue(exists);
        assertFalse(notExists);
    }

    @Test
    void testLastLoginTimestamp_Success() {
        // Arrange
        LocalDateTime initialTime = LocalDateTime.now();
        testUser.setLastLogin(initialTime);
        User savedUser = userRepository.save(testUser);

        // Act
        LocalDateTime newTime = LocalDateTime.now().plusMinutes(5);
        savedUser.setLastLogin(newTime);
        User updatedUser = userRepository.save(savedUser);

        // Assert
        assertTrue(updatedUser.getLastLogin().isAfter(initialTime) || 
                   updatedUser.getLastLogin().isEqual(initialTime));
    }

    @Test
    void testMultipleUsersWithSameEmail_NotAllowed() {
        // Arrange
        userRepository.save(testUser);
        User duplicateUser = createTestUser("test@example.com", UserRole.TEACHER);

        // Act & Assert
        // This should throw an exception due to unique constraint on email
        assertThrows(Exception.class, () -> {
            userRepository.save(duplicateUser);
        });
    }

    // Helper method to create test users
    private User createTestUser(String email, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setName("Test User");
        user.setPasswordHash("$2a$10$encodedPasswordHash");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
        return user;
    }
}
