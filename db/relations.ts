/**
 * EduSubmit Database Relations
 * Defines relationships between tables for Drizzle ORM relational queries
 */

import { relations } from "drizzle-orm";
import {
  users,
  assignments,
  submissions,
  grades,
  exams,
  notifications,
  auditLogs,
} from "./schema";

// ─────────────────────────────────────────────
// Users Relations
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  assignments: many(assignments),
  submissions: many(submissions),
  grades: many(grades),
  exams: many(exams),
  notifications: many(notifications),
}));

// ─────────────────────────────────────────────
// Assignments Relations
// ─────────────────────────────────────────────
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(submissions),
}));

// ─────────────────────────────────────────────
// Submissions Relations
// ─────────────────────────────────────────────
export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
  grades: many(grades),
}));

// ─────────────────────────────────────────────
// Grades Relations
// ─────────────────────────────────────────────
export const gradesRelations = relations(grades, ({ one }) => ({
  submission: one(submissions, {
    fields: [grades.submissionId],
    references: [submissions.id],
  }),
  teacher: one(users, {
    fields: [grades.teacherId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Exams Relations
// ─────────────────────────────────────────────
export const examsRelations = relations(exams, ({ one }) => ({
  teacher: one(users, {
    fields: [exams.teacherId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Notifications Relations
// ─────────────────────────────────────────────
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// Audit Logs Relations
// ─────────────────────────────────────────────
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
