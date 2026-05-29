import { describe, it, expect } from "vitest";
import { hashSync, compareSync } from "bcryptjs";

const users = [
  { id: 1, email: "student@gmail.com", hash: hashSync("123", 10), role: "STUDENT", active: true },
  { id: 2, email: "teacher@gmail.com", hash: hashSync("123", 10), role: "TEACHER", active: true },
  { id: 3, email: "admin@gmail.com",   hash: hashSync("123", 10), role: "ADMIN",   active: true },
];

const assignments = [
  { id: 1, title: "Research Paper", dueDate: new Date(Date.now() + 86400000 * 7) },
  { id: 2, title: "Late Assignment", dueDate: new Date(Date.now() - 86400000) },
];

const submissions: { id: number; assignmentId: number; studentId: number; status: string }[] = [];
const grades: { id: number; submissionId: number; score: number }[] = [];
const notifications: { userId: number; message: string; read: boolean }[] = [];

function login(email: string, password: string) {
  const u = users.find(u => u.email === email);
  if (!u || !compareSync(password, u.hash) || !u.active) return null;
  return u;
}

function submit(studentId: number, assignmentId: number, fileName: string, size: number) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf","docx","zip"].includes(ext)) throw new Error("Invalid type");
  if (size > 10*1024*1024) throw new Error("Too large");
  const a = assignments.find(a => a.id === assignmentId);
  if (!a) throw new Error("Not found");
  if (new Date() > a.dueDate) throw new Error("Deadline passed");
  if (submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId && s.status !== "DRAFT"))
    throw new Error("Duplicate");
  const sub = { id: submissions.length + 1, assignmentId, studentId, status: "SUBMITTED" };
  submissions.push(sub);
  return sub;
}

function grade(subId: number, score: number) {
  if (score < 0 || score > 100) throw new Error("Invalid score");
  const sub = submissions.find(s => s.id === subId);
  if (!sub) throw new Error("Not found");
  sub.status = "GRADED";
  grades.push({ id: grades.length + 1, submissionId: subId, score });
  notifications.push({ userId: sub.studentId, message: `Graded: ${score}`, read: false });
  return score;
}

describe("Login Flow", () => {
  it("student logs in", () => expect(login("student@gmail.com","123")?.role).toBe("STUDENT"));
  it("teacher logs in", () => expect(login("teacher@gmail.com","123")?.role).toBe("TEACHER"));
  it("admin logs in",   () => expect(login("admin@gmail.com","123")?.role).toBe("ADMIN"));
  it("wrong password fails", () => expect(login("student@gmail.com","wrong")).toBeNull());
  it("unknown email fails",  () => expect(login("nobody@x.com","123")).toBeNull());
  it("inactive user fails", () => {
    users[0].active = false;
    expect(login("student@gmail.com","123")).toBeNull();
    users[0].active = true;
  });
});

describe("Submission Flow", () => {
  it("submits valid pdf", () => {
    const s = submit(1, 1, "essay.pdf", 1024*1024);
    expect(s.status).toBe("SUBMITTED");
  });
  it("blocks duplicate", () => {
    expect(() => submit(1, 1, "again.pdf", 1024)).toThrow("Duplicate");
  });
  it("blocks invalid type", () => {
    expect(() => submit(1, 1, "file.mp4", 1024)).toThrow("Invalid type");
  });
  it("blocks past deadline", () => {
    expect(() => submit(1, 2, "late.pdf", 1024)).toThrow("Deadline passed");
  });
  it("blocks oversized file", () => {
    expect(() => submit(1, 1, "big.pdf", 20*1024*1024)).toThrow("Too large");
  });
});

describe("Grading Flow", () => {
  it("grades submission and notifies student", () => {
    const subId = submissions.find(s => s.status === "SUBMITTED")!.id;
    const score = grade(subId, 88);
    expect(score).toBe(88);
    expect(submissions.find(s => s.id === subId)?.status).toBe("GRADED");
    expect(notifications.some(n => n.message.includes("88"))).toBe(true);
  });
  it("rejects score below 0",   () => expect(() => grade(99, -1)).toThrow("Invalid score"));
  it("rejects score above 100", () => expect(() => grade(99, 101)).toThrow("Invalid score"));
});

describe("Admin Flow", () => {
  it("3 users exist with all roles", () => {
    expect(users.map(u => u.role)).toContain("STUDENT");
    expect(users.map(u => u.role)).toContain("TEACHER");
    expect(users.map(u => u.role)).toContain("ADMIN");
  });
  it("deactivating user blocks login", () => {
    users[1].active = false;
    expect(login("teacher@gmail.com","123")).toBeNull();
    users[1].active = true;
  });
});

describe("Notification Flow", () => {
  it("has unread notifications", () => {
    expect(notifications.some(n => !n.read)).toBe(true);
  });
  it("can mark as read", () => {
    notifications[0].read = true;
    expect(notifications[0].read).toBe(true);
  });
});