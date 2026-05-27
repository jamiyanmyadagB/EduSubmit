/**
 * EduSubmit Auth Module
 * Updated to use local JWT authentication
 * Original OAuth handlers redirected to local auth
 */

import type { Context } from "hono";
import * as jose from "jose";
import { env } from "../lib/env";
import { TRPCError } from "@trpc/server";
import { findUserByEmail, findUserById } from "../queries/users";
import { verifyToken } from "../local-auth";

const jwks = jose.createRemoteJWKSet(
  new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`),
);

/**
 * Authenticate request using local JWT from Authorization header
 * This replaces the old cookie-based session auth
 */
export async function authenticateRequest(headers: Headers) {
  const authHeader = headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No token provided" });
  }

  const token = authHeader.slice(7);
  const decoded = await verifyToken(token);
  if (!decoded) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  const user = await findUserById(decoded.userId);
  if (!user || user.status !== "ACTIVE") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found or inactive" });
  }

  return user;
}

/**
 * OAuth callback handler - redirects to login since we use local auth
 */
export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    // Redirect to local login page - OAuth not used in this setup
    return c.redirect("/login?error=oauth_not_configured", 302);
  };
}

export { jwks };
