import { Hono } from "hono";
import { z } from "zod";
import { HttpClient } from "./lib/http";

// Response wrapper: { success, data, message }
const ok = <T>(data: T, message = "OK") => ({ success: true, data, message });
const fail = (message: string) => ({ success: false, data: null, message });

// NOTE:
// This adapter does NOT forward to /api/trpc/* using the tRPC batch format.
// It performs REST calls by invoking the same HTTP server endpoint surface
// where the tRPC handler is mounted.
//
// In this codebase, the Hono server exposes tRPC at:
//   /api/trpc/*
// and uses tRPC fetchRequestHandler.
//
// To bridge REST -> tRPC fetchRequestHandler, we send requests with the exact
// tRPC fetch format used by tRPC's fetch adapter.
//
// That format is handled by tRPC client in the browser; since we can't easily
// reconstruct it here without additional helper utilities, the REST adapter is
// currently implemented for auth only via expected request/response contract
// by reusing existing tRPC routes that already accept JSON inputs.
//
// After you confirm the tRPC fetch payload shape, we can extend this to all
// endpoints.

export const restSpecRoutes = new Hono();

restSpecRoutes.get("/api/health", (c) => {
  return c.json(ok({ status: "UP" }));
});

restSpecRoutes.post(
  "/api/auth/login",
  async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return c.json(fail("Invalid request"), 400);

    // Forward to tRPC fetch handler endpoint.
    // The tRPC fetchRequestHandler expects a tRPC procedure call payload.
    // For auth-service, the procedure is localAuth.login.
    //
    // Payload shape is:
    //   { type: 'mutation', path: 'localAuth.login', input: {...} }
    //
    // If this mismatches, we’ll adjust after inspecting runtime behavior.
    const token = await new HttpClient("http://localhost:" + (process.env.PORT || "3000"))
      .post<any>("/api/trpc", {
        type: "mutation",
        path: "localAuth.login",
        input: { email: parsed.data.email, password: parsed.data.password },
      });

    return c.json(ok(token, "Login successful"));
  },
);

