/**
 * EduSubmit Main tRPC Router
 * Aggregates all feature routers
 * Routers: localAuth, assignment, submission, grade, exam, notification, admin, ai
 */

import { localAuthRouter } from "./local-auth-router";
import { assignmentRouter } from "./assignment-router";
import { submissionRouter } from "./submission-router";
import { gradeRouter } from "./grade-router";
import { examRouter } from "./exam-router";
import { notificationRouter } from "./notification-router";
import { adminRouter } from "./admin-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  // Health check
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  // ─── Auth Router ───
  localAuth: localAuthRouter,

  // ─── Assignment Router ───
  assignment: assignmentRouter,

  // ─── Submission Router ───
  submission: submissionRouter,

  // ─── Grade Router ───
  grade: gradeRouter,

  // ─── Exam Router ───
  exam: examRouter,

  // ─── Notification Router ───
  notification: notificationRouter,

  // ─── Admin Router ───
  admin: adminRouter,

  // ─── AI Router ───
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
