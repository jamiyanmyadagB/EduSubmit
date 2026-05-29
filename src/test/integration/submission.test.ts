import { describe, it, expect } from "vitest";

const ALLOWED = ["pdf", "docx", "zip"];
const MAX_SIZE = 10 * 1024 * 1024;

function validateFile(name: string, size: number) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext)) return { ok: false, error: "Invalid file type" };
  if (size > MAX_SIZE) return { ok: false, error: "File too large" };
  return { ok: true };
}

function deadlinePassed(due: Date) { return new Date() > due; }

function isDuplicate(
  existing: { studentId: number; assignmentId: number; status: string }[],
  sid: number, aid: number
) {
  return existing.some(s => s.studentId === sid && s.assignmentId === aid && s.status !== "DRAFT");
}

describe("File Type Validation", () => {
  it("accepts pdf", () => expect(validateFile("a.pdf", 1024).ok).toBe(true));
  it("accepts docx", () => expect(validateFile("a.docx", 1024).ok).toBe(true));
  it("accepts zip", () => expect(validateFile("a.zip", 1024).ok).toBe(true));
  it("rejects exe", () => expect(validateFile("a.exe", 1024).ok).toBe(false));
  it("rejects png", () => expect(validateFile("a.png", 1024).ok).toBe(false));
  it("rejects no extension", () => expect(validateFile("file", 1024).ok).toBe(false));
  it("case insensitive", () => expect(validateFile("A.PDF", 1024).ok).toBe(true));
});

describe("File Size Validation", () => {
  it("accepts 5MB", () => expect(validateFile("a.pdf", 5 * 1024 * 1024).ok).toBe(true));
  it("accepts exactly 10MB", () => expect(validateFile("a.pdf", MAX_SIZE).ok).toBe(true));
  it("rejects 10MB+1", () => expect(validateFile("a.pdf", MAX_SIZE + 1).ok).toBe(false));
  it("rejects 15MB", () => expect(validateFile("a.pdf", 15 * 1024 * 1024).ok).toBe(false));
});

describe("Deadline Validation", () => {
  it("rejects past deadline", () => {
    expect(deadlinePassed(new Date(Date.now() - 86400000))).toBe(true);
  });
  it("accepts future deadline", () => {
    expect(deadlinePassed(new Date(Date.now() + 86400000))).toBe(false);
  });
});

describe("Duplicate Detection", () => {
  it("detects SUBMITTED duplicate", () => {
    expect(isDuplicate([{ studentId: 1, assignmentId: 1, status: "SUBMITTED" }], 1, 1)).toBe(true);
  });
  it("detects GRADED duplicate", () => {
    expect(isDuplicate([{ studentId: 1, assignmentId: 1, status: "GRADED" }], 1, 1)).toBe(true);
  });
  it("allows resubmit over DRAFT", () => {
    expect(isDuplicate([{ studentId: 1, assignmentId: 1, status: "DRAFT" }], 1, 1)).toBe(false);
  });
  it("allows different assignment", () => {
    expect(isDuplicate([{ studentId: 1, assignmentId: 1, status: "SUBMITTED" }], 1, 2)).toBe(false);
  });
  it("allows different student", () => {
    expect(isDuplicate([{ studentId: 1, assignmentId: 1, status: "SUBMITTED" }], 2, 1)).toBe(false);
  });
  it("handles empty list", () => {
    expect(isDuplicate([], 1, 1)).toBe(false);
  });
});