/**
 * EduSubmit Database Seed
 * Creates default users and sample data on startup
 * Default passwords: "123" (hashed with bcrypt)
 */

import { getDb } from "../api/queries/connection";
import { users, assignments, exams, auditLogs } from "./schema";
import { hashSync } from "bcryptjs";

async function seed() {
  const db = getDb();
  console.log("🌱 Seeding EduSubmit database...");

  // Hash password "123" with bcrypt (10 rounds)
  const hashedPassword = hashSync("123", 10);

  // ─── Default Users ───
  console.log("Creating default users...");
  const [student] = await db
    .insert(users)
    .values([
      {
        email: "student@gmail.com",
        name: "John Student",
        passwordHash: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE",
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    })
    .$returningId();

  const [teacher] = await db
    .insert(users)
    .values([
      {
        email: "teacher@gmail.com",
        name: "Sarah Teacher",
        passwordHash: hashedPassword,
        role: "TEACHER",
        status: "ACTIVE",
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    })
    .$returningId();

  const [admin] = await db
    .insert(users)
    .values([
      {
        email: "admin@gmail.com",
        name: "Mike Admin",
        passwordHash: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    })
    .$returningId();

  console.log(`✅ Users created: student(${student?.id}), teacher(${teacher?.id}), admin(${admin?.id})`);

  // ─── Sample Assignments ───
  console.log("Creating sample assignments...");
  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
  const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

  await db
    .insert(assignments)
    .values([
      {
        title: "Research Paper: AI in Education",
        description: "Write a 2000-word research paper exploring how AI is transforming modern education.",
        instructions: "Cover topics: adaptive learning, automated grading, plagiarism detection. Use at least 5 academic sources.",
        subject: "Computer Science",
        maxScore: 100,
        dueDate: futureDate1,
        status: "ACTIVE",
        difficulty: "MEDIUM",
        teacherId: teacher.id,
        allowedFileTypes: "pdf,docx",
        maxFileSize: 10485760,
      },
      {
        title: "Calculus Problem Set - Integration",
        description: "Complete problems 1-20 on integration techniques from Chapter 7.",
        instructions: "Show all work. Submit as PDF or DOCX file.",
        subject: "Mathematics",
        maxScore: 50,
        dueDate: futureDate2,
        status: "ACTIVE",
        difficulty: "HARD",
        teacherId: teacher.id,
        allowedFileTypes: "pdf,docx,zip",
        maxFileSize: 10485760,
      },
      {
        title: "Literature Review: Shakespeare",
        description: "Analyze the themes in Hamlet and Macbeth.",
        instructions: "Compare and contrast the tragic elements. 1500 words minimum.",
        subject: "Literature",
        maxScore: 75,
        dueDate: pastDate,
        status: "CLOSED",
        difficulty: "MEDIUM",
        teacherId: teacher.id,
        allowedFileTypes: "pdf,docx",
        maxFileSize: 10485760,
      },
      {
        title: "Python Programming Project",
        description: "Build a data analysis tool using pandas and matplotlib.",
        instructions: "Create a Python script that analyzes a CSV dataset. Include visualizations and a brief report.",
        subject: "Computer Science",
        maxScore: 100,
        dueDate: futureDate2,
        status: "ACTIVE",
        difficulty: "EASY",
        teacherId: teacher.id,
        allowedFileTypes: "pdf,docx,zip",
        maxFileSize: 10485760,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("✅ Sample assignments created");

  // ─── Sample Exams ───
  console.log("Creating sample exams...");
  const examDate1 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const examDate2 = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);

  await db
    .insert(exams)
    .values([
      {
        title: "Midterm Examination: Data Structures",
        subject: "Computer Science",
        examType: "WRITTEN",
        examDate: examDate1,
        durationMinutes: 120,
        venue: "Hall A, Building 3",
        syllabus: "Arrays, Linked Lists, Stacks, Queues, Trees, Graphs",
        instructions: "No calculators allowed. Bring student ID.",
        teacherId: teacher.id,
      },
      {
        title: "Final Exam: Linear Algebra",
        subject: "Mathematics",
        examType: "MCQ",
        examDate: examDate2,
        durationMinutes: 90,
        venue: "Room 201, Building 1",
        syllabus: "Vectors, Matrices, Eigenvalues, Linear Transformations",
        instructions: "Scientific calculator permitted. 50 multiple choice questions.",
        teacherId: teacher.id,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("✅ Sample exams created");

  // ─── Sample Audit Logs ───
  console.log("Creating sample audit logs...");
  await db.insert(auditLogs).values([
    {
      userId: admin.id,
      action: "SYSTEM_INIT",
      entityType: "system",
      ipAddress: "127.0.0.1",
      details: "Database seeded successfully",
    },
    {
      userId: teacher.id,
      action: "CREATE_ASSIGNMENT",
      entityType: "assignment",
      ipAddress: "192.168.1.10",
      details: "Created assignment: Research Paper: AI in Education",
    },
    {
      userId: student.id,
      action: "LOGIN",
      entityType: "user",
      ipAddress: "192.168.1.15",
      details: "User login successful",
    },
  ]);

  console.log("✅ Sample audit logs created");
  console.log("🎉 Database seeding complete!");
  console.log("");
  console.log("┌─────────────────────────────────────┐");
  console.log("│       Default Credentials           │");
  console.log("├─────────────────────────────────────┤");
  console.log("│  student@gmail.com  /  123         │");
  console.log("│  teacher@gmail.com  /  123         │");
  console.log("│  admin@gmail.com    /  123         │");
  console.log("└─────────────────────────────────────┘");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
