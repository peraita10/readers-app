import pg from"pg";const{Pool}=pg;const url=process.env.CATALOG_DATABASE_URL;if(!url)throw new Error("CATALOG_DATABASE_URL is required");
export const db=new Pool({connectionString:url});export async function ready(){await db.query("SELECT 1")}
