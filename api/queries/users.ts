/**
 * EduSubmit User Query Helpers
 * Local auth user management
 */

import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser) {
  await getDb().insert(schema.users).values(data);
}

export async function updateUserLastLogin(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastLogin: new Date() })
    .where(eq(schema.users.id, id));
}
