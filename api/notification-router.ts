/**
 * EduSubmit Notification Router
 * User notifications for grades, assignments, exams, reminders
 * Base path: /api/notifications
 */

import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationRouter = createRouter({
  // ─── GET /api/notifications ─── (current user's notifications)
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const all = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt));

    return {
      success: true,
      data: all,
      message: "Notifications retrieved",
    };
  }),

  // ─── GET /api/notifications/unread-count ───
  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const all = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id));

    const unread = all.filter((n) => n.isRead === "false").length;

    return {
      success: true,
      data: { count: unread },
      message: "Unread count retrieved",
    };
  }),

  // ─── POST /api/notifications/:id/read ───
  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(notifications)
        .set({ isRead: "true" })
        .where(eq(notifications.id, input.id));

      return {
        success: true,
        message: "Notification marked as read",
      };
    }),

  // ─── POST /api/notifications/read-all ───
  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();

    await db
      .update(notifications)
      .set({ isRead: "true" })
      .where(eq(notifications.userId, ctx.user.id));

    return {
      success: true,
      message: "All notifications marked as read",
    };
  }),
});
