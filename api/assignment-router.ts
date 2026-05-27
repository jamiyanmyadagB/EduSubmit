/**
 * EduSubmit Assignment Router
 * CRUD for assignments - TEACHER creates, STUDENT views
 * Base path: /api/assignments
 */

import { z } from "zod";
import { createRouter, teacherQuery, authedQuery, studentQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assignments, submissions, users } from "@db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getClientIp } from "./lib/ip";
import { auditLogs } from "@db/schema";

export const assignmentRouter = createRouter({
  // ─── POST /api/assignments ─── (TEACHER only)
  create: teacherQuery
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        instructions: z.string().optional(),
        subject: z.string().min(1, "Subject is required"),
        maxScore: z.number().int().min(1).max(1000).default(100),
        dueDate: z.string().datetime(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
        allowedFileTypes: z.string().default("pdf,docx,zip"),
        maxFileSize: z.number().int().default(10485760),
        referenceFiles: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [assignment] = await db.insert(assignments).values({
        title: input.title,
        description: input.description,
        instructions: input.instructions,
        subject: input.subject,
        maxScore: input.maxScore,
        dueDate: new Date(input.dueDate),
        teacherId: ctx.user.id,
        difficulty: input.difficulty,
        allowedFileTypes: input.allowedFileTypes,
        maxFileSize: input.maxFileSize,
        referenceFiles: input.referenceFiles,
        status: "ACTIVE",
      }).$returningId();

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "CREATE_ASSIGNMENT",
        entityType: "assignment",
        entityId: assignment.id,
        ipAddress: getClientIp(ctx.req),
        details: `Created assignment: ${input.title}`,
      });

      const created = await db.select().from(assignments).where(eq(assignments.id, assignment.id)).limit(1);

      return {
        success: true,
        data: created[0],
        message: "Assignment created successfully",
      };
    }),

  // ─── GET /api/assignments ─── (all authenticated)
  list: authedQuery.query(async () => {
    const db = getDb();
    const all = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        instructions: assignments.instructions,
        subject: assignments.subject,
        maxScore: assignments.maxScore,
        dueDate: assignments.dueDate,
        status: assignments.status,
        difficulty: assignments.difficulty,
        teacherId: assignments.teacherId,
        allowedFileTypes: assignments.allowedFileTypes,
        maxFileSize: assignments.maxFileSize,
        referenceFiles: assignments.referenceFiles,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
        teacherName: users.name,
      })
      .from(assignments)
      .leftJoin(users, eq(assignments.teacherId, users.id))
      .orderBy(desc(assignments.createdAt));

    return {
      success: true,
      data: all,
      message: "Assignments retrieved successfully",
    };
  }),

  // ─── GET /api/assignments/:id ───
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [assignment] = await db
        .select({
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          instructions: assignments.instructions,
          subject: assignments.subject,
          maxScore: assignments.maxScore,
          dueDate: assignments.dueDate,
          status: assignments.status,
          difficulty: assignments.difficulty,
          teacherId: assignments.teacherId,
          allowedFileTypes: assignments.allowedFileTypes,
          maxFileSize: assignments.maxFileSize,
          referenceFiles: assignments.referenceFiles,
          createdAt: assignments.createdAt,
          updatedAt: assignments.updatedAt,
          teacherName: users.name,
        })
        .from(assignments)
        .leftJoin(users, eq(assignments.teacherId, users.id))
        .where(eq(assignments.id, input.id))
        .limit(1);

      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }

      return {
        success: true,
        data: assignment,
        message: "Assignment retrieved successfully",
      };
    }),

  // ─── PUT /api/assignments/:id ─── (TEACHER only)
  update: teacherQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        instructions: z.string().optional(),
        subject: z.string().optional(),
        maxScore: z.number().int().optional(),
        dueDate: z.string().datetime().optional(),
        status: z.enum(["ACTIVE", "CLOSED", "DRAFT"]).optional(),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
        allowedFileTypes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      // Check ownership
      const [existing] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }
      if (existing.teacherId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your assignment" });
      }

      const updatePayload: Record<string, unknown> = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.description) updatePayload.description = updateData.description;
      if (updateData.instructions !== undefined) updatePayload.instructions = updateData.instructions;
      if (updateData.subject) updatePayload.subject = updateData.subject;
      if (updateData.maxScore) updatePayload.maxScore = updateData.maxScore;
      if (updateData.dueDate) updatePayload.dueDate = new Date(updateData.dueDate);
      if (updateData.status) updatePayload.status = updateData.status;
      if (updateData.difficulty) updatePayload.difficulty = updateData.difficulty;
      if (updateData.allowedFileTypes) updatePayload.allowedFileTypes = updateData.allowedFileTypes;
      updatePayload.updatedAt = new Date();

      await db.update(assignments).set(updatePayload).where(eq(assignments.id, id));

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "UPDATE_ASSIGNMENT",
        entityType: "assignment",
        entityId: id,
        ipAddress: getClientIp(ctx.req),
        details: `Updated assignment ID: ${id}`,
      });

      return {
        success: true,
        data: { id },
        message: "Assignment updated successfully",
      };
    }),

  // ─── DELETE /api/assignments/:id ─── (TEACHER only)
  delete: teacherQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }
      if (existing.teacherId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your assignment" });
      }

      await db.delete(assignments).where(eq(assignments.id, input.id));

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "DELETE_ASSIGNMENT",
        entityType: "assignment",
        entityId: input.id,
        ipAddress: getClientIp(ctx.req),
        details: `Deleted assignment: ${existing.title}`,
      });

      return {
        success: true,
        data: { id: input.id },
        message: "Assignment deleted successfully",
      };
    }),

  // ─── GET /api/assignments/teacher/:teacherId ───
  getByTeacher: authedQuery
    .input(z.object({ teacherId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const all = await db
        .select({
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          subject: assignments.subject,
          maxScore: assignments.maxScore,
          dueDate: assignments.dueDate,
          status: assignments.status,
          difficulty: assignments.difficulty,
          teacherId: assignments.teacherId,
          allowedFileTypes: assignments.allowedFileTypes,
          createdAt: assignments.createdAt,
          updatedAt: assignments.updatedAt,
          teacherName: users.name,
          submissionCount: submissions.id,
        })
        .from(assignments)
        .leftJoin(users, eq(assignments.teacherId, users.id))
        .leftJoin(submissions, eq(assignments.id, submissions.assignmentId))
        .where(eq(assignments.teacherId, input.teacherId))
        .orderBy(desc(assignments.createdAt));

      return {
        success: true,
        data: all,
        message: "Teacher assignments retrieved successfully",
      };
    }),

  // ─── GET /api/assignments/student ─── (active ones for students)
  getActiveForStudent: studentQuery.query(async ({ ctx }) => {
    const db = getDb();
    const now = new Date();

    const active = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        instructions: assignments.instructions,
        subject: assignments.subject,
        maxScore: assignments.maxScore,
        dueDate: assignments.dueDate,
        status: assignments.status,
        difficulty: assignments.difficulty,
        teacherId: assignments.teacherId,
        allowedFileTypes: assignments.allowedFileTypes,
        maxFileSize: assignments.maxFileSize,
        referenceFiles: assignments.referenceFiles,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
        teacherName: users.name,
      })
      .from(assignments)
      .leftJoin(users, eq(assignments.teacherId, users.id))
      .where(and(
        eq(assignments.status, "ACTIVE"),
        gte(assignments.dueDate, now)
      ))
      .orderBy(assignments.dueDate);

    // Check which assignments the student has already submitted
    const studentSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, ctx.user.id));

    const submittedIds = new Set(studentSubmissions.map((s) => s.assignmentId));

    const enriched = active.map((a) => ({
      ...a,
      hasSubmitted: submittedIds.has(a.id),
    }));

    return {
      success: true,
      data: enriched,
      message: "Active assignments retrieved successfully",
    };
  }),
});
