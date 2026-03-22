package com.edusubmit.auth.config;

import com.edusubmit.auth.entity.User;
import com.edusubmit.auth.repository.UserRepository;
import com.edusubmit.shared.enums.UserRole;
import com.edusubmit.shared.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        log.info("Initializing users...");

        if (userRepository.count() > 0) {
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

        userRepository.save(student);
        userRepository.save(teacher);
        userRepository.save(admin);

        log.info("Successfully created 3 users:");
        log.info("1. Student: student@gmail.com / 123");
        log.info("2. Teacher: teacher@gmail.com / 123");
        log.info("3. Admin: admin@gmail.com / 123");
    }
}
