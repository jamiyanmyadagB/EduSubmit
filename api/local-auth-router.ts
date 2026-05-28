/**
 * EduSubmit Local Auth Router
 * Endpoints: login, logout, me, refresh
 * Uses JWT tokens (24h expiry) and bcrypt password hashing
 */

import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { authenticateUser, generateToken, verifyToken, loadUserFromToken } from "./local-auth";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import { auditLogs } from "@db/schema";
import { getClientIp } from "./lib/ip";

export const localAuthRouter = createRouter({
  // ─── POST /api/auth/login ───
  login: publicQuery
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await authenticateUser(input.email, input.password);

      if (!user) {
        // Log failed login attempt
        try {
          const db = getDb();
          await db.insert(auditLogs).values({
            action: "LOGIN_FAILED",
            entityType: "user",
            ipAddress: getClientIp(ctx.req),
            details: `Failed login attempt for email: ${input.email}`,
          });
        } catch {
          // Silently fail audit log
        }

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const token = await generateToken(user);

      // Log successful login
      try {
        const db = getDb();
        await db.insert(auditLogs).values({
          userId: user.id,
          action: "LOGIN",
          entityType: "user",
          ipAddress: getClientIp(ctx.req),
          details: `User ${user.email} logged in successfully`,
        });
      } catch {
        // Silently fail audit log
      }

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  // ─── POST /api/auth/logout ───
  logout: authedQuery.mutation(async ({ ctx }) => {
    // Log logout action
    try {
      const db = getDb();
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "LOGOUT",
        entityType: "user",
        ipAddress: getClientIp(ctx.req),
        details: `User ${ctx.user.email} logged out`,
      });
    } catch {
      // Silently fail audit log
    }

    return { success: true, message: "Logged out successfully" };
  }),

  // ─── GET /api/auth/me ───
  me: authedQuery.query((opts) => {
    const user = opts.ctx.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }),

  // ─── POST /api/auth/refresh ───
  refresh: publicQuery
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const decoded = await verifyToken(input.token);
      if (!decoded) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        });
      }

      const user = await loadUserFromToken(decoded);
      if (!user || user.status !== "ACTIVE") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found or inactive",
        });
      }

      const newToken = await generateToken(user);
      return {
        success: true,
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),
});
