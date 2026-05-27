/**
 * EduSubmit Grading Router
 * Teachers grade submissions, students view grades
 * After grading: updates submission status to GRADED + triggers notification
 * Base path: /api/grades
 */

import { z } from "zod";
import { createRouter, teacherQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { grades, submissions, users, assignments, notifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getClientIp } from "./lib/ip";
import { auditLogs } from "@db/schema";

export const gradeRouter = createRouter({
  // ─── POST /api/grades ─── (TEACHER only)
  create: teacherQuery
    .input(
      z.object({
        submissionId: z.number(),
        score: z.number().int().min(0).max(1000),
        feedback: z.string().optional(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Verify submission exists
      const [submission] = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, input.submissionId))
        .limit(1);

      if (!submission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
      }

      // Get assignment to verify ownership
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, submission.assignmentId))
        .limit(1);

      if (assignment && assignment.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your assignment's submission" });
      }

      // Validate score doesn't exceed max
      if (assignment && input.score > assignment.maxScore) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Score cannot exceed max score of ${assignment.maxScore}`,
        });
      }

      // Create grade record
      const [grade] = await db
        .insert(grades)
        .values({
          submissionId: input.submissionId,
          teacherId: ctx.user.id,
          score: input.score,
          feedback: input.feedback,
          comments: input.comments,
        })
        .$returningId();

      // Update submission status to GRADED and set final grade
      await db
        .update(submissions)
        .set({
          status: "GRADED",
          finalGrade: input.score,
          teacherFeedback: input.feedback,
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, input.submissionId));

      // Create notification for student
      await db.insert(notifications).values({
        userId: submission.studentId,
        title: "Your assignment has been graded",
        message: `Your submission for "${assignment?.title || "Assignment"}" has been graded. Score: ${input.score}${assignment ? `/${assignment.maxScore}` : ""}`,
        type: "GRADE",
      });

      // Audit log
      await db.insert(auditLogs).values({
        userId: ctx.user.id,
        action: "GRADE_SUBMISSION",
        entityType: "grade",
        entityId: grade.id,
        ipAddress: getClientIp(ctx.req),
        details: `Graded submission ${input.submissionId}: ${input.score} points`,
      });

      return {
        success: true,
        data: { id: grade.id },
        message: "Grade published successfully",
      };
    }),

  // ─── GET /api/grades/submission/:submissionId ───
  getBySubmission: authedQuery
    .input(z.object({ submissionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [grade] = await db
        .select({
          id: grades.id,
          submissionId: grades.submissionId,
          teacherId: grades.teacherId,
          score: grades.score,
          feedback: grades.feedback,
          comments: grades.comments,
          gradedAt: grades.gradedAt,
          createdAt: grades.createdAt,
          teacherName: users.name,
        })
        .from(grades)
        .leftJoin(users, eq(grades.teacherId, users.id))
        .where(eq(grades.submissionId, input.submissionId))
        .limit(1);

      return {
        success: true,
        data: grade || null,
        message: "Grade retrieved",
      };
    }),

  // ─── GET /api/grades/student/:studentId ───
  getByStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Students can only view their own grades
      if (ctx.user.role === "STUDENT" && ctx.user.id !== input.studentId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your grades" });
      }

      const db = getDb();
      const all = await db
        .select({
          id: grades.id,
          submissionId: grades.submissionId,
          teacherId: grades.teacherId,
          score: grades.score,
          feedback: grades.feedback,
          comments: grades.comments,
          gradedAt: grades.gradedAt,
          teacherName: users.name,
          assignmentTitle: assignments.title,
          assignmentSubject: assignments.subject,
          assignmentMaxScore: assignments.maxScore,
        })
        .from(grades)
        .leftJoin(submissions, eq(grades.submissionId, submissions.id))
        .leftJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .leftJoin(users, eq(grades.teacherId, users.id))
        .where(eq(submissions.studentId, input.studentId))
        .orderBy(desc(grades.gradedAt));

      return {
        success: true,
        data: all,
        message: "Student grades retrieved",
      };
    }),

  // ─── PUT /api/grades/:id ─── (TEACHER only)
  update: teacherQuery
    .input(
      z.object({
        id: z.number(),
        score: z.number().int().min(0).optional(),
        feedback: z.string().optional(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...updateData } = input;

      // Check ownership
      const [existing] = await db
        .select()
        .from(grades)
        .where(eq(grades.id, id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Grade not found" });
      }

      if (existing.teacherId !== ctx.user.id && ctx.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your grade" });
      }

      const updatePayload: Record<string, unknown> = {};
      if (updateData.score !== undefined) updatePayload.score = updateData.score;
      if (updateData.feedback !== undefined) updatePayload.feedback = updateData.feedback;
      if (updateData.comments !== undefined) updatePayload.comments = updateData.comments;
      updatePayload.updatedAt = new Date();

      await db.update(grades).set(updatePayload).where(eq(grades.id, id));

      // If score changed, update submission finalGrade
      if (updateData.score !== undefined) {
        await db
          .update(submissions)
          .set({ finalGrade: updateData.score })
          .where(eq(submissions.id, existing.submissionId));
      }

      return {
        success: true,
        data: { id },
        message: "Grade updated successfully",
      };
    }),
});
