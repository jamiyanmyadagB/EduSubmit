import { Hono } from "hono";
import { z } from "zod";

/**
 * Central REST spec router.
 *
 * NOTE: This file is used by `api/boot.ts`.
 * It forwards REST -> tRPC using the tRPC fetch adapter payload.
 */

export type RestOk<T> = { success: true; data: T; message: string };
export type RestFail = { success: false; data: null; message: string };

type AnyRest = RestOk<any> | RestFail;

const ok = <T,>(data: T, message = "OK"): RestOk<T> => ({
  success: true,
  data,
  message,
});
const fail = (message: string): RestFail => ({ success: false, data: null, message });

function extractBearerToken(req: Request): string | undefined {
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return undefined;
}

function computeBaseUrl(url: string): string {
  // Keep origin only (protocol+host)
  // Example: http://localhost:3000/api/health -> http://localhost:3000
  return url.replace(/\/(api|actuator).*$/, "");
}

function computeOrigin(req: Request): string {
  return computeBaseUrl(req.url);
}

async function callLocalAuthLogin<TInput extends { email: string; password: string }>(opts: {
  req: Request;
  input: TInput;
}): Promise<AnyRest> {
  const { req, input } = opts;

  // Server-side direct caller avoids needing the exact tRPC fetch payload format.

  // Build context using the same logic as the /api/trpc handler.
  const { appRouter } = await import("./router");
  const { createContext } = await import("./context");


  // createContext expects FetchCreateContextFnOptions-like input.
  const fakeResHeaders = new Headers();
  const ctx = await createContext({
    req: req as any,
    resHeaders: fakeResHeaders,
  } as any);

  const caller = appRouter.createCaller(ctx as any);
  const result = await caller.localAuth.login(input as any);

  return ok(result);

}



export const restSpec = new Hono();

// ─────────────────────────────────────────────────────────────
// Public
// ─────────────────────────────────────────────────────────────
restSpec.get("/api/health", (c) => c.json(ok({ status: "UP" })));

restSpec.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const trpc = await callLocalAuthLogin({
    req: c.req.raw,
    input: { email: parsed.data.email, password: parsed.data.password },
  });

  return c.json(trpc);
});

// ─────────────────────────────────────────────────────────────
// Internal helper to call tRPC procedures via the local caller
// ─────────────────────────────────────────────────────────────
async function getCallerWithContext(req: Request) {
  const { appRouter } = await import("./router");
  const { createContext } = await import("./context");

  const fakeResHeaders = new Headers();
  const ctx = await createContext({
    req: req as any,
    resHeaders: fakeResHeaders,
  } as any);

  return appRouter.createCaller(ctx as any);
}

// ─────────────────────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────────────────────
restSpec.get("/api/assignments", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.list();
  return c.json(ok(data));
});

restSpec.post("/api/assignments", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    instructions: z.string().optional(),
    subject: z.string().min(1),
    maxScore: z.number().int().min(1).max(1000).default(100),
    dueDate: z.string().datetime(),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    allowedFileTypes: z.string().default("pdf,docx,zip"),
    maxFileSize: z.number().int().default(10485760),
    referenceFiles: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.create(parsed.data);
  return c.json(ok(data));
});

restSpec.get("/api/assignments/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.getById({ id });
  return c.json(ok(data));
});

restSpec.put("/api/assignments/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json().catch(() => ({}));

  const schema = z.object({
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
  });
  const parsed = schema.safeParse({ ...body, id });
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.update(parsed.data);
  return c.json(ok(data));
});

restSpec.delete("/api/assignments/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.delete({ id });
  return c.json(ok(data));
});

restSpec.get("/api/assignments/teacher/:teacherId", async (c) => {
  const teacherId = Number(c.req.param("teacherId"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.getByTeacher({ teacherId });
  return c.json(ok(data));
});

restSpec.get("/api/assignments/student", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.assignment.getActiveForStudent();
  return c.json(ok(data));
});

// ─────────────────────────────────────────────────────────────
// Submissions
// ─────────────────────────────────────────────────────────────
restSpec.post("/api/submissions", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    assignmentId: z.number(),
    fileBase64: z.string(),
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.submission.create(parsed.data);
  return c.json(ok(data));
});

