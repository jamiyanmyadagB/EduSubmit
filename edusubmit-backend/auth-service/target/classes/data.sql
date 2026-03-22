-- Initialize default users
INSERT INTO users (email, name, role, status, password_hash, created_at, updated_at) VALUES
('student@gmail.com', 'Student User', 'STUDENT', 'ACTIVE', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
('teacher@gmail.com', 'Teacher User', 'TEACHER', 'ACTIVE', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW()),
('admin@gmail.com', 'Admin User', 'ADMIN', 'ACTIVE', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role), status=VALUES(status);
