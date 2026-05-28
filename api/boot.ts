/**
 * EduSubmit Hono Server Bootstrap
 * Configures tRPC handler with local JWT auth context
 */

import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

// 50MB body limit for file uploads
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// tRPC API handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Health check endpoint for Docker
app.get("/actuator/health", (c) => {
  return c.json({
    status: "UP",
    timestamp: new Date().toISOString(),
    service: "edusubmit-backend",
  });
});

// Catch-all for API
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`🚀 EduSubmit server running on http://localhost:${port}/`);
  });
}
