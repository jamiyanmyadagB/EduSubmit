package com.edusubmit.assignment.config;

import com.edusubmit.assignment.entity.User;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        log.info("Initializing users...");

        // Check if users already exist
        Long userCount = (Long) entityManager.createQuery("SELECT COUNT(u) FROM User u").getSingleResult();
        
        if (userCount > 0) {
            log.info("Users already exist in database. Skipping initialization.");
            return;
        }

        // Create Student user
        User student = User.builder()
                .email("student@gmail.com")
                .name("Student User")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .passwordHash(passwordEncoder.encode("123"))
                .build();

        // Create Teacher user
        User teacher = User.builder()
                .email("teacher@gmail.com")
                .name("Teacher User")
                .role(UserRole.TEACHER)
                .status(UserStatus.ACTIVE)
                .passwordHash(passwordEncoder.encode("123"))
                .build();

        // Create Admin user
        User admin = User.builder()
                .email("admin@gmail.com")
                .name("Admin User")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .passwordHash(passwordEncoder.encode("123"))
                .build();

        entityManager.persist(student);
        entityManager.persist(teacher);
        entityManager.persist(admin);

        log.info("Successfully created 3 users:");
        log.info("1. Student: student@gmail.com / 123");
        log.info("2. Teacher: teacher@gmail.com / 123");
        log.info("3. Admin: admin@gmail.com / 123");
    }
}