restSpec.get("/api/submissions/student/:studentId", async (c) => {
  const studentId = Number(c.req.param("studentId"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.submission.getByStudent({ studentId });
  return c.json(ok(data));
});

restSpec.get("/api/submissions/assignment/:assignmentId", async (c) => {
  const assignmentId = Number(c.req.param("assignmentId"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.submission.getByAssignment({ assignmentId });
  return c.json(ok(data));
});

restSpec.get("/api/submissions/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.submission.getById({ id });
  return c.json(ok(data));
});

restSpec.get("/api/submissions/pending", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.submission.getPending();
  return c.json(ok(data));
});

// ─────────────────────────────────────────────────────────────
// Grades
// ─────────────────────────────────────────────────────────────
restSpec.post("/api/grades", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    submissionId: z.number(),
    score: z.number().int(),
    feedback: z.string().optional(),
    comments: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.grade.create(parsed.data);
  return c.json(ok(data));
});

restSpec.get("/api/grades/submission/:submissionId", async (c) => {
  const submissionId = Number(c.req.param("submissionId"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.grade.getBySubmission({ submissionId });
  return c.json(ok(data));
});

restSpec.get("/api/grades/student/:studentId", async (c) => {
  const studentId = Number(c.req.param("studentId"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.grade.getByStudent({ studentId });
  return c.json(ok(data));
});

restSpec.put("/api/grades/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json().catch(() => ({}));

  const schema = z.object({
    id: z.number(),
    score: z.number().int().optional(),
    feedback: z.string().optional(),
    comments: z.string().optional(),
  });
  const parsed = schema.safeParse({ ...body, id });
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.grade.update(parsed.data);
  return c.json(ok(data));
});

// ─────────────────────────────────────────────────────────────
// Exams
// ─────────────────────────────────────────────────────────────
restSpec.post("/api/exams", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    title: z.string().min(3),
    subject: z.string().min(1),
    examType: z.enum(["WRITTEN", "MCQ", "PRACTICAL", "VIVA"]),
    examDate: z.string().datetime(),
    durationMinutes: z.number().int().min(15).max(300),
    venue: z.string().optional(),
    syllabus: z.string().optional(),
    instructions: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.exam.create(parsed.data);
  return c.json(ok(data));
});

restSpec.get("/api/exams/upcoming", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.exam.getUpcoming();
  return c.json(ok(data));
});

restSpec.get("/api/exams/all", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.exam.getAll();
  return c.json(ok(data));
});

restSpec.put("/api/exams/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json().catch(() => ({}));

  const schema = z.object({
    id: z.number(),
    title: z.string().min(3).optional(),
    subject: z.string().optional(),
    examType: z.enum(["WRITTEN", "MCQ", "PRACTICAL", "VIVA"]).optional(),
    examDate: z.string().datetime().optional(),
    durationMinutes: z.number().int().optional(),
    venue: z.string().optional(),
    syllabus: z.string().optional(),
    instructions: z.string().optional(),
  });
  const parsed = schema.safeParse({ ...body, id });
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.exam.update(parsed.data);
  return c.json(ok(data));
});

restSpec.delete("/api/exams/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.exam.delete({ id });
  return c.json(ok(data));
});

// ─────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────
restSpec.get("/api/notifications", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.notification.list();
  return c.json(ok(data));
});

restSpec.get("/api/notifications/unread-count", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.notification.unreadCount();
  return c.json(ok(data));
});

restSpec.post("/api/notifications/:id/read", async (c) => {
  const id = Number(c.req.param("id"));
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.notification.markRead({ id });
  return c.json(ok(data));
});

restSpec.post("/api/notifications/read-all", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.notification.markAllRead();
  return c.json(ok(data));
});

// ─────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────
restSpec.get("/api/admin/users", async (c) => {
  const role = c.req.query("role") as any;
  const search = c.req.query("search") as any;

  const input: any = {
    role: role ? role : undefined,
    search: search ? search : undefined,
  };

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.getUsers(input);
  return c.json(ok(data));
});

restSpec.post("/api/admin/users", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(3),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.createUser(parsed.data);
  return c.json(ok(data));
});

restSpec.put("/api/admin/users/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    id: z.number(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  });
  const parsed = schema.safeParse({ ...body, id });
  if (!parsed.success) return c.json(fail("Invalid request"), 400);

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.updateUser(parsed.data);
  return c.json(ok(data));
});

restSpec.get("/api/admin/stats", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.getStats();
  return c.json(ok(data));
});

restSpec.get("/api/admin/audit-logs", async (c) => {
  const action = c.req.query("action") as any;
  const startDate = c.req.query("startDate") as any;
  const endDate = c.req.query("endDate") as any;

  const input: any = {
    action: action ? action : undefined,
    startDate: startDate ? startDate : undefined,
    endDate: endDate ? endDate : undefined,
  };

  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.getAuditLogs(input);
  return c.json(ok(data));
});

restSpec.get("/api/admin/alerts", async (c) => {
  const caller = await getCallerWithContext(c.req.raw);
  const data = await caller.admin.getAlerts();
  return c.json(ok(data));
});


