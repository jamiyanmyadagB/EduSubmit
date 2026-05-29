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

// NOTE:
// This adapter is kept for future generic REST->tRPC forwarding.
// The currently active REST API surface is implemented in `api/rest-spec-routes.ts`.
//
// Do not block requests here.



