/**
 * EduSubmit Environment Configuration
 * Loads env vars with validation
 */

import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: process.env.JWT_SECRET || "edusubmit-super-secret-key-2024-change-in-production",
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  aiEngineUrl: process.env.AI_ENGINE_URL || "http://localhost:5000",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
};
