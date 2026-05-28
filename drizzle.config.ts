import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default {
  schema: './db/schema.ts', // Ensure this path points to your schema file
  dialect: 'mysql',
  dbCredentials: {
    host: '127.0.0.1',
    port: 3306,
    user: 'edusubmit',
    password: 'edusubmit_pass',
    database: 'edusubmit',
  },
}