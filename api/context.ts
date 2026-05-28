/**
 * EduSubmit tRPC Context Builder
 * Extracts JWT token from Authorization header and loads user
 */

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { verifyToken, loadUserFromToken } from "./local-auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    // Extract Bearer token from Authorization header
    const authHeader = opts.req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = await verifyToken(token);
      if (decoded) {
        const user = await loadUserFromToken(decoded);
        if (user && user.status === "ACTIVE") {
          ctx.user = user;
        }
      }
    }
  } catch {
    // Authentication is optional - endpoints that require auth will check ctx.user
  }

  return ctx;
}
