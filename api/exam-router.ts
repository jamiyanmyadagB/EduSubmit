/**
 * EduSubmit Exam Schedule Router
 * Teachers create/manage exams, students view upcoming
 * Base path: /api/exams
 */

import { z } from "zod";
import { createRouter, teacherQuery, studentQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exams, users } from "@db/schema";
import { eq, desc, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getClientIp } from "./lib/ip";
import { auditLogs } from "@db/schema";

export const examRouter = createRouter({
  // ─── POST /api/exams ─── (TEACHER only)
  create: teacherQuery
    .input(
      z.object({
        title: z.string().min(3, "Title required"),
        subject: z.string().min(1, "Subject required"),
        examType: z.enum(["WRITTEN", "MCQ", "PRACTICAL", "VIVA"]),
        examDate: z.string().datetime(),
        durationMinutes: z.number().int().min(15).max(300),
        venue: z.string().optional(),
        syllabus: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [exam] = await db
        .insert(exams)
        .values({
          title: input.title,
          subject: input.subject,
          examType: input.examType,
          examDate: new Date(input.examDate),
          durationMinutes: input.durationMinutes,
          venue: input.venue,
          syllabus: input.syllabus,
          instructions: input.instructions,
          teacherId: ctx.user.id,
        })
        .$returningId();

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "CREATE_EXAM",
        entityType: "exam",
        entityId: exam.id,
        ipAddress: getClientIp(ctx.req),
        details: `Created exam: ${input.title}`,
      });

      return {
        success: true,
        data: { id: exam.id },
        message: "Exam created successfully",
      };
    }),

  // ─── GET /api/exams/upcoming ─── (STUDENT - next 30 days)
  getUpcoming: studentQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcoming = await db
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        examType: exams.examType,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        venue: exams.venue,
        syllabus: exams.syllabus,
        instructions: exams.instructions,
        teacherId: exams.teacherId,
        createdAt: exams.createdAt,
        teacherName: users.name,
      })
      .from(exams)
      .leftJoin(users, eq(exams.teacherId, users.id))
      .where(gte(exams.examDate, now))
      .orderBy(exams.examDate);

    // Filter to next 30 days
    const filtered = upcoming.filter(
      (e) => e.examDate && new Date(e.examDate) <= thirtyDaysLater
    );

    return {
      success: true,
      data: filtered,
      message: "Upcoming exams retrieved",
    };
  }),

  // ─── GET /api/exams/all ─── (TEACHER/ADMIN)
  getAll: authedQuery.query(async () => {
    const db = getDb();
    const all = await db
      .select({
        id: exams.id,
        title: exams.title,
        subject: exams.subject,
        examType: exams.examType,
        examDate: exams.examDate,
        durationMinutes: exams.durationMinutes,
        venue: exams.venue,
        syllabus: exams.syllabus,
        instructions: exams.instructions,
        teacherId: exams.teacherId,
        createdAt: exams.createdAt,
        updatedAt: exams.updatedAt,
        teacherName: users.name,
      })
      .from(exams)
      .leftJoin(users, eq(exams.teacherId, users.id))
      .orderBy(desc(exams.createdAt));

    return {
      success: true,
      data: all,
      message: "All exams retrieved",
    };
  }),

  // ─── PUT /api/exams/:id ─── (TEACHER only)
  update: teacherQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        subject: z.string().optional(),
        examType: z.enum(["WRITTEN", "MCQ", "PRACTICAL", "VIVA"]).optional(),
        examDate: z.string().datetime().optional(),
        durationMinutes: z.number().int().optional(),
        venue: z.string().optional(),
        syllabus: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      const [existing] = await db
        .select()
        .from(exams)
        .where(eq(exams.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
      }

      if (existing.teacherId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your exam" });
      }

      const updatePayload: Record<string, unknown> = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.subject) updatePayload.subject = updateData.subject;
      if (updateData.examType) updatePayload.examType = updateData.examType;
      if (updateData.examDate) updatePayload.examDate = new Date(updateData.examDate);
      if (updateData.durationMinutes) updatePayload.durationMinutes = updateData.durationMinutes;
      if (updateData.venue !== undefined) updatePayload.venue = updateData.venue;
      if (updateData.syllabus !== undefined) updatePayload.syllabus = updateData.syllabus;
      if (updateData.instructions !== undefined) updatePayload.instructions = updateData.instructions;
      updatePayload.updatedAt = new Date();

      await db.update(exams).set(updatePayload).where(eq(exams.id, id));

      return {
        success: true,
        data: { id },
        message: "Exam updated successfully",
      };
    }),

  // ─── DELETE /api/exams/:id ─── (TEACHER only)
  delete: teacherQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const [existing] = await db
        .select()
        .from(exams)
        .where(eq(exams.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Exam not found" });
      }

      if (existing.teacherId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your exam" });
      }

      await db.delete(exams).where(eq(exams.id, input.id));

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "DELETE_EXAM",
        entityType: "exam",
        entityId: input.id,
        ipAddress: getClientIp(ctx.req),
        details: `Deleted exam: ${existing.title}`,
      });

      return {
        success: true,
        data: { id: input.id },
        message: "Exam deleted successfully",
      };
    }),
});
