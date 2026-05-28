/**
 * EduSubmit Submission Router
 * Handles file uploads, deadline validation, duplicate checking
 * Server-side UTC timestamps only
 * Base path: /api/submissions
 */

import { z } from "zod";
import { createRouter, studentQuery, teacherQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { submissions, assignments, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import { join } from "path";
import { getClientIp } from "./lib/ip";
import { auditLogs } from "@db/schema";

// Upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Allowed file types and max size
const ALLOWED_TYPES = ["pdf", "docx", "zip"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const submissionRouter = createRouter({
  // ─── POST /api/submissions ─── (STUDENT - multipart upload)
  create: studentQuery
    .input(
      z.object({
        assignmentId: z.number(),
        fileBase64: z.string(), // Base64 encoded file
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // ─── Validate file type ───
      const ext = input.fileName.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_TYPES.includes(ext)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        });
      }

      // ─── Validate file size ───
      if (input.fileSize > MAX_FILE_SIZE) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 10MB limit",
        });
      }

      // ─── Check assignment exists and deadline ───
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, input.assignmentId))
        .limit(1);

      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }

      // Check if past due date
      const now = new Date();
      if (assignment.dueDate < now) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deadline has passed. Submission rejected.",
        });
      }

      // ─── Check for duplicate submission ───
      const [existing] = await db
        .select()
        .from(submissions)
        .where(
          and(
            eq(submissions.assignmentId, input.assignmentId),
            eq(submissions.studentId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing && existing.status !== "DRAFT") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already submitted for this assignment",
        });
      }

      // ─── Save file to disk ───
      await mkdir(UPLOAD_DIR, { recursive: true });
      const safeFileName = `${Date.now()}_${ctx.user.id}_${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = join(UPLOAD_DIR, safeFileName);

      try {
        const buffer = Buffer.from(input.fileBase64, "base64");
        await writeFile(filePath, buffer);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save file" });
      }

      // ─── Create or update submission ───
      const submittedAt = new Date(); // Server-side UTC timestamp

      if (existing) {
        // Update draft to submitted
        await db
          .update(submissions)
          .set({
            status: "SUBMITTED",
            submittedAt,
            filePath: safeFileName,
            fileName: input.fileName,
            fileSize: input.fileSize,
            fileType: input.fileType,
            updatedAt: now,
          })
          .where(eq(submissions.id, existing.id));

        // Audit log
        await db.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "SUBMIT_ASSIGNMENT",
          entityType: "submission",
          entityId: existing.id,
          ipAddress: getClientIp(ctx.req),
          details: `Submitted assignment ID: ${input.assignmentId}`,
        });

        return {
          success: true,
          data: { id: existing.id },
          message: "Assignment submitted successfully",
        };
      }

      const [newSubmission] = await db
        .insert(submissions)
        .values({
          assignmentId: input.assignmentId,
          studentId: ctx.user.id,
          status: "SUBMITTED",
          submittedAt,
          filePath: safeFileName,
          fileName: input.fileName,
          fileSize: input.fileSize,
          fileType: input.fileType,
        })
        .$returningId();

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "SUBMIT_ASSIGNMENT",
        entityType: "submission",
        entityId: newSubmission.id,
        ipAddress: getClientIp(ctx.req),
        details: `Submitted assignment ID: ${input.assignmentId}`,
      });

      return {
        success: true,
        data: { id: newSubmission.id },
        message: "Assignment submitted successfully",
      };
    }),

  // ─── GET /api/submissions/student/:studentId ───
  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Students can only view their own submissions
      if (ctx.user.role === "STUDENT" && ctx.user.id !== input.studentId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submissions" });
      }

      const db = getDb();
      const all = await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
          fileName: submissions.fileName,
          fileSize: submissions.fileSize,
          fileType: submissions.fileType,
          aiScore: submissions.aiScore,
          aiFeedback: submissions.aiFeedback,
          finalGrade: submissions.finalGrade,
          teacherFeedback: submissions.teacherFeedback,
          plagiarismScore: submissions.plagiarismScore,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          assignmentTitle: assignments.title,
          assignmentSubject: assignments.subject,
          assignmentMaxScore: assignments.maxScore,
          studentName: users.name,
        })
        .from(submissions)
        .leftJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .leftJoin(users, eq(submissions.studentId, users.id))
        .where(eq(submissions.studentId, input.studentId))
        .orderBy(desc(submissions.createdAt));

      return {
        success: true,
        data: all,
        message: "Student submissions retrieved",
      };
    }),

  // ─── GET /api/submissions/assignment/:assignmentId ───
  getByAssignment: authedQuery
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();

      // Check ownership if teacher
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, input.assignmentId))
        .limit(1);

      if (!assignment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assignment not found" });
      }

      if (ctx.user.role === "TEACHER" && assignment.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your assignment" });
      }

      const all = await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
          fileName: submissions.fileName,
          fileSize: submissions.fileSize,
          fileType: submissions.fileType,
          aiScore: submissions.aiScore,
          aiFeedback: submissions.aiFeedback,
          finalGrade: submissions.finalGrade,
          teacherFeedback: submissions.teacherFeedback,
          plagiarismScore: submissions.plagiarismScore,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          studentName: users.name,
          studentEmail: users.email,
        })
        .from(submissions)
        .leftJoin(users, eq(submissions.studentId, users.id))
        .where(eq(submissions.assignmentId, input.assignmentId))
        .orderBy(desc(submissions.submittedAt));

      return {
        success: true,
        data: all,
        message: "Assignment submissions retrieved",
      };
    }),

  // ─── GET /api/submissions/:id ───
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [submission] = await db
        .select({
          id: submissions.id,
          assignmentId: submissions.assignmentId,
          studentId: submissions.studentId,
          status: submissions.status,
          submittedAt: submissions.submittedAt,
          filePath: submissions.filePath,
          fileName: submissions.fileName,
          fileSize: submissions.fileSize,
          fileType: submissions.fileType,
          aiScore: submissions.aiScore,
          aiFeedback: submissions.aiFeedback,
          finalGrade: submissions.finalGrade,
          teacherFeedback: submissions.teacherFeedback,
          plagiarismScore: submissions.plagiarismScore,
          createdAt: submissions.createdAt,
          updatedAt: submissions.updatedAt,
          studentName: users.name,
          assignmentTitle: assignments.title,
          assignmentMaxScore: assignments.maxScore,
        })
        .from(submissions)
        .leftJoin(users, eq(submissions.studentId, users.id))
        .leftJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .where(eq(submissions.id, input.id))
        .limit(1);

      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      // Students can only view their own
      if (ctx.user.role === "STUDENT" && submission.studentId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your submission" });
      }

      return {
        success: true,
        data: submission,
        message: "Submission retrieved",
      };
    }),

  // ─── GET /api/submissions/pending ─── (TEACHER)
  getPending: teacherQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Get submissions for assignments owned by this teacher
    const teacherAssignments = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(eq(assignments.teacherId, ctx.user.id));

    const assignmentIds = teacherAssignments.map((a) => a.id);
    if (assignmentIds.length === 0) {
      return { success: true, data: [], message: "No pending submissions" };
    }

    // Get all submitted (non-graded) submissions for these assignments
    const all = await db
      .select({
        id: submissions.id,
        assignmentId: submissions.assignmentId,
        studentId: submissions.studentId,
        status: submissions.status,
        submittedAt: submissions.submittedAt,
        fileName: submissions.fileName,
        aiScore: submissions.aiScore,
        plagiarismScore: submissions.plagiarismScore,
        studentName: users.name,
        assignmentTitle: assignments.title,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.studentId, users.id))
      .leftJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(eq(submissions.status, "SUBMITTED"))
      .orderBy(desc(submissions.submittedAt));

    const filtered = all.filter((s) => assignmentIds.includes(s.assignmentId));

    return {
      success: true,
      data: filtered,
      message: "Pending submissions retrieved",
    };
  }),
});
