/**
 * EduSubmit Database Schema
 * Complete schema for AI-Powered Academic Assignment Portal
 * Tables: users, assignments, submissions, grades, exams, notifications, audit_logs
 */

import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  bigint,
  decimal,
} from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────
// Users Table
// ─────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT").notNull(),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
  avatar: text("avatar"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────
// Assignments Table
// ─────────────────────────────────────────────
export const assignments = mysqlTable("assignments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  subject: varchar("subject", { length: 100 }).notNull(),
  maxScore: int("max_score").notNull().default(100),
  dueDate: timestamp("due_date").notNull(),
  status: mysqlEnum("status", ["ACTIVE", "CLOSED", "DRAFT"]).default("ACTIVE").notNull(),
  difficulty: mysqlEnum("difficulty", ["EASY", "MEDIUM", "HARD"]).default("MEDIUM").notNull(),
  teacherId: bigint("teacher_id", { mode: "number", unsigned: true }).notNull(),
  allowedFileTypes: varchar("allowed_file_types", { length: 255 }).default("pdf,docx,zip"),
  maxFileSize: int("max_file_size").default(10485760), // 10MB in bytes
  referenceFiles: text("reference_files"), // JSON array of file URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────
// Submissions Table
// ─────────────────────────────────────────────
export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: bigint("assignment_id", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("student_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["DRAFT", "SUBMITTED", "GRADED"]).default("DRAFT").notNull(),
  submittedAt: timestamp("submitted_at"), // Server-side UTC timestamp (immutable)
  filePath: text("file_path"),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: int("file_size"),
  fileType: varchar("file_type", { length: 50 }),
  aiScore: int("ai_score"),
  aiFeedback: text("ai_feedback"),
  finalGrade: int("final_grade"),
  teacherFeedback: text("teacher_feedback"),
  plagiarismScore: decimal("plagiarism_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────
// Grades Table
// ─────────────────────────────────────────────
export const grades = mysqlTable("grades", {
  id: serial("id").primaryKey(),
  submissionId: bigint("submission_id", { mode: "number", unsigned: true }).notNull(),
  teacherId: bigint("teacher_id", { mode: "number", unsigned: true }).notNull(),
  score: int("score").notNull(),
  feedback: text("feedback"),
  comments: text("comments"),
  gradedAt: timestamp("graded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────
// Exams Table
// ─────────────────────────────────────────────
export const exams = mysqlTable("exams", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  examType: mysqlEnum("exam_type", ["WRITTEN", "MCQ", "PRACTICAL", "VIVA"]).notNull(),
  examDate: timestamp("exam_date").notNull(),
  durationMinutes: int("duration_minutes").notNull(),
  venue: varchar("venue", { length: 255 }),
  syllabus: text("syllabus"),
  instructions: text("instructions"),
  teacherId: bigint("teacher_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ─────────────────────────────────────────────
// Notifications Table
// ─────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["ASSIGNMENT", "GRADE", "EXAM", "SYSTEM", "REMINDER"]).notNull(),
  isRead: mysqlEnum("is_read", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────
// Audit Logs Table
// ─────────────────────────────────────────────
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(), // LOGIN, CREATE, UPDATE, DELETE, GRADE, etc.
  entityType: varchar("entity_type", { length: 50 }), // assignment, submission, grade, exam, user
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: text("details"),
});

// ─────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
