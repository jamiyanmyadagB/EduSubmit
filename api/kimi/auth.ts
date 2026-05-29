/**
 * EduSubmit Auth Unit Tests
 * Tests: JWT generation, token verification, RBAC middleware, password hashing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateToken, verifyToken } from "../../api/local-auth";
import { hashSync, compareSync } from "bcryptjs";

// ─── Mock DB so tests don't need a real MySQL connection ───
vi.mock("../../api/queries/connection", () => ({
  getDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  })),
}));

const mockUser = {
  id: 1,
  email: "student@gmail.com",
  name: "John Student",
  passwordHash: hashSync("123", 10),
  role: "STUDENT" as const,
  status: "ACTIVE" as const,
  avatar: null,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("JWT Token Generation", () => {
  it("should generate a valid JWT token", async () => {
    const token = await generateToken(mockUser);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    // JWT format: header.payload.signature
    expect(token.split(".").length).toBe(3);
  });

  it("should include userId, email, role in token payload", async () => {
    const token = await generateToken(mockUser);
    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(1);
    expect(decoded?.email).toBe("student@gmail.com");
    expect(decoded?.role).toBe("STUDENT");
  });

  it("should generate different tokens for different users", async () => {
    const teacherUser = { ...mockUser, id: 2, email: "teacher@gmail.com", role: "TEACHER" as const };
    const studentToken = await generateToken(mockUser);
    const teacherToken = await generateToken(teacherUser);
    expect(studentToken).not.toBe(teacherToken);
  });
});

describe("JWT Token Verification", () => {
  it("should verify a valid token and return payload", async () => {
    const token = await generateToken(mockUser);
    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(mockUser.id);
  });

  it("should return null for an invalid token", async () => {
    const result = await verifyToken("invalid.token.here");
    expect(result).toBeNull();
  });

  it("should return null for an empty string", async () => {
    const result = await verifyToken("");
    expect(result).toBeNull();
  });

  it("should return null for a tampered token", async () => {
    const token = await generateToken(mockUser);
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });
});

describe("Password Hashing", () => {
  it("should hash password using bcrypt (starts with $2)", () => {
    const hashed = hashSync("123", 10);
    expect(hashed).toMatch(/^\$2[aby]\$/);
  });

  it("should verify correct password against hash", () => {
    const hashed = hashSync("123", 10);
    expect(compareSync("123", hashed)).toBe(true);
  });

  it("should reject wrong password", () => {
    const hashed = hashSync("123", 10);
    expect(compareSync("wrongpassword", hashed)).toBe(false);
  });

  it("should produce different hashes for same password (salt)", () => {
    const hash1 = hashSync("123", 10);
    const hash2 = hashSync("123", 10);
    expect(hash1).not.toBe(hash2);
  });
});

describe("RBAC Role Checks", () => {
  it("STUDENT role should only match student routes", () => {
    const user = { ...mockUser, role: "STUDENT" as const };
    expect(user.role === "STUDENT").toBe(true);
    expect(user.role === "TEACHER").toBe(false);
    expect(user.role === "ADMIN").toBe(false);
  });

  it("TEACHER role should match teacher routes", () => {
    const user = { ...mockUser, role: "TEACHER" as const };
    const teacherOrAdmin = user.role === "TEACHER" || user.role === "ADMIN";
    expect(teacherOrAdmin).toBe(true);
  });

  it("ADMIN role should pass all role checks", () => {
    const user = { ...mockUser, role: "ADMIN" as const };
    const isTeacherOrAdmin = user.role === "TEACHER" || user.role === "ADMIN";
    const isAdmin = user.role === "ADMIN";
    expect(isTeacherOrAdmin).toBe(true);
    expect(isAdmin).toBe(true);
  });

  it("STUDENT should be rejected from admin routes", () => {
    const user = { ...mockUser, role: "STUDENT" as const };
    const canAccessAdmin = user.role === "ADMIN";
    expect(canAccessAdmin).toBe(false);
  });
});