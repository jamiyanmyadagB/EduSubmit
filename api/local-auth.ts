/**
 * EduSubmit Local JWT Authentication Module
 * Replaces OAuth with email/password + JWT tokens
 * Uses jose library for JWT operations and bcryptjs for password hashing
 */

import { SignJWT, jwtVerify } from "jose";
import { compareSync } from "bcryptjs";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import type { User } from "@db/schema";

// JWT secret from environment variable or fallback
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "edusubmit-super-secret-key-2024-change-in-production"
);

// Token expiry: 24 hours as specified
const TOKEN_EXPIRY = "24h";

/**
 * Generate JWT token for authenticated user
 * Includes: userId, email, role in the payload
 */
export async function generateToken(user: User): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode JWT token from request
 * Returns user data if valid, null if invalid/expired
 */
export async function verifyToken(
  token: string
): Promise<{ userId: number; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

/**
 * Authenticate user with email and password
 * Returns user object if credentials valid, null otherwise
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;
  if (user.status !== "ACTIVE") return null;

  const valid = compareSync(password, user.passwordHash);
  if (!valid) return null;

  // Update last login timestamp
  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  return user;
}

/**
 * Load full user from decoded token payload
 */
export async function loadUserFromToken(decoded: {
  userId: number;
  email: string;
  role: string;
}): Promise<User | null> {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);
  return user ?? null;
}
