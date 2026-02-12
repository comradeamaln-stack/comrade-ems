import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

// Initialize database
export const initDb = async () => {
    // In a real app, you'd use drizzle-kit migrations.
    // For this local demo, we'll just ensure the tables exist if possible.
    // However, it's better to use drizzle-kit push.
};
