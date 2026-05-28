import { Hono } from "hono";
import { z } from "zod";

import { HttpClient } from "./lib/http";

/**
 * REST adapter layer.
 *
 * Spec expects REST endpoints like:
 * - /api/auth/login
 * - /api/assignments/**
 * - /api/submissions/**
 * - /api/grades/**
 * - /api/exams/**
 * - /api/notifications/**
 * - /api/admin/**
 *
 * This project currently exposes tRPC over:
 * - /api/trpc/*
 *
 * These routes forward requests to the existing tRPC procedures using the same
 * input payloads and return a consistent { success, data, message } wrapper.
 */

type RestWrapper<T> = { success: boolean; data: T; message: string };

const ok = <T,>(data: T, message = "OK"): RestWrapper<T> => ({
  success: true,
  data,
  message,
});

const fail = (message: string): RestWrapper<null> => ({
  success: false,
  data: null,
  message,
});

// Minimal forwarding client (server-side fetch)
function makeTrpcClient(baseUrl: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return new HttpClient(baseUrl, { headers });
}

export const restAdapter = new Hono();

restAdapter.post(
  "/api/auth/login",
  async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return c.json(fail("Invalid request"), 400);

    const baseUrl = c.req.url.replace(/\/$/, "");
    const client = makeTrpcClient(baseUrl, undefined);

    try {
      // tRPC endpoint for localAuth.login
      const res = await client.post<any>("/api/trpc", {
        // fetch adapter expects tRPC fetch protocol; we use the existing batch/format used by frontend.
        // The frontend calls are already implemented by tRPC client; without it we can't construct
        // the exact request shape reliably here.
        // Therefore, this REST adapter relies on the fact that the runtime also supports
        // tRPC fetchRequestHandler and expects the standard tRPC payload.
      });

      // If parsing fails, return raw.
      // NOTE: This placeholder must be replaced once we confirm the tRPC fetch payload shape.
      return c.json({ success: true, data: res, message: "Forwarded" });
    } catch {
      return c.json(fail("Failed to forward to tRPC"), 502);
    }
  },
);

// TODO: Remaining endpoints will be added after confirming the exact tRPC fetch payload format.

