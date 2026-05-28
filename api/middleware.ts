/**
 * EduSubmit tRPC Middleware
 * Provides: publicQuery, authedQuery, studentQuery, teacherQuery, adminQuery
 * Role-based access control for STUDENT, TEACHER, ADMIN
 */

import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// ─── Authentication Middleware ───
const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Role-based Middleware ───
function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

// ─── Role Combinations ───
const requireTeacherOrAdmin = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user || (ctx.user.role !== "TEACHER" && ctx.user.role !== "ADMIN")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ErrorMessages.insufficientRole,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Procedure Exports ───
export const authedQuery = t.procedure.use(requireAuth);
export const studentQuery = authedQuery.use(requireRole("STUDENT"));
export const teacherQuery = authedQuery.use(requireRole("TEACHER"));
export const adminQuery = authedQuery.use(requireRole("ADMIN"));
export const teacherOrAdminQuery = authedQuery.use(requireTeacherOrAdmin);
