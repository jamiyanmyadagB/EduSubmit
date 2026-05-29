import { describe, it, expect } from "vitest";
import { hashSync, compareSync } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-secret-key");

async function generateToken(userId: number, email: string, role: string) {
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

describe("JWT Token", () => {
  it("generates a valid JWT with 3 parts", async () => {
    const token = await generateToken(1, "student@gmail.com", "STUDENT");
    expect(token.split(".").length).toBe(3);
  });

  it("payload contains userId, email, role", async () => {
    const token = await generateToken(1, "student@gmail.com", "STUDENT");
    const payload = await verifyToken(token);
    expect(payload?.userId).toBe(1);
    expect(payload?.email).toBe("student@gmail.com");
    expect(payload?.role).toBe("STUDENT");
  });

  it("returns null for invalid token", async () => {
    expect(await verifyToken("bad.token.here")).toBeNull();
  });

  it("returns null for empty string", async () => {
    expect(await verifyToken("")).toBeNull();
  });

  it("returns null for tampered token", async () => {
    const token = await generateToken(1, "x@x.com", "STUDENT");
    expect(await verifyToken(token.slice(0, -4) + "XXXX")).toBeNull();
  });

  it("different users get different tokens", async () => {
    const t1 = await generateToken(1, "a@a.com", "STUDENT");
    const t2 = await generateToken(2, "b@b.com", "TEACHER");
    expect(t1).not.toBe(t2);
  });
});

describe("Password Hashing", () => {
  it("bcrypt hash starts with $2", () => {
    expect(hashSync("123", 10)).toMatch(/^\$2[aby]\$/);
  });

  it("correct password verifies", () => {
    const hash = hashSync("123", 10);
    expect(compareSync("123", hash)).toBe(true);
  });

  it("wrong password fails", () => {
    const hash = hashSync("123", 10);
    expect(compareSync("wrong", hash)).toBe(false);
  });

  it("same password produces different hashes (salt)", () => {
    expect(hashSync("123", 10)).not.toBe(hashSync("123", 10));
  });
});

describe("RBAC Role Logic", () => {
  const canAccess = (role: string, required: string) => role === required;
  const isAdminOrTeacher = (role: string) => role === "ADMIN" || role === "TEACHER";

  it("STUDENT cannot access TEACHER routes", () => {
    expect(canAccess("STUDENT", "TEACHER")).toBe(false);
  });

  it("STUDENT cannot access ADMIN routes", () => {
    expect(canAccess("STUDENT", "ADMIN")).toBe(false);
  });

  it("TEACHER can access TEACHER routes", () => {
    expect(canAccess("TEACHER", "TEACHER")).toBe(true);
  });

  it("ADMIN passes teacher-or-admin check", () => {
    expect(isAdminOrTeacher("ADMIN")).toBe(true);
  });

  it("STUDENT fails teacher-or-admin check", () => {
    expect(isAdminOrTeacher("STUDENT")).toBe(false);
  });
});