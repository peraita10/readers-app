import pg from "pg";
const { Pool } = pg;
const connectionString = process.env.COMMUNITY_DATABASE_URL;
if (!connectionString) throw new Error("COMMUNITY_DATABASE_URL is required");
export const db = new Pool({ connectionString });
export async function checkDatabase(): Promise<void> { const client = await db.connect(); try { await client.query("SELECT 1"); } finally { client.release(); } }
