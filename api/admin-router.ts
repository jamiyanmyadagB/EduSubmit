/**
 * EduSubmit Admin Router
 * User management, system stats, audit logs, monitoring data
 * Base path: /api/admin
 * ADMIN role only
 */

import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  users,
  assignments,
  submissions,
  grades,
  exams,
  auditLogs,
} from "@db/schema";
import { eq, desc, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { hashSync } from "bcryptjs";
import { getClientIp } from "./lib/ip";

export const adminRouter = createRouter({
  // ─── GET /api/admin/users ───
  getUsers: adminQuery
    .input(
      z.object({
        role: z.enum(["ALL", "STUDENT", "TEACHER", "ADMIN"]).optional().default("ALL"),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = input || { role: "ALL", search: "" };

      let query = db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          avatar: users.avatar,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      // Apply role filter
      const allUsers = await query;
      let filtered = allUsers;

      if (filters.role && filters.role !== "ALL") {
        filtered = filtered.filter((u) => u.role === filters.role);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search)
        );
      }

      return {
        success: true,
        data: filtered,
        message: "Users retrieved",
      };
    }),

  // ─── POST /api/admin/users ─── (create new user)
  createUser: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(3),
        role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
        status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Check email uniqueness
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already exists" });
      }

      const hashedPassword = hashSync(input.password, 10);

      const [user] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: hashedPassword,
          role: input.role,
          status: input.status,
        })
        .$returningId();

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "CREATE_USER",
        entityType: "user",
        entityId: user.id,
        ipAddress: getClientIp(ctx.req),
        details: `Created user: ${input.email} with role ${input.role}`,
      });

      return {
        success: true,
        data: { id: user.id },
        message: "User created successfully",
      };
    }),

  // ─── PUT /api/admin/users/:id ─── (update user)
  updateUser: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
        status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const updatePayload: Record<string, unknown> = {};
      if (updateData.name) updatePayload.name = updateData.name;
      if (updateData.email) updatePayload.email = updateData.email;
      if (updateData.role) updatePayload.role = updateData.role;
      if (updateData.status) updatePayload.status = updateData.status;
      updatePayload.updatedAt = new Date();

      await db.update(users).set(updatePayload).where(eq(users.id, id));

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "UPDATE_USER",
        entityType: "user",
        entityId: id,
        ipAddress: getClientIp(ctx.req),
        details: `Updated user ID: ${id}`,
      });

      return {
        success: true,
        data: { id },
        message: "User updated successfully",
      };
    }),

  // ─── GET /api/admin/stats ─── (system statistics)
  getStats: adminQuery.query(async () => {
    const db = getDb();

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [activeUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.status, "ACTIVE"));

    const [assignmentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(assignments);

    const [submissionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions);

    const [gradeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(grades);

    const [examCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(exams);

    const [teacherCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "TEACHER"));

    const [studentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "STUDENT"));

    // Calculate today's active users (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayActive] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.lastLogin, today));

    // Pending grading count
    const [pendingGrading] = await db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.status, "SUBMITTED"));

    return {
      success: true,
      data: {
        totalUsers: userCount.count || 0,
        activeUsers: activeUserCount.count || 0,
        todayActiveUsers: todayActive.count || 0,
        totalAssignments: assignmentCount.count || 0,
        totalSubmissions: submissionCount.count || 0,
        totalGrades: gradeCount.count || 0,
        totalExams: examCount.count || 0,
        totalTeachers: teacherCount.count || 0,
        totalStudents: studentCount.count || 0,
        pendingGrading: pendingGrading.count || 0,
        systemHealth: 98, // Simulated health percentage
        storageUsed: 156, // Simulated MB used
      },
      message: "System stats retrieved",
    };
  }),

  // ─── GET /api/admin/audit-logs ───
  getAuditLogs: adminQuery
    .input(
      z.object({
        action: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();

      const all = await db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          ipAddress: auditLogs.ipAddress,
          timestamp: auditLogs.timestamp,
          details: auditLogs.details,
          userName: users.name,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .orderBy(desc(auditLogs.timestamp))
        .limit(500);

      // Apply filters in memory
      let filtered = all;
      if (input?.action) {
        filtered = filtered.filter((l) =>
          l.action?.toLowerCase().includes(input.action!.toLowerCase())
        );
      }

      return {
        success: true,
        data: filtered,
        message: "Audit logs retrieved",
      };
    }),

  // ─── GET /api/admin/alerts ─── (simulated alerts)
  getAlerts: adminQuery.query(() => {
    // Simulated system alerts - in production these would come from Prometheus
    const alerts = [
      {
        id: 1,
        severity: "warning",
        title: "High Response Time",
        message: "API Gateway p95 latency > 500ms for 5 minutes",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        acknowledged: false,
      },
      {
        id: 2,
        severity: "critical",
        title: "Disk Space Low",
        message: "Submission storage at 85% capacity",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        acknowledged: false,
      },
      {
        id: 3,
        severity: "info",
        title: "Daily Backup Complete",
        message: "Database backup completed successfully",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        acknowledged: true,
      },
    ];

    return {
      success: true,
      data: alerts,
      message: "System alerts retrieved",
    };
  }),
});
